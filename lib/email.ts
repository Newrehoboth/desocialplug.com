import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail';
import React from 'react';

const resendSecret = process.env.RESEND_API_KEY || 're_jEASEnwa_LtU3ojZ3XQ4grz2oiBAz4iu2';
const resend = new Resend(resendSecret);

const FROM_EMAIL = 'De’socialPlug <onboarding@support.desocialplug.com>';

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    console.log(`Attempting to send welcome email to ${email}`);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to DeSocialPlug!',
      react: React.createElement(WelcomeEmail, { username }),
    });

    if (error) {
      console.error('Resend error (welcome):', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetLink: string,
) {
  try {
    console.log(`Attempting to send password reset email to ${email}`);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - De’SocialPlug',
      react: React.createElement(ResetPasswordEmail, { username, resetLink }),
    });

    if (error) {
      console.error('Resend error (reset):', error);
      return { success: false, error };
    }

    console.log('Password reset email sent successfully');
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message || error };
  }
}
