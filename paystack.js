const axios = require('axios');
require('dotenv').config();

const PAYSTACK_BASE = 'https://api.paystack.co';

// Initialize M-Pesa STK Push via Paystack
const initiateMpesaSTK = async (phone, amount, packageId) => {
  try {
    const email = phone + '@clintech.co';
    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        currency: 'KES',
        channels: ['mobile_money'],
        mobile_money: {
          phone,
          provider: 'mpesa'
        },
        metadata: {
          packageId,
          phone,
          cancel_action: `${process.env.BASE_URL}/`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      reference: response.data.data.reference,
      authorizationUrl: response.data.data.authorization_url
    };
  } catch (error) {
    console.error('STK push error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment: ' + (error.response?.data?.message || error.message));
  }
};

// Verify payment by reference
const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Verify error:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
};

// Initialize generic payment (card fallback)
const initializePayment = async (email, amount, packageId, metadata) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        currency: 'KES',
        callback_url: `${process.env.BASE_URL}/payment/verify`,
        metadata: { packageId, ...metadata }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Payment initialization failed');
  }
};

// Validate Paystack webhook signature
const validateWebhook = (payload, signature) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
  return hash === signature;
};

module.exports = { initiateMpesaSTK, verifyPayment, initializePayment, validateWebhook };
