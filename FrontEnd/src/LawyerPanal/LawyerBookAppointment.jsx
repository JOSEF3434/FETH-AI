import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api";

const LawyerBookAppointment = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [workingHours, setWorkingHours] = useState({
    start: 8, // 9 AM Ethiopian time
    end: 19, // 5 PM Ethiopian time
  });
  const navigate = useNavigate();

  // Helper functions for time conversion
  const convertUTCToEthiopianTime = (utcDate) => {
    const ethiopianTime = new Date(utcDate);
    ethiopianTime.setHours(ethiopianTime.getHours() + 3);
    return ethiopianTime;
  };

  const convertEthiopianTimeToUTC = (ethiopianDate) => {
    const utcTime = new Date(ethiopianDate);
    utcTime.setHours(utcTime.getHours() - 3);
    return utcTime;
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Round time to nearest 30 minutes
  const roundToNearest30 = (date) => {
    const minutes = date.getMinutes();
    date.setMinutes(minutes < 30 ? 30 : 0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  // Check if time is in working hours (9AM-5PM Ethiopia time)
  const isDuringWorkingHours = (date) => {
    const ethiopianHour = date.getHours();
    return ethiopianHour >= workingHours.start && ethiopianHour < workingHours.end;
  };

  useEffect(() => {
    // Get logged-in lawyer from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.userType !== "Lawyer") {
      toast.error("Please login as a lawyer to book appointments");
      navigate("/login");
      return;
    }
    setLawyer(userData);

    // Fetch active users with authentication
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users/active", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Failed to load users");
        }
      }
    };
    fetchUsers();

    // Set initial time rounded to next 30 minutes during working hours
    const now = new Date();
    let initialTime = roundToNearest30(
      new Date(now.getTime() + 30 * 60 * 1000)
    );
    
    // If initial time is outside working hours, set to next working day at 9AM
    if (!isDuringWorkingHours(initialTime)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(workingHours.start, 0, 0, 0);
      initialTime = tomorrow;
    }
    
    setSelectedDateTime(initialTime);
  }, [navigate, workingHours]);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u._id === selectedUser);
      setSelectedUserDetails(user);
    } else {
      setSelectedUserDetails(null);
    }
  }, [selectedUser, users]);

  const checkAvailability = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (!isDuringWorkingHours(selectedDateTime)) {
      toast.error(`Appointments are only available between ${workingHours.start}:00 AM and ${workingHours.end}:00 PM Ethiopia time`);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      setAvailabilityResult(null);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate("/login");
        return;
      }

      // Convert to UTC and format for API
      const utcDateTime = convertEthiopianTimeToUTC(selectedDateTime);
      const isoDateTime = utcDateTime.toISOString();

      // Check both user and lawyer availability for 1-hour slot
      const [userResponse, lawyerResponse] = await Promise.all([
        api.get(`/lawyerappointments/user-availability/${selectedUser}`, {
          params: {
            dateTime: isoDateTime,
            duration: 60, // 1 hour duration
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get(`/lawyerappointments/slots/${lawyer.licenseNumber}`, {
          params: {
            dateTime: isoDateTime,
            duration: 60, // 1 hour duration
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const userAvailable = userResponse.data.available;
      const lawyerAvailable = lawyerResponse.data.available;
      const bothAvailable = userAvailable && lawyerAvailable;

      // Get lawyer's working hours if available
      const lawyerWorkingHours = lawyerResponse.data.workingHours || workingHours;
      setWorkingHours(lawyerWorkingHours);

      setAvailabilityResult({
        available: bothAvailable,
        userAvailable,
        lawyerAvailable,
        message: bothAvailable
          ? "Both parties are available for this 1-hour appointment"
          : "One or both parties are not available for this time slot",
        userMessage:
          userResponse.data.message ||
          (userAvailable
            ? "User available for this time slot"
            : "User has a conflict during this time"),
        lawyerMessage:
          lawyerResponse.data.message ||
          (lawyerAvailable
            ? "You are available for this time slot"
            : "You have a conflict during this time"),
        conflictingAppointments: {
          user: userResponse.data.conflictingAppointment,
          lawyer: lawyerResponse.data.conflictingAppointment,
        },
        suggestedSlots: [
          ...(userResponse.data.suggestedSlots || []),
          ...(lawyerResponse.data.suggestedSlots || []),
        ],
      });

      if (bothAvailable) {
        toast.success("Both parties are available for this 1-hour appointment");
      } else {
        const messages = [];
        if (!userAvailable) messages.push("User is not available");
        if (!lawyerAvailable) messages.push("You are not available");
        toast.error(messages.join(" and "));
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      let errorMessage = "Failed to check availability";

      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
        errorMessage = error.response.data?.error || error.response.statusText;
      } else if (error.request) {
        errorMessage = "No response from server";
      }

      toast.error(errorMessage);
      setAvailabilityResult({
        available: false,
        message: errorMessage,
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDateChange = (date) => {
    const roundedDate = roundToNearest30(date);
    setSelectedDateTime(roundedDate);
    setAvailabilityResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedDateTime || !reason) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!availabilityResult?.available) {
      toast.error("Please verify availability first");
      return;
    }

    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate("/login");
        return;
      }

      // Convert Ethiopian time back to UTC before sending to backend
      const utcAppointmentTime = convertEthiopianTimeToUTC(selectedDateTime);

      const response = await api.post(
        "/lawyerappointments",
        {
          userId: selectedUser,
          lawyerId: lawyer._id,
          lawyerLicenseNumber: lawyer.licenseNumber,
          appointmentDateTime: utcAppointmentTime,
          duration: 60, // 1 hour duration
          reason,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Booking failed:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.error || "Failed to book appointment"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Book New Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Client *
          </label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setAvailabilityResult(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Select a client --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Display selected user and lawyer details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedUserDetails && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Client Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedUserDetails.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedUserDetails.email}
                </p>
                {selectedUserDetails.phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedUserDetails.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {lawyer && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">
                Your Details (Lawyer)
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {lawyer.name}
                </p>
                <p>
                  <span className="font-medium">License:</span>{" "}
                  {lawyer.licenseNumber}
                </p>
                <p>
                  <span className="font-medium">Specialization:</span>{" "}
                  {lawyer.specialization?.join(", ") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Working Hours:</span>{" "}
                  {workingHours.start}:00 AM - {workingHours.end}:00 PM (Ethiopia Time)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Date and time picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Date and Time (Ethiopian Time) *
          </label>
          <DatePicker
            selected={selectedDateTime}
            onChange={handleDateChange}
            minDate={new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            filterTime={(time) => isDuringWorkingHours(time)}
            inline
          />
          <p className="text-sm text-gray-500 mt-1">
            Appointments are for 1-hour duration starting at the selected time (between {workingHours.start}:00 AM and {workingHours.end}:00 PM Ethiopia time)
          </p>
        </div>

        {/* Check availability button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={checkAvailability}
            disabled={
              !selectedUser || !selectedDateTime || isCheckingAvailability
            }
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isCheckingAvailability
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCheckingAvailability
              ? "Checking Availability..."
              : "Check 1-Hour Availability"}
          </button>

          {selectedDateTime && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Selected:</span>
              <span className="text-gray-700">
                {selectedDateTime.toLocaleDateString()} at{" "}
                {formatTime(selectedDateTime)}
              </span>
            </div>
          )}
        </div>

        {/* Availability result */}
        {availabilityResult && (
          <div
            className={`p-4 rounded-md border ${
              availabilityResult.available
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="space-y-3">
              <h3 className="font-bold text-lg">
                {availabilityResult.available ? "✅ Available" : "❌ Not Available"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User availability */}
                <div className={`p-3 rounded ${
                  availabilityResult.userAvailable 
                    ? "bg-green-100" 
                    : "bg-red-100"
                }`}>
                  <h4 className="font-medium">Client Availability:</h4>
                  <p>{availabilityResult.userMessage}</p>
                  {availabilityResult.conflictingAppointments?.user && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Conflict with:</p>
                      <p>
                        {new Date(availabilityResult.conflictingAppointments.user.dateTime).toLocaleString()}
                      </p>
                      <p>Status: {availabilityResult.conflictingAppointments.user.status}</p>
                    </div>
                  )}
                </div>

                {/* Lawyer availability */}
                <div className={`p-3 rounded ${
                  availabilityResult.lawyerAvailable 
                    ? "bg-green-100" 
                    : "bg-red-100"
                }`}>
                  <h4 className="font-medium">Your Availability:</h4>
                  <p>{availabilityResult.lawyerMessage}</p>
                  {availabilityResult.conflictingAppointments?.lawyer && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Conflict with:</p>
                      <p>
                        {new Date(availabilityResult.conflictingAppointments.lawyer.dateTime).toLocaleString()}
                      </p>
                      <p>Status: {availabilityResult.conflictingAppointments.lawyer.status}</p>
                    </div>
                  )}
                </div>
              </div>

              {availabilityResult.suggestedSlots?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Suggested available time slots:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availabilityResult.suggestedSlots
                      .slice(0, 6) // Show max 6 suggestions
                      .map((slot, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            const ethiopianTime = convertUTCToEthiopianTime(new Date(slot.start));
                            setSelectedDateTime(ethiopianTime);
                            setAvailabilityResult(null);
                          }}
                        >
                          <div className="font-medium">
                            {new Date(slot.start).toLocaleDateString()}
                          </div>
                          <div>
                            {formatTime(new Date(slot.start))} - {formatTime(new Date(slot.end))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason & Notes */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Appointment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
              placeholder="Briefly describe the reason for this appointment"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any additional information or documents needed"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !availabilityResult?.available}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              loading || !availabilityResult?.available
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Booking Appointment..." : "Confirm 1-Hour Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LawyerBookAppointment;