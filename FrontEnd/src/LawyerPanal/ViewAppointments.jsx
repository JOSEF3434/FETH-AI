import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isToday } from "date-fns";
import { toast } from "react-hot-toast";

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("Authentication required. Please log in again.");
          setError("Authentication token missing");
          setLoading(false);
          return;
        }
        
        const api = axios.create({
          baseURL: "http://localhost:4000",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        // Add error logging for the request
        console.log("Making request with token:", token);
        
        const response = await api.get("/api/lawyerappointments/today/all", {
          validateStatus: function (status) {
            return status < 500; // Reject only if status is >= 500
          }
        });
    
        console.log("Full response:", response);
    
        if (response.status === 200) {
          setAppointments(response.data);
          setError(null);
        } else {
          setError(response.data?.error || "Failed to fetch appointments");
          toast.error(response.data?.error || "Failed to fetch appointments");
        }
      } catch (err) {
        console.error("Detailed error:", err);
        console.error("Error response data:", err.response?.data);
        console.error("Error config:", err.config);
        
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.message || 
                            err.message || 
                            "Failed to fetch appointments";
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, []);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      const api = axios.create({
        baseURL: "http://localhost:4000",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Use the correct endpoint based on the action
      let endpoint = `/api/lawyerappointments/${appointmentId}/status`;
      if (newStatus === "Completed") {
        endpoint = `/api/lawyerappointments/${appointmentId}/complete`;
      } else if (newStatus === "Cancelled") {
        endpoint = `/api/lawyerappointments/${appointmentId}/cancel`;
      }

      await api.put(endpoint, { status: newStatus });

      // Update the local state
      const updatedApps = appointments.map(app => 
        app._id === appointmentId ? { ...app, status: newStatus } : app
      );
      setAppointments(updatedApps);
      
      // Also update the selected appointment if it's the one being modified
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }

      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      console.error("Status update error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message || 
        err.message ||
        "Failed to update status";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Today's Appointments</h1>

      {appointments.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No appointments scheduled for today.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {appointment.userName}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {format(
                        new Date(appointment.appointmentDateTime),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                    <p className="mt-1 text-gray-900">{appointment.reason}</p>
                  </div>
                </div>

                {appointment.status === "Pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(appointment._id, "Confirmed");
                    }}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Confirm Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {selectedAppointment.userName}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {format(
                      new Date(selectedAppointment.appointmentDateTime),
                      "EEEE, MMMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {selectedAppointment.reason}
                  </p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <p className="mt-1 text-gray-900">
                    Email: {selectedAppointment.userEmail}<br />
                    Phone: {selectedAppointment.userPhone || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                      ${
                        selectedAppointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedAppointment.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : selectedAppointment.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedAppointment.status === "Pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, "Confirmed");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, "Cancelled");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {selectedAppointment.status === "Confirmed" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, "Completed");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, "Cancelled");
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {(selectedAppointment.status === "Completed" || selectedAppointment.status === "Cancelled") && (
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;