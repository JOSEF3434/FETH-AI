import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PaymentButton from "./PaymentButton";
import api from "../api";

const TodayAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user._id) {
          toast.error("User not logged in");
          navigate("/login");
          return;
        }

        const response = await api.get("/appointments/today/all");
        if (!response.data) {
          throw new Error("No data received");
        }
        setAppointments(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(
          error.response?.data?.error || "Failed to fetch appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleCardClick = (appointment) => {
    if (!appointment || !appointment._id) {
      toast.error("Invalid appointment data");
      return;
    }
    navigate(`/appointments/${appointment._id}`, { state: { appointment } });
  };

  const handlePayment = async (appointmentId, e) => {
    e.stopPropagation(); // Prevent card click event
    try {
      const response = await api.post("/payments/initialize", {
        appointmentId
      });
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initiate payment");
    }
  };

  const formatTime = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid time";
    }
  };

  const formatDate = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return "Invalid date";
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Today&apos;s Appointments</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCardClick(appointment)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {appointment.userName || "Client"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {appointment.userEmail}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 text-xs rounded-full mb-1 ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                  {appointment.paymentStatus && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadge(appointment.paymentStatus)}`}
                    >
                      {appointment.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-gray-600 font-medium">With: {appointment.lawyerName}</p>
                <p className="text-sm text-gray-500">Fee: {appointment.lawyerId?.consultationFee || "N/A"} ETB/hr</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-600 mb-1">{appointment.reason}</p>
                  {appointment.notes && (
                    <p className="text-sm text-gray-500">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-medium">
                    {formatTime(appointment.appointmentDateTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(appointment.appointmentDateTime)}
                  </p>
                </div>
              </div>

              {/* Payment button for confirmed appointments */}
              {appointment.status === "Confirmed" && appointment.paymentStatus !== "paid" && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => handlePayment(appointment._id, e)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
<PaymentButton appointment={appointment} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayAppointment;