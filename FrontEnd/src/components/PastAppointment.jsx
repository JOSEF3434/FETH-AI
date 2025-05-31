import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';

const PastAppointment = () => {
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

        const response = await api.get('/appointments/past/all');
        
        // Ensure we're working with an array
        const appointmentsData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.appointments || [];
          
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error(error.response?.data?.error || 'Failed to fetch past appointments');
        setAppointments([]); // Ensure appointments is always an array
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

  const formatDate = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "Invalid time";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Past Appointments</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No past appointments found</p>
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
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
              
              <div className="mb-2">
                <p className="text-gray-600 font-medium">With: {appointment.lawyerName}</p>
                <p className="text-sm text-gray-500">{appointment.lawyerLicenseNumber}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastAppointment;