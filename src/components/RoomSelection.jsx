// src/components/RoomSelection.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWifi, faCar, faBed, faUtensils, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RoomSelection = ({ vendorData, onRoomSelected }) => {
  const navigate = useNavigate();
  const [selectedDateRange, setSelectedDateRange] = useState({
    checkIn: "",
    checkOut: ""
  });
  const [roomCount, setRoomCount] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    breakfastIncluded: false,
    freeCancellation: false,
    payLater: false,
    payAtHotel: true,
    nonSmoking: false,
    kitchen: false,
    balcony: false,
    kingBed: false
  });

  // Mock room data — replace with API call in production
  const mockRooms = [
    {
      id: "superior-twin",
      name: "Superior Twin Room",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      rating: 4.78,
      price: 435865,
      originalPrice: 634028,
      discount: 30,
      capacity: 2,
      features: ["Free WiFi", "Parking", "Pay at hotel"],
      amenities: ["WiFi", "Air conditioning", "Iron facilities", "Cable channel"],
      description: "Comfortable twin room with modern amenities"
    },
    {
      id: "two-bedroom-pymont",
      name: "2 Bedroom Pymont View Suite",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      rating: 4.78,
      price: 445865,
      originalPrice: 634028,
      discount: 30,
      capacity: 4,
      features: ["Free WiFi", "Parking", "Pay at hotel"],
      amenities: ["WiFi", "Air conditioning", "Iron facilities", "Cable channel"],
      description: "Spacious suite with beautiful views"
    },
    {
      id: "one-bedroom-suite",
      name: "One Bedroom Suite",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      rating: 4.78,
      price: 534865,
      originalPrice: 634028,
      discount: 30,
      capacity: 2,
      features: ["Free WiFi", "Parking", "Pay at hotel"],
      amenities: ["WiFi", "Air conditioning", "Iron facilities", "Cable channel"],
      description: "Luxury suite with premium amenities"
    }
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoomCountChange = (delta) => {
    setRoomCount(prev => Math.max(1, prev + delta));
  };

  const toggleFilter = (filter) => {
    setFilterOptions(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleRoomSelect = (room) => {
    const selectedRoomData = {
      ...room,
      selectedDateRange,
      roomCount,
      filterOptions
    };
    onRoomSelected(selectedRoomData);
  };

  const filteredRooms = mockRooms.filter(room => {
    if (filterOptions.breakfastIncluded && !room.features.some(f => f.toLowerCase().includes("breakfast"))) return false;
    if (filterOptions.freeCancellation && !room.features.some(f => f.toLowerCase().includes("cancellation"))) return false;
    if (filterOptions.payLater && !room.features.some(f => f.toLowerCase().includes("later"))) return false;
    if (filterOptions.payAtHotel && !room.features.some(f => f.toLowerCase().includes("hotel"))) return false;
    if (filterOptions.nonSmoking && !room.features.some(f => f.toLowerCase().includes("smoking"))) return false;
    if (filterOptions.kitchen && !room.features.some(f => f.toLowerCase().includes("kitchen"))) return false;
    if (filterOptions.balcony && !room.features.some(f => f.toLowerCase().includes("balcony"))) return false;
    if (filterOptions.kingBed && !room.features.some(f => f.toLowerCase().includes("king"))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Select Your Room</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Filter Rooms</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Breakfast included", key: "breakfastIncluded" },
              { label: "Free cancellation", key: "freeCancellation" },
              { label: "Pay later option", key: "payLater" },
              { label: "Pay at the hotel", key: "payAtHotel" },
              { label: "Non-smoking", key: "nonSmoking" },
              { label: "Kitchen", key: "kitchen" },
              { label: "Balcony", key: "balcony" },
              { label: "King bed", key: "kingBed" }
            ].map(({ label, key }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterOptions[key]
                    ? "bg-[#06EAFC] text-white border-[#06EAFC]"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Select Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Check-in</label>
              <input
                type="date"
                name="checkIn"
                value={selectedDateRange.checkIn}
                onChange={handleDateChange}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Check-out</label>
              <input
                type="date"
                name="checkOut"
                value={selectedDateRange.checkOut}
                onChange={handleDateChange}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                min={selectedDateRange.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Room Image */}
                  <div className="md:w-1/3 relative">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      {room.rating} ★
                    </div>
                  </div>
                  
                  {/* Room Details */}
                  <div className="md:w-2/3 p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{vendorData?.area || "Ibadan"}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-sm">₦{room.originalPrice.toLocaleString()}</span>
                          <span className="text-red-600 font-bold text-xl">₦{room.price.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-600 text-xs">Per night before taxes</p>
                      </div>
                    </div>
                    
                    {/* Room Features */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faBed} className="text-gray-600" />
                        <span className="text-gray-700 text-sm">{room.capacity} adults</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        <span className="text-gray-700 text-sm">Very good breakfast available (₦43,013)</span>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-1 text-green-600 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Key Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
                      <div className="flex flex-wrap gap-3">
                        {room.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-gray-700 text-xs">
                            {amenity === "WiFi" && <FontAwesomeIcon icon={faWifi} />}
                            {amenity === "Air conditioning" && <FontAwesomeIcon icon={faBed} />}
                            {amenity === "Iron facilities" && <FontAwesomeIcon icon={faCar} />}
                            {amenity === "Cable channel" && <FontAwesomeIcon icon={faUtensils} />}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Booking Options */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRoomCountChange(-1)}
                          className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={roomCount <= 1}
                        >
                          <span className="text-lg font-bold">-</span>
                        </button>
                        <div className="text-center">
                          <span className="text-lg font-bold text-gray-900">{roomCount}</span>
                          <span className="block text-xs text-gray-600 mt-1">rooms</span>
                        </div>
                        <button
                          onClick={() => handleRoomCountChange(1)}
                          className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRoomSelect(room)}
                        className="px-4 py-2 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors text-sm font-medium"
                      >
                        BOOK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No rooms match your filters.</p>
              <button
                onClick={() => setFilterOptions({
                  breakfastIncluded: false,
                  freeCancellation: false,
                  payLater: false,
                  payAtHotel: true,
                  nonSmoking: false,
                  kitchen: false,
                  balcony: false,
                  kingBed: false
                })}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;