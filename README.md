# Clintech Co — WiFi Billing System

A complete MikroTik hotspot billing system with Paystack payment integration.

## Project Structure

```
clintech-billing/
├── server.js              # Main Express server
├── mikrotik.js            # MikroTik RouterOS API integration
├── paystack.js            # Paystack payment integration
├── config/
│   └── packages.js        # WiFi packages configuration
├── routes/
│   └── payment.js         # Payment routes & webhook
├── public/
│   ├── index.html         # Payment/package selection page
│   └── success.html       # Success page with credentials
├── .env                   # Environment variables (edit this!)
└── package.json
```

---

## Setup Instructions

### STEP 1 — Install Node.js
Download and install Node.js from https://nodejs.org (LTS version)

### STEP 2 — Copy Project to Your Laptop
Place the `clintech-billing` folder anywhere on your laptop
e.g. `C:\Users\YourName\clintech-billing`

### STEP 3 — Install Dependencies
Open Command Prompt inside the project folder and run:
```
npm install
```

### STEP 4 — Configure .env File
Open the `.env` file and fill in your details:

```env
# Get these from your Paystack dashboard → Settings → API Keys
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx

# Your MikroTik router details
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your_router_password
MIKROTIK_PORT=8728

# Your laptop's IP address on the network
PORT=3000
BASE_URL=http://192.168.88.XX:3000

# Your hotspot name (check in WinBox → IP → Hotspot)
HOTSPOT_NAME=hotspot1
```

### STEP 5 — Enable MikroTik API Port
In WinBox terminal run:
```
/ip service enable api
/ip service set api port=8728
```

### STEP 6 — Configure MikroTik Hotspot Login Page
In WinBox terminal run:
```
/ip hotspot profile set hsprof1 login-by=http-chap http-cookie-lifetime=1d
```

Point the hotspot to your billing server:
```
/ip hotspot profile set hsprof1 login-by=http-chap
/ip hotspot walled-garden add dst-host=192.168.88.XX
/ip hotspot walled-garden ip add dst-address=192.168.88.XX action=accept
```

### STEP 7 — Start the Server
```
npm start
```

You should see:
```
╔═══════════════════════════════════════╗
║     CLINTECH CO BILLING SYSTEM        ║
║     Server running on port 3000       ╗
╚═══════════════════════════════════════╝
```

### STEP 8 — Set Paystack Webhook
In your Paystack dashboard:
- Go to Settings → API Keys & Webhooks
- Set webhook URL to: `http://YOUR_SERVER_IP:3000/payment/webhook`

---

## How It Works

1. Customer connects to WiFi → redirected to login page
2. Customer selects package → enters email → clicks Pay
3. Paystack processes payment (M-Pesa or Card)
4. On success → system auto-creates MikroTik hotspot user
5. Customer gets username/password → logs into hotspot
6. Access expires automatically after package duration

---

## Packages

| Package | Price | Duration | Devices | Speed |
|---|---|---|---|---|
| Starter | KSh 5 | 12 hours | 1 | 10 Mbps |
| Starter Duo | KSh 8 | 12 hours | 2 | 10 Mbps |
| Standard | KSh 10 | 24 hours | 1 | 15 Mbps |
| Standard Duo | KSh 15 | 24 hours | 2 | 15 Mbps |
| Weekly | KSh 50 | 7 days | 1 | 20 Mbps |
| Weekly Duo | KSh 80 | 7 days | 2 | 20 Mbps |
| Monthly | KSh 500 | 30 days | 1 | 30 Mbps |
| Monthly Duo | KSh 700 | 30 days | 2 | 30 Mbps |

---

## Troubleshooting

**MikroTik API connection fails:**
- Check MIKROTIK_HOST, MIKROTIK_USER, MIKROTIK_PASSWORD in .env
- Make sure API service is enabled: `/ip service enable api`
- Make sure your laptop is on the same network as the router

**Paystack payment fails:**
- Confirm you are using LIVE keys for real payments, TEST keys for testing
- Check that KES currency is enabled in your Paystack dashboard

**Hotspot not redirecting:**
- Check walled-garden rules allow your server IP
- Confirm hotspot is active in WinBox → IP → Hotspot

---

## Support
Clintech Co Internal System — Built for MikroTik RB951Ui-2HnD
