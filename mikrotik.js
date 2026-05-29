const RouterOSAPI = require('node-routeros').RouterOSAPI;
require('dotenv').config();

// Connect to MikroTik Router
const getConnection = () => {
  return new RouterOSAPI({
    host: process.env.MIKROTIK_HOST,
    user: process.env.MIKROTIK_USER,
    password: process.env.MIKROTIK_PASSWORD,
    port: parseInt(process.env.MIKROTIK_PORT) || 8728,
    timeout: 10
  });
};

// Generate random username
const generateUsername = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CT';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random password
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create hotspot user after payment
const createHotspotUser = async (packageData, email) => {
  const conn = getConnection();
  const username = generateUsername();
  const password = generatePassword();

  try {
    await conn.connect();

    // Calculate expiry time
    const now = new Date();
    const expiryDate = new Date(now.getTime() + packageData.duration * 60 * 1000);
    const limitUptime = `${packageData.duration}m`;

    // Add hotspot user
    await conn.write('/ip/hotspot/user/add', [
      `=name=${username}`,
      `=password=${password}`,
      `=profile=${packageData.profile}`,
      `=limit-uptime=${limitUptime}`,
      `=comment=Email:${email} Package:${packageData.name} Expires:${expiryDate.toISOString()}`
    ]);

    await conn.close();

    return {
      success: true,
      username,
      password,
      package: packageData.name,
      duration: packageData.duration,
      expiresAt: expiryDate.toISOString()
    };

  } catch (error) {
    console.error('MikroTik error:', error);
    try { await conn.close(); } catch (e) {}
    throw new Error('Failed to create hotspot user: ' + error.message);
  }
};

// Check if user exists
const checkUser = async (username) => {
  const conn = getConnection();
  try {
    await conn.connect();
    const users = await conn.write('/ip/hotspot/user/print', [
      `?name=${username}`
    ]);
    await conn.close();
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    try { await conn.close(); } catch (e) {}
    throw error;
  }
};

// Remove expired user
const removeUser = async (username) => {
  const conn = getConnection();
  try {
    await conn.connect();
    const users = await conn.write('/ip/hotspot/user/print', [
      `?name=${username}`
    ]);
    if (users.length > 0) {
      await conn.write('/ip/hotspot/user/remove', [
        `=.id=${users[0]['.id']}`
      ]);
    }
    await conn.close();
    return true;
  } catch (error) {
    try { await conn.close(); } catch (e) {}
    throw error;
  }
};

module.exports = {
  createHotspotUser,
  checkUser,
  removeUser,
  generateUsername,
  generatePassword
};
