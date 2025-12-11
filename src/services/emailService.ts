import emailjs from '@emailjs/browser';

// Initialize EmailJS (you'll need to set these in your .env file)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface EmailParams {
  to_email: string;
  to_name: string;
  form_link: string;
  charter_date?: string;
  yacht_name?: string;
  charter_type?: string;
}

export const sendCharterFormEmail = async (params: EmailParams): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('EmailJS is not configured. Please set up EmailJS credentials.');
    return false;
  }

  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name,
      form_link: params.form_link,
      charter_date: params.charter_date || 'TBD',
      yacht_name: params.yacht_name || 'TBD',
      charter_type: params.charter_type || 'Charter',
      from_name: 'Your Business Name',
      reply_to: 'contact@example.com',
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

