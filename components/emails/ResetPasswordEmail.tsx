import * as React from 'react';

interface ResetPasswordEmailProps {
  username: string;
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  username,
  resetLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
    <h1 style={{ color: '#000' }}>Reset Your Password</h1>
    <p>Hi {username},</p>
    <p>
      You requested to reset your password. Click the link below to set a new
      password:
    </p>
    <p>
      <a
        href={resetLink}
        style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}
      >
        Reset Password
      </a>
    </p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
    <p>
      Best regards,
      <br />
      The De’SocialPlug Team
    </p>
  </div>
);

export default ResetPasswordEmail;
