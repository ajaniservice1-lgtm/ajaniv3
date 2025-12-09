import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hook/useAuth";

// Import lucide-react icons
import {
  CheckCircle,
  Star,
  MessageSquare,
  Edit2,
  Hand,
  Heart,
  Share2,
  Code,
  ArrowLeft,
} from "lucide-react";

const VendorCompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dummy vendor data matching the image
  const vendor = {
    name: "Sola Mercer",
    address: "George street, 12, Akure lane, Ondo",
    rating: 5,
    status: "Currently taking urgent order-",
    avatar: "https://via.placeholder.com/150", // Replace with real avatar URL
    languages: ["English (native)", "Yoruba (fluent)"],
    memberSince: "January 2020",
    activeWithin: "14 km of Ibadan",
    about:
      "Lorem ipsum dolor sit amet consectetur. Erat eu commodo sed nunc aliquam lacinia velit sed. Dictum lacus vulputate sapien diam tristique tempor. Et amet netus vitae habitant augue lorem., Lorem ipsum dolor sit amet consectetur. Erat eu commodo sed nunc aliquam lacinia velit sed. Dictum lacus vulputate sapien diam tristique tempor. Et amet netus vitae habitant augue lorem.Lorem ipsum dolor sit amet consectetur. Erat eu commodo sed nunc aliquam lacinia velit sed. Dictum lacus vulputate sapien diam tristique tempor. Et amet netus vitae habitant augue lorem.",
    services: ["Restaurant Vendor"],
    listings: [
      {
        id: 1,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
      {
        id: 2,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
      {
        id: 3,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
      {
        id: 4,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
      {
        id: 5,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
      {
        id: 6,
        title: "Golden Tulip Jericho",
        price: "₦50,000 for 2 night",
        rating: 4.7,
      },
    ],
  };

  const handleSendMessage = () => {
    alert("Send message clicked");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile"); // Adjust route as needed
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="Ajani Logo" className="h-12" />
      </div>

      {/* Main Profile Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleEditProfile}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>

        {/* Vendor Profile Card */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={vendor.avatar}
              alt={vendor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-300"
            />
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
              <p className="text-sm text-gray-600">{vendor.address}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < vendor.rating ? "#F59E0B" : "none"}
                    stroke="#F59E0B"
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">5/5</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{vendor.status}</p>
              <button
                onClick={handleSendMessage}
                className="mt-2 px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition"
              >
                Send message
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900">Languages:</h3>
            <p className="text-sm text-gray-600 mt-1">
              {vendor.languages.join(", ")}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Member Since:</h3>
            <p className="text-sm text-gray-600 mt-1">{vendor.memberSince}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Active within:</h3>
            <p className="text-sm text-gray-600 mt-1">{vendor.activeWithin}</p>
          </div>
        </div>

        {/* Services */}
        <div className="text-center">
          <h3 className="font-medium text-gray-900">Services</h3>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {vendor.services.map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* About Business */}
        <div className="p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">About business</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {vendor.about}
          </p>
        </div>

        {/* My Listings */}
        <div className="p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">My Listings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.listings.map((listing, idx) => (
              <div
                key={listing.id}
                className="border rounded-lg overflow-hidden"
              >
                <img
                  src={`https://via.placeholder.com/300?text=Listing+${
                    idx + 1
                  }`}
                  alt={listing.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Guest Favorite
                    </span>
                    <Heart size={16} className="text-gray-400" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-900">
                    {listing.title}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">
                      {listing.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                      <span className="text-xs text-gray-600">
                        {listing.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCompleteProfile;
