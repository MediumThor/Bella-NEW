// Twilio SMS Service
// Note: Twilio requires a backend server for security (API keys shouldn't be exposed in frontend)
// This is a client-side helper that calls a backend API endpoint

export interface SMSParams {
  to_phone: string;
  form_link: string;
  charter_date?: string;
  customer_name?: string;
}

export const sendCharterFormSMS = async (params: SMSParams): Promise<boolean> => {
  // For production, this should call your backend API endpoint
  // Example: POST /api/send-sms
  const API_ENDPOINT = import.meta.env.VITE_SMS_API_ENDPOINT || '/api/send-sms';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to_phone,
        message: `Hi${params.customer_name ? ` ${params.customer_name}` : ''}! Your charter registration form is ready. Complete it here: ${params.form_link}`,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('SMS API error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Alternative: Direct Twilio client (requires backend proxy for security)
// This would be used in a Node.js backend, not in the frontend

