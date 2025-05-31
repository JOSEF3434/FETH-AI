import { useEffect, useState } from "react";
import UserSideBar from "./UserSideBar";
import axios from 'axios';

const History = () => {
  const [userHistory, setUserHistory] = useState(null); // To store user history data
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // To manage errors

  useEffect(() => {
    const fetchUserHistory = async () => {
      const storedUser = localStorage.getItem("user");

      // Validate localStorage data
      if (!storedUser) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      const { email } = JSON.parse(storedUser);

      if (!email) {
        setError("Email not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user history from the server
        const response = await fetch( `http://localhost:5000/api/userHistory/${email}`
        );
        // Example of calling the count API
            axios.get(`http://localhost:5000/api/userHistory/count/${email}`)
            .then(response => {
                console.log('Order count:', response.data.count);
            })
            .catch(error => {
                console.error('Error fetching user history count:', error);
            });

        if (!response.ok) {
          throw new Error("Failed to fetch user history");
        }

        const data = await response.json();
        setUserHistory(data);
      } catch (err) {
        console.error("Error fetching user history:", err);
        setError(err.message || "Failed to fetch user history.");
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };

    fetchUserHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userHistory) {
    return <div>No user history available.</div>;
  }

  return (
    <div className="grid md:grid-cols-4">
      <UserSideBar />
      <div className="container mx-auto p-10 col-span-3 text-xl">
        <h1 className="text-2xl font-bold mb-4">User History</h1>
        <div className="mb-4">
          <p>
            <strong>Name:</strong> {userHistory.name}
          </p>
          <p>
            <strong>Email:</strong> {userHistory.email}
          </p>
        </div>
        {userHistory.orders && userHistory.orders.length > 0 ? (
          <ul className="list-disc ml-6">
            {userHistory.orders.map((order, index) => (
              <li key={index} className="mb-2">
                <strong>Dish:</strong> {order.dish} - <strong>Price:</strong> $
                {order.price}
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default History;
