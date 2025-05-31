import  { useState, useEffect } from "react";
import axios from "axios";

const ConfirmAppointment = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/appointments?status=pending")
      .then(response => setAppointments(response.data))
      .catch(error => console.log(error));
  }, []);

  const handleStatusChange = (appointmentId, status) => {
    axios.put(`/api/appointments/${appointmentId}`, { status })
      .then(response => {
        setAppointments(appointments.map((appointment) =>
          appointment._id === appointmentId ? response.data : appointment
        ));
      })
      .catch(error => console.log(error));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Appointment Confirmation/Approval</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id} className="mb-4">
            <p>{appointment.clientName} - {appointment.date} at {appointment.time}</p>
            <button
              onClick={() => handleStatusChange(appointment._id, "confirmed")}
              className="bg-green-500 text-white p-2 rounded mr-2"
            >
              Confirm
            </button>
            <button
              onClick={() => handleStatusChange(appointment._id, "declined")}
              className="bg-red-500 text-white p-2 rounded"
            >
              Decline
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConfirmAppointment;
