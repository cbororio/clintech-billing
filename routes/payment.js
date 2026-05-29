const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, validateWebhook, initiateMpesaSTK, checkMpesaStatus } = require('../paystack');
const { createHotspotUser } = require('../mikrotik');
const PACKAGES = require('../config/packages');

// In-memory store for pending payments (use Redis/DB in production)
const pendingPayments = new Map();

// GET /packages
router.get('/packages', (req, res) => {
  res.json({ success: true, packages: PACKAGES });
});

// POST /mpesa/initiate — trigger STK push to phone
router.post('/mpesa/initiate', async (req, res) => {
  const { phone, packageId } = req.body;

  if (!phone || !packageId) {
    return res.status(400).json({ success: false, message: 'Phone number and package are required' });
  }

  const selectedPackage = PACKAGES[packageId];
  if (!selectedPackage) {
    return res.status(400).json({ success: false, message: 'Invalid package selected' });
  }

  // Format phone: ensure it starts with 254
  let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
  if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }

  try {
    const result = await initiateMpesaSTK(formattedPhone, selectedPackage.price, packageId);
    const reference = result.reference;

    // Store pending payment
    pendingPayments.set(reference, {
      phone: formattedPhone,
      packageId,
      status: 'pending',
      createdAt: Date.now()
    });

    res.json({
      success: true,
      reference,
      message: 'STK push sent to your phone. Enter your M-Pesa PIN to complete payment.'
    });
  } catch (error) {
    console.error('STK push error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /mpesa/status — poll payment status
router.get('/mpesa/status/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const verification = await verifyPayment(reference);
    const status = verification.data.status;

    if (status === 'success') {
      const packageId = verification.data.metadata?.packageId;
      const phone = verification.data.metadata?.phone || '';
      const selectedPackage = PACKAGES[packageId];

      if (!selectedPackage) {
        return res.json({ status: 'failed', message: 'Invalid package' });
      }

      // Create hotspot user
      const user = await createHotspotUser(selectedPackage, phone + '@clintech.co');
      pendingPayments.delete(reference);

      return res.json({
        status: 'success',
        username: user.username,
        password: user.password,
        package: selectedPackage.name,
        expires: user.expiresAt,
        label: selectedPackage.label
      });
    }

    if (status === 'failed' || status === 'abandoned') {
      return res.json({ status: 'failed', message: 'Payment was not completed.' });
    }

    res.json({ status: 'pending' });
  } catch (error) {
    res.json({ status: 'pending' });
  }
});

// POST /webhook — Paystack webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!validateWebhook(req.body, signature)) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = JSON.parse(req.body);

  if (event.event === 'charge.success') {
    const { metadata, customer } = event.data;
    const packageId = metadata?.packageId;
    const selectedPackage = PACKAGES[packageId];
    if (selectedPackage) {
      try {
        await createHotspotUser(selectedPackage, customer.email || metadata?.phone + '@clintech.co');
        console.log(`User created - Package: ${selectedPackage.name}`);
      } catch (err) {
        console.error('Webhook error:', err);
      }
    }
  }

  res.sendStatus(200);
});

module.exports = router;
