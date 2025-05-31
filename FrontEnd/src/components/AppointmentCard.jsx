import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AppointmentCard = ({ 
  appointment, 
  showDate = false, 
  showStatus = true,
  clickable = true 
}) => {
  const navigate = useNavigate();

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      Completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const handleClick = () => {
    if (clickable) {
      navigate(`/appointments/${appointment._id}`);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 ${clickable ? 'hover:shadow-lg cursor-pointer transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">
            {appointment.lawyerId?.name || appointment.userId?.name}
          </h3>
          {appointment.lawyerId?.specialization && (
            <p className="text-sm text-gray-500">
              {appointment.lawyerId.specialization}
            </p>
          )}
        </div>
        {showStatus && getStatusBadge(appointment.status)}
      </div>

      <p className="text-gray-600 mb-2">{appointment.reason}</p>

      <div className="flex justify-between items-center">
        <div>
          {showDate && (
            <p className="text-sm text-gray-500 mb-1">
              {formatDate(appointment.appointmentDateTime)}
            </p>
          )}
          <p className="text-blue-600 font-medium">
            {formatTime(appointment.appointmentDateTime)}
          </p>
        </div>

        {appointment.lawyerId?.licenseNumber && (
          <p className="text-xs text-gray-500">
            License: {appointment.lawyerId.licenseNumber}
          </p>
        )}
      </div>

      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {appointment.notes}
          </p>
        </div>
      )}
    </div>
  );
};

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    lawyerId: PropTypes.shape({
      name: PropTypes.string,
      specialization: PropTypes.string,
      licenseNumber: PropTypes.string
    }),
    userId: PropTypes.shape({
      name: PropTypes.string
    }),
    appointmentDateTime: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    notes: PropTypes.string,
    status: PropTypes.oneOf(['Pending', 'Confirmed', 'Cancelled', 'Completed']).isRequired
  }).isRequired,
  showDate: PropTypes.bool,
  showStatus: PropTypes.bool,
  clickable: PropTypes.bool
};

export default AppointmentCard;