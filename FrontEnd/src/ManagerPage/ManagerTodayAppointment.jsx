import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';

const ManagerTodaysAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/appointments/today/all');
        
        // Ensure we're working with an array
        const appointmentsData = Array.isArray(response.data) 
          ? response.data 
          : [];
          
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        toast.error(error.response?.data?.error || 'Failed to fetch today\'s appointments');
        setAppointments([]); // Ensure appointments is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCardClick = (appointment) => {
    if (!appointment || !appointment._id) {
      toast.error("Invalid appointment data");
      return;
    }
    navigate(`/manager/appointments/${appointment._id}`, { state: { appointment } });
  };

  const formatTime = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return "Invalid time";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Today's Appointments</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment._id} 
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
              onClick={() => handleCardClick(appointment)}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                {/* Client and Lawyer Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Client: {appointment.userName || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">{appointment.userEmail}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Lawyer: {appointment.lawyerName || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.lawyerLicenseNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-gray-700 font-medium">Reason: {appointment.reason}</p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Time and Status */}
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(appointment.status)} mb-2`}>
                    {appointment.status}
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {formatTime(appointment.appointmentDateTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: 30 mins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerTodaysAppointments;