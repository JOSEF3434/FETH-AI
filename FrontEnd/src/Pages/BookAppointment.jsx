import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api";

const BookAppointment = () => {
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [selectedLawyerDetails, setSelectedLawyerDetails] = useState(null);
  const [client, setClient] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  });
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  // Time conversion helpers
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

  const roundToNearestHour = (date) => {
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded;
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) {
      navigate("/login");
      return;
    }

    if (userData.userType === "Lawyer") {
      toast.error("Lawyers cannot book appointments as clients.");
      navigate("/dashboard");
      return;
    }

    setClient(userData);
    setIsLoadingUser(false);

    const fetchLawyers = async () => {
      try {
        const response = await api.get("/lawyer/list");
        setLawyers(response.data);
      } catch (error) {
        console.error("Failed to fetch lawyers:", error);
        toast.error("Failed to load lawyers");
      }
    };
    fetchLawyers();
  }, [navigate]);

  useEffect(() => {
    if (selectedLawyer) {
      const lawyer = lawyers.find((l) => l._id === selectedLawyer);
      setSelectedLawyerDetails(lawyer);
    } else {
      setSelectedLawyerDetails(null);
    }
  }, [selectedLawyer, lawyers]);

  const checkAvailability = async () => {
    if (!selectedLawyer || !client?._id) {
      toast.error("Please select a lawyer and ensure you are logged in");
      return;
    }

    try {
      setIsCheckingAvailability(true);
      setAvailabilityResult(null);

      // Round to nearest hour and convert to UTC
      const roundedTime = roundToNearestHour(selectedDateTime);
      const utcDateTime = convertEthiopianTimeToUTC(roundedTime);

      // Check availability in appointments collection
      const response = await api.post("/appointments/check-availability", {
        userId: client._id,
        lawyerLicenseNumber: selectedLawyerDetails.licenseNumber,
        dateTime: utcDateTime.toISOString(),
      });

      if (response.data.available) {
        setAvailabilityResult({
          available: true,
          message: "Time slot is available!",
          ethiopianTime: convertUTCToEthiopianTime(
            new Date(response.data.timeSlot?.start || utcDateTime)
          ),
        });
        toast.success("Time slot is available!");
      } else {
        setAvailabilityResult({
          available: false,
          message: response.data.message || "Time slot not available",
          suggestedSlots: response.data.suggestedSlots,
        });
        toast.error(response.data.message || "Time slot not available");
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      let errorMessage = "Failed to check availability";

      if (error.response) {
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
    // Round to nearest hour when selecting time
    const rounded = roundToNearestHour(date);
    setSelectedDateTime(rounded);
    setAvailabilityResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLawyer || !selectedDateTime || !reason) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!availabilityResult?.available) {
      toast.error("Please verify availability first");
      return;
    }

    try {
      setLoading(true);

      // Use the rounded time that was checked for availability
      const roundedTime = roundToNearestHour(selectedDateTime);
      const utcAppointmentTime = convertEthiopianTimeToUTC(roundedTime);

      const response = await api.post("/appointments", {
        lawyerId: selectedLawyer,
        lawyerLicenseNumber: selectedLawyerDetails.licenseNumber,
        appointmentDateTime: utcAppointmentTime.toISOString(),
        reason,
        notes: notes || undefined, // Only send if not empty
      });

      if (response.data) {
        toast.success("Appointment booked successfully!");
        // Reset form
        setSelectedLawyer("");
        setSelectedDateTime(roundToNearestHour(new Date()));
        setReason("");
        setNotes("");
        setAvailabilityResult(null);
        // Navigate to appointments page
        navigate("/UserAppointment");
      } else {
        throw new Error("Failed to book appointment");
      }
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

  const formatTimeSlot = (startTime) => {
    const time = new Date(startTime);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lawyer selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Lawyer *
          </label>
          <select
            value={selectedLawyer}
            onChange={(e) => {
              setSelectedLawyer(e.target.value);
              setAvailabilityResult(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Select a lawyer --</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer._id} value={lawyer._id}>
                {lawyer.name} ({lawyer.specialization?.join(", ") || "General"})
                - License: {lawyer.licenseNumber} - Fee: {lawyer.consultationFee || "N/A"} ETB/hr
              </option>
            ))}
          </select>
        </div>

        {/* Display selected lawyer and client details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedLawyer && selectedLawyerDetails && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Lawyer Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedLawyerDetails.name}
                </p>
                <p>
                  <span className="font-medium">License:</span>{" "}
                  {selectedLawyerDetails.licenseNumber}
                </p>
                <p>
                  <span className="font-medium">Specialization:</span>{" "}
                  {selectedLawyerDetails.specialization?.join(", ") ||
                    "General"}
                </p>
                <p>
                  <span className="font-medium">Consultation Fee:</span>{" "}
                  {selectedLawyerDetails.consultationFee || "N/A"} ETB per hour
                </p>
              </div>
            </div>
          )}

          {client && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Your Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {client.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {client.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Date and time picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Date and Time (Ethiopian Time) *
          </label>
          <DatePicker
            selected={selectedDateTime}
            onChange={handleDateChange}
            minDate={new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={60} // 1-hour intervals
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Appointments are booked in 1-hour slots starting at the top of the
            hour
          </p>
        </div>

        {/* Check availability button */}
        <button
          type="button"
          onClick={checkAvailability}
          disabled={
            !selectedLawyer || !selectedDateTime || isCheckingAvailability
          }
          className={`px-4 py-2 rounded-md text-white ${
            isCheckingAvailability
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isCheckingAvailability ? "Checking..." : "Check Availability"}
        </button>

        {/* Availability result */}
        {availabilityResult && (
          <div
            className={`p-4 rounded-md ${
              availabilityResult.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div className="space-y-2">
              <p className="font-medium">{availabilityResult.message}</p>
              {availabilityResult.available ? (
                <p>
                  Your appointment slot:{" "}
                  {formatTimeSlot(availabilityResult.ethiopianTime)} -{" "}
                  {formatTimeSlot(
                    new Date(
                      new Date(availabilityResult.ethiopianTime).getTime() +
                        60 * 60 * 1000
                    )
                  )}
                </p>
              ) : (
                <>
                  {availabilityResult.suggestedSlots?.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Suggested available times:</p>
                      <ul className="list-disc pl-5">
                        {availabilityResult.suggestedSlots.map(
                          (slot, index) => (
                            <li key={index}>
                              {formatTimeSlot(slot.ethiopianTime)} -{" "}
                              {formatTimeSlot(
                                new Date(
                                  new Date(slot.ethiopianTime).getTime() +
                                    60 * 60 * 1000
                                )
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Reason & Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Appointment *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !availabilityResult?.available}
          className={`px-4 py-2 rounded-md text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;