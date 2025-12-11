# Twilio Setup Guide

Twilio can be used for SMS notifications to send charter form links to customers via text message.

## Option 1: Backend API (Recommended - More Secure)

Since Twilio requires API credentials that shouldn't be exposed in the frontend, you'll need a backend API endpoint.

### Step 1: Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for a free account (includes $15.50 credit for testing)
3. Verify your phone number

### Step 2: Get Twilio Credentials

1. Go to **Console Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Get a **Twilio Phone Number** (free trial number available)

### Step 3: Create Backend API Endpoint

Create a backend endpoint (Node.js/Express example):

```javascript
// server.js or api/send-sms.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to
    });
    
    res.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Step 4: Set Environment Variables

In your backend `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 5: Update Frontend

Set the API endpoint in your `.env`:
```env
VITE_SMS_API_ENDPOINT=https://your-api.com/api/send-sms
```

## Option 2: Firebase Cloud Functions (Serverless)

If you're using Firebase, you can create a Cloud Function:

### Install Firebase Functions

```bash
npm install -g firebase-tools
firebase init functions
```

### Create SMS Function

```javascript
// functions/index.js
const functions = require('firebase-functions');
const twilio = require('twilio');

const accountSid = functions.config().twilio.account_sid;
const authToken = functions.config().twilio.auth_token;
const twilioPhone = functions.config().twilio.phone_number;

const client = twilio(accountSid, authToken);

exports.sendSMS = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated (optional)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  try {
    const { to, message } = data;
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to
    });
    
    return { success: true, sid: result.sid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Set Firebase Config

```bash
firebase functions:config:set twilio.account_sid="ACxxxxx" twilio.auth_token="xxxxx" twilio.phone_number="+1234567890"
```

## Option 3: Vercel Serverless Function

If deploying on Vercel, create `api/send-sms.js`:

```javascript
// api/send-sms.js
const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  const client = twilio(accountSid, authToken);

  try {
    const { to, message } = req.body;
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to
    });
    
    res.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
```

Set environment variables in Vercel dashboard.

## Pricing

- **Free Trial**: $15.50 credit included
- **US SMS**: ~$0.0075 per message
- **International**: Varies by country

## Security Notes

⚠️ **Important**: Never expose Twilio credentials in frontend code. Always use a backend API endpoint or serverless function.

## Integration with Charter Form

Once your backend is set up, the `sendCharterFormSMS` function in `src/services/smsService.ts` will automatically call your API endpoint when sending SMS notifications.

