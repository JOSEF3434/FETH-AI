import { useState } from "react";
import ViewAppointments from "./ViewAppointments";
import BookAppointment from "./LawyerBookAppointment";
import ConfirmAppointment from "./ConfirmAppointment";
import AppointmentHistory from "./AppointmentHistory";
import NotesForm from "./NotesForm";

const AppointmentDashboard = () => {
  const [selectedFunctionality, setSelectedFunctionality] = useState("viewAppointments");

  const handleNavigationClick = (link) => {
    setSelectedFunctionality(link);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-6 mb-4">
        <button
          className="text-white bg-blue-500 p-2 rounded"
          onClick={() => handleNavigationClick("viewAppointments")}
        >
          View Appointments
        </button>
        <button
          className="text-white bg-blue-500 p-2 rounded"
          onClick={() => handleNavigationClick("bookAppointment")}
        >
          Book Appointment
        </button>
        <button
          className="text-white bg-blue-500 p-2 rounded"
          onClick={() => handleNavigationClick("confirmAppointment")}
        >
          Appointment Confirmation/Approval
        </button>
        <button
          className="text-white bg-blue-500 p-2 rounded"
          onClick={() => handleNavigationClick("appointmentHistory")}
        >
          Appointment History
        </button>
      </div>

      <div className="p-4 border rounded-md shadow-md">
        {selectedFunctionality === "viewAppointments" && <ViewAppointments />}
        {selectedFunctionality === "bookAppointment" && <BookAppointment />}
        {selectedFunctionality === "confirmAppointment" && <ConfirmAppointment />}
        {selectedFunctionality === "appointmentHistory" && <AppointmentHistory />}
      </div>

      {/* Notes Form */}
      <NotesForm />
    </div>
  );
};

export default AppointmentDashboard;
