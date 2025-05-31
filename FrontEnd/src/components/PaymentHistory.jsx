// components/PaymentHistory.jsx
import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/api/payments/history");
        setPayments(response.data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          No payment history found
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">Appointment</h3>
                  <p>
                    {new Date(payment.appointmentId?.appointmentDateTime).toLocaleString()}
                  </p>
                  <p>Status: {payment.appointmentId?.status}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Lawyer</h3>
                  <p>{payment.lawyerId?.firstName} {payment.lawyerId?.lastName}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Payment Details</h3>
                  <p>Amount: {payment.amount} ETB</p>
                  <p>Status: {payment.paymentStatus}</p>
                  <p>
                    Date: {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;