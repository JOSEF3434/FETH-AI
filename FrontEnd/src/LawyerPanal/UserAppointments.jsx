import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get('/api/appointments/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppointments(data);
      } catch (error) {
        toast.error('Failed to fetch appointments');
      }
    };
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id) => {
    try {
      await axios.put(`/api/appointments/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(appointments.filter(app => app._id !== id));
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <div>
      <h2>My Appointments</h2>
      <ul>
        {appointments.map(app => (
          <li key={app._id}>
            {app.date} with {app.lawyerId.name} - {app.status}
            {app.status === 'Scheduled' && <button onClick={() => cancelAppointment(app._id)}>Cancel</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAppointments;