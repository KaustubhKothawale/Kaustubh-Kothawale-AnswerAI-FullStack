// src/components/VerifyEmail.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const location = useLocation(); 
  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      try {
        const response = await axios.get(`http://localhost:3002/auth/verify-email?token=${token}`);
        alert(response.data.message);
      } catch (error) {
        console.error('Error verifying email', error);
      }
    };

    verifyEmail();
  }, [location.search]);

  return <div>Verifying email...</div>;
};

export default VerifyEmail;
