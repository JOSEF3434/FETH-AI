import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StarIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext";

const LawyerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyerDetails = async () => {
      try {
        setIsLoading(true);
        const [lawyerResponse, ratingsResponse] = await Promise.all([
          fetch(`http://localhost:4000/api/lawyers/${id}`),
          fetch(`http://localhost:4000/api/lawyers/${id}/ratings`),
        ]);

        const lawyerData = await lawyerResponse.json();
        const ratingsData = await ratingsResponse.json();

        setLawyer(lawyerData);
        setRatings(ratingsData.ratings || []);
        setAverageRating(ratingsData.averageRating || 0);

        // Check if current user has already rated
        if (user) {
          const userRating = ratingsData.ratings?.find(
            (r) => r.userId._id === user._id
          );
          if (userRating) {
            setHasRated(true);
            setUserRating(userRating.rating);
            setReview(userRating.review || "");
          }

          // User can rate if:
          // 1. They are logged in
          // 2. They are not rating themselves
          // 3. They haven't already rated
          setCanRate(
            user._id !== lawyerData._id &&
              !ratingsData.ratings?.some((r) => r.userId._id === user._id)
          );
        }
      } catch (error) {
        console.error("Error fetching lawyer details:", error);
        toast.error("Failed to fetch lawyer details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLawyerDetails();
  }, [id, user]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to rate this lawyer");
      return;
    }

    if (!canRate) {
      toast.error("You are not allowed to rate this lawyer");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/lawyers/${id}/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: userRating,
            review,
            lawyerId: id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Rating submitted successfully");
        // Update local state without refetching
        const newRating = {
          _id: data._id,
          userId: user,
          rating: userRating,
          review,
          createdAt: new Date().toISOString(),
        };

        setRatings((prev) => [...prev, newRating]);

        // Calculate new average rating
        const newRatings = [...ratings, newRating];
        const newAverage =
          newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;

        setAverageRating(newAverage);
        setHasRated(true);
        setCanRate(false);
        setReview("");
      } else {
        throw new Error(data.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Rating submission error:", error);
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load lawyer details</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Lawyer Image and Basic Info */}
            <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex flex-col items-center">
                <img
                  src={
                    lawyer.profilePicture?.includes("http")
                      ? lawyer.profilePicture
                      : `http://localhost:4000/uploads/${lawyer.profilePicture}`
                  }
                  alt={`${lawyer.firstName} ${lawyer.lastName}`}
                  className="h-48 w-48 rounded-full object-cover mb-4 shadow-lg"
                  onError={(e) => {
                    e.target.src = "/default_avatar.png";
                  }}
                />
                <h1 className="text-2xl font-bold text-gray-900">
                  {lawyer.firstName} {lawyer.lastName}
                </h1>
                <p className="text-gray-600">
                  {lawyer.specialization?.join(", ") || "No specialization"}
                </p>

                {/* Rating Display */}
                <div className="mt-4 flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {averageRating.toFixed(1)} ({ratings.length} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Lawyer Details */}
            <div className="md:w-2/3 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Contact Information
                  </h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-gray-500 mr-2 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{lawyer.email}</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-gray-500 mr-2 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{lawyer.phone}</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-gray-500 mr-2 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {lawyer.streetAddress}, {lawyer.city}, {lawyer.region}
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Professional Information
                  </h2>
                  <ul className="space-y-2">
                    <li>
                      <span className="font-medium">License Number:</span>{" "}
                      {lawyer.licenseNumber}
                    </li>
                    <li>
                      <span className="font-medium">Experience:</span>{" "}
                      {lawyer.yearsOfExperience} years
                    </li>
                    <li>
                      <span className="font-medium">Languages:</span>{" "}
                      {lawyer.languagesSpoken?.join(", ") || "Not specified"}
                    </li>
                    <li>
                      <span className="font-medium">Education:</span>{" "}
                      {lawyer.lawDegree} from {lawyer.universityName}
                    </li>
                    <li>
                      <span className="font-medium">Fee:</span> ETB{" "}
                      {lawyer.consultationFee}
                    </li>
                    <li>
                      <span className="font-medium">Availability:</span>{" "}
                      {lawyer.availability}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Ratings & Reviews
                </h3>

                {/* Rating Form */}
                {canRate && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Add Your Review</h4>
                    <form onSubmit={handleRatingSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className="focus:outline-none"
                            >
                              <StarIcon
                                className={`h-8 w-8 ${
                                  star <= userRating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="review"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Your Review (Optional)
                        </label>
                        <textarea
                          id="review"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience with this lawyer..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}

                {/* Message for own profile or already rated */}
                {user && (lawyer._id === user._id || hasRated) && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">
                      {lawyer._id === user._id
                        ? "You cannot rate your own profile."
                        : "You have already rated this lawyer."}
                    </p>
                  </div>
                )}

                {/* Login prompt for guests */}
                {!user && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      Please <button 
                        onClick={() => navigate(`/rating/${id}`)} 
                        className="text-blue-600 hover:underline"
                      >
                        Rate
                      </button> to this lawyer satisfaction.
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                {ratings.length > 0 ? (
                  <div className="mt-6 space-y-6">
                    {ratings.map((rating) => (
                      <div
                        key={rating._id}
                        className="border-b border-gray-200 pb-6 last:border-0"
                      >
                        <div className="flex items-start">
                          <img
                            src={
                              rating.userId.profilePicture?.includes("http")
                                ? rating.userId.profilePicture
                                : `http://localhost:4000${rating.userId.profilePicture}`
                            }
                            alt={rating.userId.firstName}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = "/default_avatar.png";
                            }}
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {rating.userId.firstName}{" "}
                                  {rating.userId.lastName}
                                </p>
                                <div className="flex items-center mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= rating.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  rating.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {rating.review && (
                              <p className="mt-2 text-gray-600">
                                {rating.review}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-gray-500 italic">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetail;
