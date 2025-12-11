# EmailJS Setup Guide

EmailJS allows you to send emails directly from the frontend without a backend server. This is used to automatically send charter registration form links to customers.

## Step 1: Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions to connect your email account
5. Note your **Service ID** (e.g., `service_xxxxx`)

## Step 3: Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template:

**Template Name:** Charter Registration Form

**Subject:** Complete Your Charter Registration

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background: #1557b0; }
    .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Charter Registration Form</h1>
    </div>
    <div class="content">
      <p>Dear {{to_name}},</p>
      
      <p>Thank you for your interest in chartering with us!</p>
      
      <p>Your charter registration form is ready. Some details have been pre-filled based on our conversation. Please complete the remaining fields and submit the form.</p>
      
      <div class="details">
        <p><strong>Charter Details:</strong></p>
        <p>Type: {{charter_type}}</p>
        <p>Date: {{charter_date}}</p>
        <p>Yacht: {{yacht_name}}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{form_link}}" class="button">Complete Registration Form</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #1a73e8;">{{form_link}}</p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>
      <strong>Bella Stone</strong><br>
      Bella Stone, LLC</p>
      
      <div class="footer">
        <p>This email was sent from contact@example.com</p>
      </div>
    </div>
  </div>
</body>
</html>
```

4. Note your **Template ID** (e.g., `template_xxxxx`)

## Step 4: Get Public Key

1. Go to **Account** > **General** in EmailJS dashboard
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)

## Step 5: Add to Environment Variables

Add these to your `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

## Step 6: Test

1. Create a test charter form in the admin panel
2. Fill in customer email and lock some fields
3. Click "Save & Send Email to Customer"
4. Check the customer's email inbox

## Troubleshooting

- **Email not sending**: Check that all three environment variables are set correctly
- **Template variables not working**: Make sure variable names match exactly (case-sensitive)
- **Rate limits**: Free tier allows 200 emails/month. Upgrade if needed.

## Alternative: Manual Email

If EmailJS is not configured, the system will still save the form and provide a link that you can manually copy and send to the customer.

