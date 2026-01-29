# Firestore → Email Notifications (Blaze)

This project currently writes contact form submissions to Firestore (`contactMessages`). To avoid having to check the admin panel, we add a Firebase Cloud Function that emails you whenever a new document is created.

## What gets emailed

On every new `contactMessages/{id}` doc, the function sends an email with:
- Name, email, phone, subject, message
- Image links (if any)
- A link to the Firestore document in the Firebase Console

## Costs

- **Firebase Blaze**: Function invocations (very small at contact-form volume).
- **Microsoft Graph**: Included with Microsoft 365 (no SMTP provider needed).

## One-time setup

### 1) Install Firebase CLI

```bash
npm i -g firebase-tools
firebase login
```

### 2) Connect this repo to your Firebase project

From the repo root:

```bash
firebase use --add
```

Select your existing project (the same one your site already uses).

### 3) Install function dependencies

```bash
cd functions
npm install
```

### 4) Configure Microsoft Graph (recommended for Outlook / Microsoft 365)

The function uses **Microsoft Graph** to send mail from your Microsoft 365 mailbox.

#### 4a) Create an Azure App Registration

1. Go to Azure Portal → **Microsoft Entra ID** → **App registrations** → **New registration**
2. Name: `Bella Stone Contact Notifier` (anything is fine)
3. Supported account types: **Single tenant**
4. Register

Copy these values:
- **Tenant ID** (Directory/tenant ID)
- **Client ID** (Application/client ID)

#### 4b) Create a Client Secret

1. App registration → **Certificates & secrets**
2. **New client secret**
3. Copy the secret **value** (you only see it once)

#### 4c) Grant API permissions (Mail.Send)

1. App registration → **API permissions** → **Add a permission**
2. Microsoft Graph → **Application permissions**
3. Select **Mail.Send**
4. Click **Grant admin consent** (required for application permissions)

#### 4d) Choose the sending mailbox + recipient

- `from_user`: the mailbox to send from (ex: `ryan@bellastone.net`)
- `notify_to`: where notifications should be delivered (can be the same address)

### 5) Deploy the Gen 2 function (recommended)

Firebase does **not** support upgrading a 1st Gen function to 2nd Gen “in place”.
So we deploy the Gen 2 notifier under a new name: `notifyOnNewContactMessageV2`.

Deploy only that function:

```bash
firebase deploy --only "functions:notifyOnNewContactMessageV2" --project bella-stone
```

During deploy, Firebase will prompt you to enter these Secret Manager values:

- `MS_GRAPH_TENANT_ID`
- `MS_GRAPH_CLIENT_ID`
- `MS_GRAPH_CLIENT_SECRET` (secret **value** from Azure)
- `MS_GRAPH_FROM_USER` (ex: `ryan@bellastone.net`)
- `MS_GRAPH_NOTIFY_TO` (your inbox)

### 6) (Optional) Remove the old Gen 1 function later

Once you confirm emails are sending, you can delete the old Gen 1 function to avoid duplicate triggers:

```bash
firebase functions:delete notifyOnNewContactMessage --project bella-stone --force
```

You can list functions anytime with:

```bash
firebase functions:list --project bella-stone
```

## Notes / safety

- The email is sent server-side (Cloud Functions). The frontend does **not** send email directly.
- The function does **not** enable retries to avoid duplicate emails.
- After sending, the function writes a small status object into the same Firestore document under `notification.email`.

