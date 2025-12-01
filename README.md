# Bella New - Website

A modern React + Vite website for your business platform.

## Features

- ✅ Modern React + TypeScript + Vite setup
- ✅ Responsive navigation with all pages
- ✅ Contact form with submission handling
- ✅ Clean, modern UI/UX
- ✅ Admin login functionality
- ✅ Blog post management
- ✅ Charter management system
- ✅ Image library management
- ✅ All pages: Welcome, About, Sailing, Charters, Lessons, Deliveries, Leadership, Wellness, Connect, Blog, Resources

## Project Structure

```
bella-new/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── ContactForm.tsx
│   │   └── admin/        # Admin components
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Sailing.tsx
│   │   ├── Charters.tsx
│   │   ├── Lessons.tsx
│   │   ├── Deliveries.tsx
│   │   ├── Leadership.tsx
│   │   ├── Wellness.tsx
│   │   ├── Connect.tsx
│   │   ├── Blog.tsx
│   │   └── Resources.tsx
│   ├── config/          # Configuration files
│   │   └── firebase.ts
│   ├── services/        # Service integrations
│   │   ├── emailService.ts
│   │   └── smsService.ts
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# EmailJS Configuration (optional)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Setup Instructions

1. **Firebase Setup**: Create a new Firebase project and configure it in `src/config/firebase.ts` or via environment variables. See `FIREBASE_SETUP.md` for detailed instructions.

2. **EmailJS Setup** (optional): If you want to use email functionality, set up EmailJS and configure it. See `EMAILJS_SETUP.md` for instructions.

3. **Twilio Setup** (optional): For SMS functionality, configure Twilio. See `TWILIO_SETUP.md` for instructions.

## Notes

- Logo image should be placed at `public/Logo.png`
- All pages are ready to be customized with your content
- The site is fully responsive and mobile-friendly
- Admin routes are protected and require authentication