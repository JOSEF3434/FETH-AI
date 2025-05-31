import axios from 'axios';
import { chapaConfig } from '../config/chapaConfig.js';

const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_AUTH_KEY = chapaConfig.chapaSecretKey;

export const initiateChapaPayment = async (paymentData) => {
  try {
    // Log Chapa API URL and Authorization Key
    console.log('Chapa API URL:', CHAPA_API_URL);
    console.log('Chapa Auth Key:', CHAPA_AUTH_KEY);

    console.log('Payment Data:', paymentData);

    const response = await axios.post(
      CHAPA_API_URL,
      {
        amount: paymentData.amount,
        currency: 'ETB',
        email: paymentData.customerEmail,
        first_name: paymentData.customerFirstName,
        last_name: paymentData.customerLastName,
        tx_ref: paymentData.tx_ref,
        callback_url: `${chapaConfig.baseUrl}/api/payments/chapa/callback`,
        // return_url: `${chapaConfig.baseUrl}/api/payments/chapa/verify/${paymentData.tx_ref}`,
        customization: {
          title: 'Food Order',  // Updated to meet the 16 characters limit
          description: 'Payment for your food order',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log the response data from Chapa API
    console.log('Chapa Payment Initiation Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Chapa payment initiation error:', error.response?.data || error.message);
    throw new Error('Failed to initiate Chapa payment');
  }
};

export const verifyChapaPayment = async (tx_ref) => {
  try {
    // Log Chapa API URL and Authorization Key
    console.log('Verifying Chapa Payment with tx_ref:', tx_ref);
    console.log('Chapa Auth Key:', CHAPA_AUTH_KEY);

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
        },
      }
    );

    // Log the response data from Chapa API
    console.log('Chapa Payment Verification Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Chapa payment verification error:', error.response?.data || error.message);
    throw new Error('Failed to verify Chapa payment');
  }
};
