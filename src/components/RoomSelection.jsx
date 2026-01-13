import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faWifi, faTv, faCoffee, faSnowflake, faBath, faCar, faUtensils } from '@fortawesome/free-solid-svg-icons';

const RoomSelection = ({ category = 'hotel', onRoomSelect, vendorData }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomsCount, setSelectedRoomsCount] = useState(1);
  const navigate = useNavigate();
  
  // Sample room data with images
  const roomTypes = [
    {
      id: 'room-1',
      name: '2 Bedroom Pymont View Suite',
      description: 'Motion, Rd. 23M',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
      ],
      features: [
        { name: 'WIFI', included: true, icon: faWifi },
        { name: 'Non first floor', included: false, icon: faTimes },
        { name: 'Cable channel', included: true, icon: faTv },
        { name: 'Free Breakfast', included: true, icon: faCoffee },
        { name: 'Air Conditioning', included: true, icon: faSnowflake },
        { name: 'Private Bathroom', included: true, icon: faBath }
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 534098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking']
        },
        { 
          guests: 4, 
          price: 534098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking']
        }
      ],
      maxRooms: 5,
      discount: '-3DX'
    },
    {
      id: 'room-2',
      name: 'One Bedroom Suite',
      description: 'Motion, Rd. 23M',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
      ],
      features: [
        { name: 'WIFI', included: true, icon: faWifi },
        { name: 'Non first floor', included: true, icon: faCheck },
        { name: 'Cable channel', included: false, icon: faTv },
        { name: 'Room Service', included: true, icon: faUtensils },
        { name: 'Parking', included: true, icon: faCar }
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 434098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking']
        }
      ],
      maxRooms: 3,
      discount: '-2DX'
    },
    {
      id: 'room-3',
      name: 'Superior Twin Room',
      description: 'MOKUS, Rd. 2314',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
      ],
      features: [
        { name: 'WIFI', included: true, icon: faWifi },
        { name: 'Iron bed tires', included: true },
        { name: 'Minibar', included: true },
        { name: 'Ocean View', included: true },
        { name: 'Balcony', included: true }
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 375865, 
          description: 'Per night before taxes', 
          discount: '-10%', 
          originalPrice: 534098,
          breakfast: 'Very good breakfast available',
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking']
        },
        { 
          guests: 4, 
          price: 435865, 
          description: 'Per night before taxes', 
          discount: '-10%', 
          originalPrice: 534098,
          breakfast: 'Very good breakfast available',
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking']
        }
      ],
      maxRooms: 8
    }
  ];

  const amenities = [
    { name: 'Breakfast Included', value: false },
    { name: 'Free Cancellation', value: false },
    { name: 'Pay later option', value: false },
    { name: 'Pay at the hotel', value: true },
    { name: 'Non-smoking', value: true },
    { name: 'Kitchen', value: false },
    { name: 'Balcony', value: false },
    { name: 'King Bed', value: false }
  ];

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedRoomsCount(1); // Reset to 1 when selecting new room
    if (onRoomSelect) {
      onRoomSelect(room);
    }
  };

  const handleBookNow = () => {
    if (!selectedRoom) return;
    
    // Prepare booking data
    const bookingData = {
      vendorData: vendorData || {
        id: 'vendor-123',
        name: 'WETLAND HOTELS',
        category: 'hotel',
        area: 'Mokola, Rd. 2314',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        description: 'Premium hotel with excellent amenities and services'
      },
      selectedRoom: selectedRoom,
      selectedRoomsCount: selectedRoomsCount,
      bookingDetails: {
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
        numberOfNights: 1,
        numberOfRooms: selectedRoomsCount,
        numberOfGuests: selectedRoom.occupancy[0]?.guests || 2
      }
    };
    
    console.log('Booking data:', bookingData);
    
    // Store in localStorage for booking page
    localStorage.setItem('roomBookingData', JSON.stringify(bookingData));
    sessionStorage.setItem('roomBookingData', JSON.stringify(bookingData));
    
    // Navigate to booking page
    navigate('/booking', {
      state: {
        vendorData: bookingData.vendorData,
        selectedRoom: bookingData.selectedRoom,
        selectedRoomsCount: bookingData.selectedRoomsCount,
        bookingDetails: bookingData.bookingDetails
      }
    });
  };

  if (category !== 'hotel') {
    return null; // Only show room selection for hotels
  }

  return (
    <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg md:text-xl font-bold text-[#00065A] mb-4">
          Select Your Room
        </h2>
        
        {/* Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter</h3>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <button
                key={index}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  amenity.value 
                    ? 'bg-[#06EAFC] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amenity.name}
              </button>
            ))}
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-6">
          {roomTypes.map((room) => (
            <div 
              key={room.id}
              className={`border rounded-xl p-4 sm:p-6 transition-all duration-300 ${
                selectedRoom?.id === room.id 
                  ? 'border-[#06EAFC] bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Room Image */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="relative h-48 lg:h-56 rounded-xl overflow-hidden">
                    <img 
                      src={room.image} 
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    {room.discount && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {room.discount}
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Images */}
                  <div className="flex gap-2 mt-2">
                    {room.images?.slice(0, 3).map((img, index) => (
                      <div key={index} className="w-1/3 h-16 rounded overflow-hidden">
                        <img 
                          src={img} 
                          alt={`${room.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Details */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section - Room Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {room.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                      
                      {/* Key Features */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {room.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                feature.included ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {feature.included ? (
                                  <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xs" />
                                ) : (
                                  <FontAwesomeIcon icon={faTimes} className="text-gray-400 text-xs" />
                                )}
                              </div>
                              <span className="text-sm text-gray-600">{feature.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Occupancy Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {room.occupancy.map((option, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                {option.guests} {option.guests === 1 ? 'person' : 'people'}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Available
                              </span>
                            </div>
                            
                            {option.breakfast && (
                              <p className="text-xs text-gray-600 mb-2">{option.breakfast}</p>
                            )}
                            
                            {/* Amenities */}
                            {option.amenities && (
                              <div className="mb-3">
                                {option.amenities.map((amenity, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    {amenity}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Price */}
                            <div className="mb-2">
                              {option.discount && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatPrice(option.price)}
                                  </span>
                                  {option.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(option.originalPrice)}
                                    </span>
                                  )}
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                    {option.discount}
                                  </span>
                                </div>
                              )}
                              
                              {!option.discount && (
                                <div className="text-lg font-bold text-gray-900 mb-1">
                                  {formatPrice(option.price)}
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Section - Booking Action */}
                    <div className="lg:w-48">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        {/* Number of Rooms Dropdown */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Rooms
                          </label>
                          <select
                            value={selectedRoomsCount}
                            onChange={(e) => setSelectedRoomsCount(parseInt(e.target.value))}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                          >
                            {[...Array(room.maxRooms).keys()].map(num => (
                              <option key={num + 1} value={num + 1}>
                                {num + 1} room{num + 1 > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Max: {room.maxRooms} rooms available
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRoomSelect(room)}
                          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedRoom?.id === room.id
                              ? 'bg-[#06EAFC] text-white hover:bg-[#05d9eb]'
                              : 'bg-white text-[#06EAFC] border border-[#06EAFC] hover:bg-blue-50 hover:scale-105'
                          }`}
                        >
                          {selectedRoom?.id === room.id ? 'Selected ✓' : 'Select Room'}
                        </button>
                        
                        <p className="text-xs text-gray-600 text-center mt-3">
                          It only takes 2 minutes<br />
                          Limited availability
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Room Summary */}
        {selectedRoom && (
          <div className="mt-8 p-6 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={selectedRoom.image} 
                    alt={selectedRoom.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Selected: {selectedRoom.name}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''} • Best price guaranteed • Free cancellation
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(selectedRoom.occupancy[0]?.price * selectedRoomsCount)}
                  </div>
                  <div className="text-white/90 text-sm">
                    Total for {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''}
                  </div>
                </div>
                
                <button
                  onClick={handleBookNow}
                  className="px-8 py-3 bg-white text-[#06EAFC] rounded-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Options Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Options Available</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">$</span>
                </div>
                <span className="font-medium">Pay at Hotel</span>
              </div>
              <p className="text-xs text-gray-600">
                Pay when you arrive at the hotel
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span className="font-medium">Free Cancellation</span>
              </div>
              <p className="text-xs text-gray-600">
                Cancel up to 24 hours before check-in
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">⏰</span>
                </div>
                <span className="font-medium">Pay Later Option</span>
              </div>
              <p className="text-xs text-gray-600">
                Reserve now, pay when you check in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;