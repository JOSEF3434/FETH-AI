import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'completed', 'cancelled'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all past appointments (regardless of status)
        const response = await api.get("/lawyerappointments/past/all");
        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setError("Failed to load appointment history");
        toast.error("Failed to load appointment history");
        
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "all") return true;
    return appointment.status.toLowerCase() === filter.toLowerCase();
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = new Date(appointment.appointmentDateTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointment History</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 rounded-md ${filter === "completed" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-3 py-1 rounded-md ${filter === "cancelled" ? "bg-red-500 text-white" : "bg-gray-200"}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No past appointments found
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">{date}</h3>
              <div className="space-y-3">
                {dateAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className={`p-4 rounded-lg shadow-sm border ${
                      appointment.status === "Completed"
                        ? "border-green-200 bg-green-50"
                        : appointment.status === "Cancelled"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {appointment.userName || "Client"} - {appointment.reason}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointmentDateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {appointment.notes && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-medium">Client:</span> {appointment.userName}
                      </p>
                      <p>
                        <span className="font-medium">Contact:</span> {appointment.userEmail}
                        {appointment.userPhone && ` | ${appointment.userPhone}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;