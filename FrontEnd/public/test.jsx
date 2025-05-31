import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isToday } from "date-fns";

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/appointments/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Check if response.data is an array, if not, try to access the correct property
        const appointmentsData = Array.isArray(response.data)
          ? response.data
          : response.data.appointments || response.data.data || [];

        // Filter for appointments with status Pending or Confirmed
        const filteredApps = appointmentsData.filter(
          (app) =>
            app && (app.status === "Pending" || app.status === "Confirmed")
        );

        setAppointments(filteredApps);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch appointments");
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Refresh the appointments list
      const updatedApps = appointments.map((app) =>
        app._id === appointmentId ? { ...app, status: newStatus } : app
      );
      setAppointments(updatedApps);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const filteredAppointments = showTodayOnly
    ? appointments.filter((app) => isToday(parseISO(app.appointmentDateTime)))
    : appointments;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {showTodayOnly ? "Today's Appointments" : "All Appointments"}
        </h1>
        <button
          onClick={() => setShowTodayOnly(!showTodayOnly)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          {showTodayOnly
            ? "Show All Appointments"
            : "Show Today's Appointments"}
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No appointments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {appointment.userEmail?.name || "Client"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {format(
                        parseISO(appointment.appointmentDateTime),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Reason for Visit
                    </h3>
                    <p className="mt-1 text-gray-900">{appointment.reason}</p>
                  </div>

                  {appointment.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Additional Notes
                      </h3>
                      <p className="mt-1 text-gray-900">{appointment.notes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Contact Information
                    </h3>
                    <p className="mt-1 text-gray-900">
                      Email: {appointment.userEmail?.email || "N/A"}
                      <br />
                      Phone: {appointment.userEmail?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  {appointment.status === "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Confirmed")
                        }
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Cancelled")
                        }
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === "Confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "Completed")
                      }
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;

<>
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaLock } from "react-icons/fa";

const LawyerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/lawyers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Validate response
      if (!data.lawyer || !data.lawyer._id || !data.token) {
        throw new Error("Invalid login response from server");
      }

      // Process profile picture
      const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.includes("http")) return profilePicture;
        if (profilePicture.startsWith("/uploads/")) {
          return `http://localhost:4000${profilePicture}`;
        }
        return `http://localhost:4000/uploads/${profilePicture}`;
      };

      const profilePicUrl = getProfilePictureUrl(data.lawyer.profilePicture);

      // Prepare user data
      const userData = {
        _id: data.lawyer._id,
        name:
          data.lawyer.name ||
          `${data.lawyer.firstName || ""} ${data.lawyer.lastName || ""}`.trim(),
        email: data.lawyer.email,
        profilePicture: profilePicUrl,
        userType: "Lawyer",
        licenseNumber: data.lawyer.licenseNumber,
        specialization: data.lawyer.specialization
          ? Array.isArray(data.lawyer.specialization)
            ? data.lawyer.specialization
            : [data.lawyer.specialization]
          : [],
        city: data.lawyer.city,
        region: data.lawyer.region,
        languagesSpoken: data.lawyer.languagesSpoken
          ? Array.isArray(data.lawyer.languagesSpoken)
            ? data.lawyer.languagesSpoken
            : [data.lawyer.languagesSpoken]
          : ["English"],
        yearsOfExperience: data.lawyer.yearsOfExperience || 0,
      };
console.log("the loged in lawyer license number is :  ",userData.licenseNumber),
      // Store data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Success
      toast.success("Login successful!", {
        position: "top-right",
        onClose: () => navigate("/lawyerdashboard"),
      });
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
      toast.error(error.message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 md:p-2">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Lawyer Login
              </h1>
              <p className="text-gray-600">
                Sign in to your professional dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/lawyer/signup"
                  className="text-blue-600 hover:underline"
                >
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LawyerLogin;</>

<>
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Assuming you have an auth context

const ManagerTodayAppointment = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/appointments/today/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Ensure we always set an array, even if response.data is null/undefined
        setAppointments(Array.isArray(response.data) ? response.data : []);
        setError('');
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
        setAppointments([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/appointments/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setAppointments(appointments.map(appt => 
        appt._id === id ? { ...appt, status: newStatus } : appt
      ));
      
      if (selectedAppointment?._id === id) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update appointment status');
    }
  };

  if (!Array.isArray(appointments)) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Appointments data is not in the expected format. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  } 

  const formatTime = (dateTime) => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Africa/Addis_Ababa' // Ethiopia timezone
    };
    return new Date(dateTime).toLocaleTimeString('en-US', options);
  };

  const formatDate = (dateTime) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Africa/Addis_Ababa'
    };
    return new Date(dateTime).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments today</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have any appointments scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Today's Appointments</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <div 
            key={appointment._id}
            onClick={() => setSelectedAppointment(appointment)}
            className={`cursor-pointer bg-white overflow-hidden shadow rounded-lg border-l-4 ${
              appointment.status === 'Confirmed' ? 'border-green-500' :
              appointment.status === 'Pending' ? 'border-yellow-500' :
              appointment.status === 'Cancelled' ? 'border-red-500' :
              'border-blue-500'
            } hover:shadow-md transition-shadow duration-200`}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {/*user.userType === 'Manager' ? 
                    appointment.userEmail?.name || 'Client' : 
                    appointment.lawyerId?.name || 'Manager'*/}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {formatTime(appointment.appointmentDateTime)}
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {appointment.reason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedAppointment(null)}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Appointment Details
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(selectedAppointment.appointmentDateTime)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">With</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {/*user.userType === 'Lawyer' ? 
                        selectedAppointment.userEmail?.name || 'Client' : 
                        selectedAppointment.lawyerId?.name || 'Lawyer'*/}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatTime(selectedAppointment.appointmentDateTime)}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reason</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.reason}
                    </dd>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedAppointment.notes}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                { selectedAppointment.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedAppointment._id, 'Confirmed')}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                  >
                    Confirm Appointment
                  </button>
                )}
                
                {selectedAppointment.status === 'Pending' || selectedAppointment.status === 'Confirmed' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedAppointment._id, 'Cancelled')}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel Appointment
                  </button>
                ) : null}
                
                { selectedAppointment.status === 'Confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedAppointment._id, 'Completed')}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  >
                    Mark as Completed
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

export default ManagerTodayAppointment;</>