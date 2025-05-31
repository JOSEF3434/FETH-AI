import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import api from '../api';

const LawyerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Upcoming');
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/lawyer/all');
        setAppointments(response.data);
      } catch (error) {
        toast.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setAppointments(appointments.map(appt => 
        appt._id === id ? { ...appt, status } : appt
      ));
      toast.success(`Appointment marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const now = new Date();
    const apptTime = new Date(appt.appointmentDateTime);
    
    if (selectedStatus === 'Upcoming') {
      return (appt.status === 'Pending' || appt.status === 'Confirmed') && apptTime > now;
    } else if (selectedStatus === 'Past') {
      return apptTime <= now;
    }
    return true;
  });

  const getStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Completed', 'Cancelled'];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lawyer Dashboard</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedStatus('Upcoming')}
          className={`px-4 py-2 rounded-md ${
            selectedStatus === 'Upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Upcoming Appointments
        </button>
        <button
          onClick={() => setSelectedStatus('Past')}
          className={`px-4 py-2 rounded-md ${
            selectedStatus === 'Past'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Past Appointments
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {selectedStatus.toLowerCase()} appointments found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Client</th>
                <th className="py-2 px-4 border-b">Date & Time</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => {
                const statusOptions = getStatusOptions(appointment.status);
                const apptTime = new Date(appointment.appointmentDateTime);
                const isPast = apptTime <= new Date();
                
                return (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {appointment.userId?.name || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {format(apptTime, 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {appointment.reason}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        appointment.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {statusOptions.length > 0 && !isPast ? (
                        <div className="flex space-x-2">
                          {statusOptions.map(option => (
                            <button
                              key={option}
                              onClick={() => handleStatusChange(appointment._id, option)}
                              className={`px-2 py-1 text-xs rounded-md ${
                                option === 'Cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                option === 'Completed' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              Mark as {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LawyerDashboard;