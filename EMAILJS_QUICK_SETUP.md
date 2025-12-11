# EmailJS Quick Setup Guide

## Step-by-Step Setup

### 1. In EmailJS Dashboard (https://dashboard.emailjs.com/admin)

#### A. Create Email Service
1. Click **Email Services** in left sidebar
2. Click **Add New Service**
3. Choose **Gmail** (or your email provider)
4. Click **Connect Account** and authorize
5. **Copy the Service ID** (looks like `service_xxxxx`)

#### B. Create Email Template
1. Click **Email Templates** in left sidebar
2. Click **Create New Template**
3. **Template Name:** `Charter Registration Form`
4. **Subject:** `Complete Your Charter Registration`
5. **Content:** Copy the HTML from `emailjs-template.html` file in this project
6. **Important:** Make sure these variables are in the template:
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{form_link}}`
   - `{{charter_type}}`
   - `{{charter_date}}`
   - `{{yacht_name}}`
7. **Copy the Template ID** (looks like `template_xxxxx`)

#### C. Get Public Key
1. Click **Account** → **General** in left sidebar
2. Find **Public Key** section
3. **Copy the Public Key** (looks like a long string of characters)

### 2. Add to .env File

Open your `.env` file in the root directory and add these three lines:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Replace:**
- `service_xxxxx` with your actual Service ID
- `template_xxxxx` with your actual Template ID  
- `your_public_key_here` with your actual Public Key

### 3. Restart Development Server

After adding the environment variables, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 4. Test It!

1. Go to admin panel → Charter Management
2. Create or edit a charter form
3. Fill in customer email
4. Lock some fields
5. Click "Save & Send Email to Customer"
6. Check the customer's email inbox!

## Template Variables Reference

Make sure your EmailJS template includes these variables (case-sensitive):

- `{{to_name}}` - Customer's name
- `{{to_email}}` - Customer's email
- `{{form_link}}` - Link to complete the form
- `{{charter_type}}` - Type of charter (e.g., "Full-Day")
- `{{charter_date}}` - Charter date
- `{{yacht_name}}` - Yacht name

## Troubleshooting

**Email not sending?**
- Check browser console (F12) for error messages
- Verify all three variables are in `.env` file
- Make sure variable names in template match exactly (case-sensitive)
- Restart dev server after adding .env variables

**Template variables showing as {{variable_name}}?**
- Make sure variable names match exactly (case-sensitive)
- Check that variables are wrapped in double curly braces: `{{variable}}`

**Rate limits?**
- Free tier: 200 emails/month
- Check usage in EmailJS dashboard

