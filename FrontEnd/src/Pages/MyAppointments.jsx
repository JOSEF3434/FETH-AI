import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format, parseISO, isWithinInterval, subMinutes } from "date-fns";
import api from "../api";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => { 
      try {
        setLoading(true);
        console.log('Fetching appointments...'); // Debug log
        const response = await api.get("/appointments/user");
        console.log('Appointments response:', response); // Debug log
        setAppointments(response.data);
      } catch (error) {
        console.error("Failed to fetch appointments:", {
          message: error.message,
          response: error.response,
          config: error.config
        });
        toast.error(error.response?.data?.error || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentTime]); // Re-fetch when current time updates

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      if (response.data) {
        // Update the appointments list with the cancelled appointment
        setAppointments(
          appointments.map((appt) =>
            appt._id === id ? { ...appt, status: "Cancelled" } : appt
          )
        );
        toast.success("Appointment cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel appointment"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      default: // Pending
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const isAppointmentActive = (appointment) => {
    const startTime = parseISO(appointment.appointmentDateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return isWithinInterval(currentTime, {
      start: subMinutes(startTime, 15), // 15 minutes before start
      end: endTime,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You have no upcoming appointments.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className={`p-4 border rounded-lg ${
                isAppointmentActive(appointment)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {appointment.lawyerId?.name || "Lawyer Name Not Available"}
                    <span className="text-sm text-gray-500 ml-2">
                      ({appointment.lawyerLicenseNumber})
                    </span>
                  </h3>
                  <p className="text-gray-700">
                    {format(
                      parseISO(appointment.appointmentDateTime),
                      "EEEE, MMMM d, yyyy h:mm a"
                    )}
                  </p>
                  <p className="mt-1">{appointment.reason}</p>
                  {appointment.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                  {["Pending", "Confirmed"].includes(appointment.status) && (
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {isAppointmentActive(appointment) && (
                <div className="mt-2 text-blue-600 text-sm font-medium">
                  ⏰ Appointment is happening now or soon
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
