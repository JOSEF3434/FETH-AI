export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Returns true if token exists, false otherwise
};

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");

    if (!user) {
      console.warn("User data not found in localStorage.");
      return null;
    }

    return JSON.parse(user); // Ensure valid JSON parsing
  } catch (error) {
    console.error("Error parsing user data:", error.message);
    return null;
  }
};
