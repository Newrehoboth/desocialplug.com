import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ username }) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
    <h1 style={{ color: '#000' }}>Welcome to DeSocialPlug, {username}!</h1>
    <p>
      We are thrilled to have you on board. DeSocialPlug is your one-stop shop
      for social media growth and services.
    </p>
    <p>Here is what you can do next:</p>
    <ul>
      <li>Explore our services</li>
      <li>Top up your wallet</li>
      <li>Boost your social presence</li>
    </ul>
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>
      Best regards,
      <br />
      The De’SocialPlug Team
    </p>
  </div>
);

export default WelcomeEmail;
