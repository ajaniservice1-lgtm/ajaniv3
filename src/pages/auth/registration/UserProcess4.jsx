import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const UserProcess4 = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);

  // Sample review data based on your image
  const sampleReviews = [
    {
      id: 1,
      vendorName: "Armstrong Model",
      rating: 5,
      date: "Jun 15, 2024",
      content:
        "Lorem ipsum dolor sit amet consectetur. Erit sit commodo sed nunc aliquam lacinia velit esse. Dichit lacinia vulputate sapien diam tristique tempore.",
      reviewerName: "Seventhin Yu",
      readMore: true,
    },
    {
      id: 2,
      vendorName: "Luxury Events",
      rating: 5,
      date: "August 8, 2024",
      content:
        "Ce nibhur ringilla naus at nunc posuere, tal dolentis eurt posuere. Aliquam eurt vulputat. Donec volut labore etci.",
      reviewerName: "Michael Johnson",
      readMore: true,
    },
    {
      id: 3,
      vendorName: "Premium Catering",
      rating: 5,
      date: "Summer 15, 2024",
      content:
        "Sed rhodpur, leo et verilus cursus, avcul libero porttitor enus a tempus errat metus non sens. Vivamus acumusqu ligula eu metus femeniam.",
      reviewerName: "Michael Johnson",
      readMore: true,
    },
    {
      id: 4,
      vendorName: "Elite Photography",
      rating: 4,
      date: "July 22, 2024",
      content:
        "Excellent service and quality work. The team was professional and delivered beyond expectations.",
      reviewerName: "Sarah Wilson",
      readMore: false,
    },
    {
      id: 5,
      vendorName: "Royal Decor",
      rating: 5,
      date: "May 30, 2024",
      content:
        "Beautiful decorations that transformed our venue. Highly recommended for any event.",
      reviewerName: "David Chen",
      readMore: false,
    },
  ];

  useEffect(() => {
    // Load user profile
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }

    // Load user reviews from localStorage or use sample data
    const savedReviews = localStorage.getItem("userReviews");
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews);
        if (parsed.length > 0) {
          setUserReviews(parsed);
        } else {
          setUserReviews(sampleReviews);
        }
      } catch (error) {
        console.error("Error parsing reviews:", error);
        setUserReviews(sampleReviews);
      }
    } else {
      setUserReviews(sampleReviews);
      // Save sample reviews to localStorage
      localStorage.setItem("userReviews", JSON.stringify(sampleReviews));
    }
  }, []);

  const handleBackClick = () => {
    navigate("/register/user/process2");
  };

  const handleReviewClick = (reviewId) => {
    // Navigate to detailed review page or show modal
    console.log("Viewing review:", reviewId);
    // You can implement a modal or detailed view here
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 mt-15">
        {/* Back Button and Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Profile</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {userReviews.length}{" "}
              {userReviews.length === 1 ? "review" : "reviews"} written
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-gradient-to-r from-[#00d1ff] to-[#00d37f] rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={
                    userProfile?.image ||
                    "https://randomuser.me/api/portraits/men/32.jpg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://randomuser.me/api/portraits/men/32.jpg";
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {userProfile?.fullName || "Daniel Adeyemi"}
                </h2>
                <p className="text-white/80 text-sm">
                  Member since {userProfile?.memberSince || "September 2025"}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <div className="text-3xl font-bold">{userReviews.length}</div>
              <p className="text-white/80 text-sm">Reviews Written</p>
            </div>
          </div>
        </div>

        {/* User About Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
          <p className="text-gray-700 leading-relaxed">
            {userProfile?.about ||
              "Lorem ipsum dolor sit amet consectetur. Erit sit commodo sed trices aliquam borsa est sed. Dichit lacinia vulputate sapien diam trincipis tempor. Et semestress ruthen biscus fugula tempore."}
          </p>
        </div>

        {/* Reviews Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Reviews ({userReviews.length})
          </h2>
          <div className="w-20 h-1 bg-[#00d37f] mt-2"></div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {userReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleReviewClick(review.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.vendorName}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {review.rating}.0
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{review.date}</span>
                  </div>
                </div>
                <button className="mt-3 sm:mt-0 flex items-center gap-1 text-[#00d37f] hover:text-[#02be72] transition">
                  <span className="text-sm font-medium">View Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">
                {review.content}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        review.reviewerName
                      )}&background=random`}
                      alt={review.reviewerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {review.reviewerName}
                  </span>
                </div>

                {review.readMore && (
                  <button className="text-sm font-medium text-[#00d37f] hover:text-[#02be72] transition">
                    Read more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {userReviews.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Star size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You haven't written any reviews yet. Start exploring vendors and
              share your experiences to help others.
            </p>
            <button
              onClick={() => navigate("/directory")}
              className="px-6 py-2.5 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
            >
              Explore Vendors
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userReviews.length}
              </div>
              <p className="text-gray-600">Total Reviews</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userReviews.length > 0
                  ? (
                      userReviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / userReviews.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userReviews.filter((review) => review.rating === 5).length}
              </div>
              <p className="text-gray-600">5-Star Reviews</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProcess4;
