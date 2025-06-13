import React from 'react';
import { Html, Button, Img } from '@react-email/components';

export default function NewUser({ link, email }: { link: string; email: string }) {
  return (
    <Html>
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <Img src="/images/logo.png" alt="ROBOKOP Logo" width="100" />
        <h1 style={{ color: '#333' }}>Welcome to ROBOKOP</h1>
        <p style={{ color: '#555' }}>
          Hi {email},<br />
          Click the button below to activate your account. This link is valid for{' '}
          <strong>15 minutes</strong>.
        </p>
        <Button
          href={link}
          style={{
            backgroundColor: '#007bff',
            color: '#ffffff',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Activate Account
        </Button>
        <p style={{ color: '#555' }}>If you did not request this, please ignore this email.</p>
        <p style={{ color: '#555' }}>
          If you have any questions, feel free to contact us at{' '}
          <a href="mailto:support@robokop.org">support@robokop.org</a>
        </p>
      </div>
    </Html>
  );
}
