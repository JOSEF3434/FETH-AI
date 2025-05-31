import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RiceptionSideBar from './RiceptionSideBar';

const ChangePass = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Retrieve user email from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const email = storedUser?.email;

    const handleChangePassword = async (e) => {
      e.preventDefault();
  
      if (!email) {
          toast.error('User email not found. Please log in again.');
          return;
      }
  
      if (newPassword !== confirmPassword) {
          toast.error('New password and confirm password do not match.');
          return;
      }
  
      try {
          setLoading(true);
          console.log('Requesting password change:', { email, currentPassword, newPassword });
  
          const response = await axios.put('http://localhost:5000/api/users/change-password', {
              email,
              currentPassword,
              newPassword,
          });
  
          toast.success(response.data.message || 'Password changed successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
      } catch (error) {
          console.error('Error changing password:', error.response?.data || error.message);
  
          toast.error(
              error.response?.data?.error || 'Failed to change password. Please try again.'
          );
      } finally {
          setLoading(false);
      }
  };
  

    return (
      <div className="grid md:grid-cols-4">
        <RiceptionSideBar />
        <div className="container mx-auto p-5 col-span-3">
          <div className="p-5 bg-gray-300 h-screen flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
                  <h1 className="text-2xl font-semibold mb-6">Change Password</h1>
                  <form onSubmit={handleChangePassword}>
                      <input
                          type="password"
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="bg-gray-100 border rounded-lg p-3 mb-4 w-full"
                      />
                      <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="bg-gray-100 border rounded-lg p-3 mb-4 w-full"
                      />
                      <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-gray-100 border rounded-lg p-3 mb-4 w-full"
                      />
                      <button
                          type="submit"
                          disabled={loading}
                          className={`bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg w-full ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                          {loading ? 'Changing...' : 'Change Password'}
                      </button>
                  </form>
              </div>
            </div>
        </div>
        </div>
    );
};

export default ChangePass;
