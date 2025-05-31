import { useState } from "react";
import PropTypes from 'prop-types';
import api from "../api";
import { toast } from "react-hot-toast";

const PaymentButton = ({ appointment = {} }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      if (!appointment?._id) {
        throw new Error("Invalid appointment data");
      }

      const response = await api.post("/payments/initialize", {
        appointmentId: appointment._id
      });

      // Redirect to Chapa payment page
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }

    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(
        error.response?.data?.error || error.message || "Failed to initiate payment"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Safely get payment status with fallback
  const paymentStatus = appointment?.paymentStatus || 'unpaid';
  const isPaid = paymentStatus === 'paid';
  const isDisabled = isProcessing || isPaid;

  return (
    <button
      onClick={handlePayment}
      disabled={isDisabled}
      className={`px-4 py-2 rounded-md text-white ${
        isDisabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isProcessing
        ? "Processing..."
        : isPaid
        ? "Paid"
        : "Pay Now"}
    </button>
  );
};

PaymentButton.propTypes = {
  appointment: PropTypes.shape({
    _id: PropTypes.string,
    paymentStatus: PropTypes.oneOf(['unpaid', 'pending', 'paid', 'failed'])
  })
};

PaymentButton.defaultProps = {
  appointment: {
    _id: '',
    paymentStatus: 'unpaid'
  }
};

export default PaymentButton;