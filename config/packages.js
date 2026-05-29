// Clintech Co - WiFi Packages Configuration

const PACKAGES = {
  'starter': {
    id: 'starter',
    name: 'Starter',
    price: 5,
    duration: 720,       // 12 hours in minutes
    devices: 1,
    speed: '10M/10M',
    profile: 'starter',
    label: '12 Hours • 1 Device • 10 Mbps'
  },
  'starter-duo': {
    id: 'starter-duo',
    name: 'Starter Duo',
    price: 8,
    duration: 720,
    devices: 2,
    speed: '10M/10M',
    profile: 'starter-duo',
    label: '12 Hours • 2 Devices • 10 Mbps'
  },
  'standard': {
    id: 'standard',
    name: 'Standard',
    price: 10,
    duration: 1440,      // 24 hours in minutes
    devices: 1,
    speed: '15M/15M',
    profile: 'standard',
    label: '24 Hours • 1 Device • 15 Mbps'
  },
  'standard-duo': {
    id: 'standard-duo',
    name: 'Standard Duo',
    price: 15,
    duration: 1440,
    devices: 2,
    speed: '15M/15M',
    profile: 'standard-duo',
    label: '24 Hours • 2 Devices • 15 Mbps'
  },
  'weekly': {
    id: 'weekly',
    name: 'Weekly',
    price: 50,
    duration: 10080,     // 7 days in minutes
    devices: 1,
    speed: '20M/20M',
    profile: 'weekly',
    label: '7 Days • 1 Device • 20 Mbps'
  },
  'weekly-duo': {
    id: 'weekly-duo',
    name: 'Weekly Duo',
    price: 80,
    duration: 10080,
    devices: 2,
    speed: '20M/20M',
    profile: 'weekly-duo',
    label: '7 Days • 2 Devices • 20 Mbps'
  },
  'monthly': {
    id: 'monthly',
    name: 'Monthly',
    price: 500,
    duration: 43200,     // 30 days in minutes
    devices: 1,
    speed: '30M/30M',
    profile: 'monthly',
    label: '30 Days • 1 Device • 30 Mbps'
  },
  'monthly-duo': {
    id: 'monthly-duo',
    name: 'Monthly Duo',
    price: 700,
    duration: 43200,
    devices: 2,
    speed: '30M/30M',
    profile: 'monthly-duo',
    label: '30 Days • 2 Devices • 30 Mbps'
  }
};

module.exports = PACKAGES;
