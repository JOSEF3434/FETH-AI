import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${appointmentId}`);
        setAppointment(response.data);
      } catch (error) {
        toast.error('Failed to load appointment details');
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Appointments
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
            <span className={`px-3 py-1 text-sm rounded-full ${
              appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
              appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {appointment.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            {formatDateTime(appointment.appointmentDateTime)}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Client Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {appointment.userName}</p>
                <p><span className="font-medium">Email:</span> {appointment.userEmail}</p>
              </div>
            </div>

            {/* Lawyer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Lawyer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {appointment.lawyerName}</p>
                <p><span className="font-medium">License:</span> {appointment.lawyerLicenseNumber}</p>
                <p><span className="font-medium">Email:</span> {appointment.lawyerEmail}</p>
                <p><span className="font-medium">Phone:</span> {appointment.lawyerphone}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-800 mb-3">Appointment Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Reason:</span> {appointment.reason}</p>
              {appointment.notes && (
                <p>
                  <span className="font-medium">Notes:</span> 
                  <span className="ml-2 text-gray-700">{appointment.notes}</span>
                </p>
              )}
              <p><span className="font-medium">Created At:</span> {new Date(appointment.createdAt).toLocaleString()}</p>
              {appointment.updatedAt && (
                <p><span className="font-medium">Last Updated:</span> {new Date(appointment.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
          {appointment.status === 'Pending' && (
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
              Remind
            </button>
          )}
          {/*appointment.status === 'Confirmed' && (
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
              Mark as Completed
            </button>
          )}
          {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
              Cancel Appointment
            </button>
          )*/}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;