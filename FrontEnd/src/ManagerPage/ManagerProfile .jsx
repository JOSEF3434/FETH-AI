import { useEffect, useState } from 'react';
import UserSideBar from './UserSideBar';
//import { getToken } from './auth'; // Assume you have a function to get the JWT token

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getToken = () => {
      return localStorage.getItem('token'); // Adjust the key as needed
    };
    const fetchUser = async () => {
      const token = getToken(); // Get the JWT token from local storage or context
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: token,
          },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  if (user) return <div>
      <UserSideBar/></div>;

  const firstNameInitial = user.name.split(' ')[0][0];
  const lastNameInitial = user.name.split(' ')[1][0];

  return (
    <div className='grid md:grid-cols-4'>
      <UserSideBar/>
      <div className="flex flex-col items-center mt-10">
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl text-white">
          {firstNameInitial}{lastNameInitial}
        </div>
        <h2 className="mt-4 text-xl font-bold">{user.data}</h2>
      </div>
    </div>
  );
};

export default UserProfile;
