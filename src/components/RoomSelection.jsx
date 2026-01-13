import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faWifi, faTv, faCoffee, 
  faSnowflake, faBath, faCar, faUtensils, faBed,
  faUser, faCalendar, faDoorClosed, faExpand,
  faRuler, faUsers, faClock, faStar,
  faShower, faWind, faConciergeBell, faParking,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { IoClose } from 'react-icons/io5';

const RoomSelection = ({ category = 'hotel', onRoomSelect, vendorData, onRoomBookNow }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomsCount, setSelectedRoomsCount] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalRoom, setModalRoom] = useState(null);
  const navigate = useNavigate();
  
  // Vendor/Hotel Information
  const hotelInfo = {
    name: 'WETLAND HOTELS',
    location: 'Mokola, Rd. 2314',
    rating: 4.3,
    description: 'Premium hotel with excellent amenities and services in the heart of the city',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  };

  // Sample room data with images
  const roomTypes = [
    {
      id: 'room-1',
      name: '2 Bedroom Pymont View Suite',
      description: 'Luxury suite with panoramic views of the city skyline',
      size: '65 m²',
      beds: '1 King Bed, 1 Queen Bed',
      maxOccupancy: 4,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'
      ],
      subImages: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80'
      ],
      specifications: [
        { icon: faRuler, label: 'Room Size', value: '65 m²' },
        { icon: faBed, label: 'Bed Type', value: 'King & Queen' },
        { icon: faUsers, label: 'Max Occupancy', value: '4 Guests' },
        { icon: faExpand, label: 'View', value: 'City View' },
        { icon: faDoorClosed, label: 'Room Type', value: 'Suite' },
        { icon: faClock, label: 'Check-in', value: '2:00 PM' }
      ],
      features: [
        { name: 'Free WIFI', included: true, icon: faWifi },
        { name: 'Non first floor', included: false, icon: faTimes },
        { name: 'Cable channel', included: true, icon: faTv },
        { name: 'Free Breakfast', included: true, icon: faCoffee },
        { name: 'Air Conditioning', included: true, icon: faSnowflake },
        { name: 'Private Bathroom', included: true, icon: faBath },
        { name: 'Room Service', included: true, icon: faConciergeBell },
        { name: 'Parking', included: true, icon: faParking }
      ],
      amenities: [
        'Flat-screen TV',
        'Minibar',
        'Coffee/tea maker',
        'Safe',
        'Work desk',
        'Iron/ironing board',
        'Hairdryer',
        'Daily housekeeping'
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 534098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          benefits: ['Free cancellation', 'Pay at hotel', 'No prepayment needed'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Breakfast included']
        },
        { 
          guests: 4, 
          price: 634098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          benefits: ['Free cancellation', 'Pay at hotel', 'No prepayment needed'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Breakfast included']
        }
      ],
      maxRooms: 5,
      discount: '-3DX',
      rating: 4.8,
      reviewCount: 124
    },
    {
      id: 'room-2',
      name: 'One Bedroom Suite',
      description: 'Elegant suite with modern amenities and garden view',
      size: '45 m²',
      beds: '1 King Bed',
      maxOccupancy: 2,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
      ],
      subImages: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80'
      ],
      specifications: [
        { icon: faRuler, label: 'Room Size', value: '45 m²' },
        { icon: faBed, label: 'Bed Type', value: 'King Bed' },
        { icon: faUsers, label: 'Max Occupancy', value: '2 Guests' },
        { icon: faExpand, label: 'View', value: 'Garden View' },
        { icon: faDoorClosed, label: 'Room Type', value: 'Suite' },
        { icon: faClock, label: 'Check-in', value: '2:00 PM' }
      ],
      features: [
        { name: 'WIFI', included: true, icon: faWifi },
        { name: 'Non first floor', included: true, icon: faCheck },
        { name: 'Cable channel', included: false, icon: faTv },
        { name: 'Room Service', included: true, icon: faUtensils },
        { name: 'Parking', included: true, icon: faCar },
        { name: 'Air Conditioning', included: true, icon: faSnowflake },
        { name: 'Private Bathroom', included: true, icon: faShower }
      ],
      amenities: [
        'Smart TV',
        'Minibar',
        'Nespresso machine',
        'Safe',
        'Writing desk',
        'Ironing facilities',
        'Bathrobes',
        'Slippers'
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 434098, 
          description: 'Per night before taxes',
          breakfast: 'Very good breakfast available',
          benefits: ['Free cancellation', 'Pay later option', 'Breakfast included'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Room service']
        }
      ],
      maxRooms: 3,
      discount: '-2DX',
      rating: 4.6,
      reviewCount: 89
    },
    {
      id: 'room-3',
      name: 'Superior Twin Room',
      description: 'Comfortable room with twin beds and courtyard view',
      size: '35 m²',
      beds: '2 Single Beds',
      maxOccupancy: 2,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'
      ],
      subImages: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80'
      ],
      specifications: [
        { icon: faRuler, label: 'Room Size', value: '35 m²' },
        { icon: faBed, label: 'Bed Type', value: 'Twin Beds' },
        { icon: faUsers, label: 'Max Occupancy', value: '2 Guests' },
        { icon: faExpand, label: 'View', value: 'Courtyard View' },
        { icon: faDoorClosed, label: 'Room Type', value: 'Standard' },
        { icon: faClock, label: 'Check-in', value: '3:00 PM' }
      ],
      features: [
        { name: 'WIFI', included: true, icon: faWifi },
        { name: 'Iron bed tires', included: true, icon: faCheck },
        { name: 'Minibar', included: true, icon: faCheck },
        { name: 'Ocean View', included: true, icon: faCheck },
        { name: 'Balcony', included: true, icon: faCheck },
        { name: 'Air Conditioning', included: true, icon: faWind }
      ],
      amenities: [
        'LED TV',
        'Minibar',
        'Tea/coffee facilities',
        'Safe',
        'Desk',
        'Iron',
        'Hairdryer',
        'Toiletries'
      ],
      occupancy: [
        { 
          guests: 2, 
          price: 375865, 
          description: 'Per night before taxes', 
          discount: '-10%', 
          originalPrice: 534098,
          breakfast: 'Very good breakfast available',
          benefits: ['Free cancellation', 'Best price guarantee', 'No booking fees'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', '24/7 reception']
        }
      ],
      maxRooms: 8,
      rating: 4.4,
      reviewCount: 156
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
    // Toggle selection: if clicking the same room, deselect it
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(null);
      setSelectedRoomsCount(1);
      if (onRoomSelect) {
        onRoomSelect(null);
      }
    } else {
      setSelectedRoom(room);
      setSelectedRoomsCount(1);
      if (onRoomSelect) {
        onRoomSelect(room);
      }
    }
  };

  const handleViewDetails = (room) => {
    setModalRoom(room);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalRoom(null);
    document.body.style.overflow = 'auto';
  };

  const handleBookNow = (room) => {
    if (onRoomBookNow) {
      onRoomBookNow(room);
    } else {
      const bookingData = {
        vendorData: vendorData || {
          ...hotelInfo,
          id: 'vendor-123',
          category: 'hotel'
        },
        selectedRoom: room,
        selectedRoomsCount: selectedRoomsCount,
      };
      
      localStorage.setItem('roomBookingData', JSON.stringify(bookingData));
      sessionStorage.setItem('roomBookingData', JSON.stringify(bookingData));
      
      navigate('/booking');
    }
  };

  if (category !== 'hotel') {
    return null;
  }

  return (
    <div className="w-full bg-white md:max-w-[1250px] md:mx-auto">
      <div className="px-2 sm:px-6 lg:px-4 py-6">
        <h2 className="text-lg md:text-xl font-bold text-[#00065A] mb-6">
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
                {/* Room Images Section */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="relative h-48 lg:h-48 rounded-xl overflow-hidden mb-3">
                    <img 
                      src={room.image} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    {room.discount && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {room.discount}
                      </div>
                    )}
                    {/* Hotel Rating Badge */}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                      <span>{hotelInfo.rating}</span>
                    </div>
                  </div>
                  
                  {/* Three Small Sub Images */}
                  <div className="grid grid-cols-3 gap-2">
                    {room.subImages?.map((img, index) => (
                      <div 
                        key={index} 
                        className="h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewDetails(room)}
                      >
                        <img 
                          src={img} 
                          alt={`${room.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Hotel Information */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium">{hotelInfo.rating}</span>
                    </div>
                    <h4 className="font-bold text-gray-900">{hotelInfo.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                      <span>{hotelInfo.location}</span>
                    </div>
                    <p className="text-xs text-gray-500">{hotelInfo.description}</p>
                    
                    {/* Preview Room Button */}
                    <button
                      onClick={() => handleViewDetails(room)}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    >
                      Preview Room
                    </button>
                  </div>
                </div>

                {/* Room Details */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section - Room Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {room.name}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(room.occupancy[0]?.price)}
                          </div>
                          <div className="text-sm text-gray-500">per night</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                      
                      {/* Quick Features */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {room.features.slice(0, 6).map((feature, index) => (
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
                      <div className="space-y-4">
                        {room.occupancy.map((option, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  {option.guests} {option.guests === 1 ? 'person' : 'people'}
                                </span>
                                {option.breakfast && (
                                  <p className="text-xs text-gray-600 mt-1">{option.breakfast}</p>
                                )}
                              </div>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Available
                              </span>
                            </div>
                            
                            {/* Benefits */}
                            {option.benefits && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {option.benefits.map((benefit, idx) => (
                                    <span key={idx} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div>
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
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => handleViewDetails(room)}
                            className="w-full py-2 text-[#06EAFC] border border-[#06EAFC] rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            View Full Details
                          </button>
                          
                          <button
                            onClick={() => handleRoomSelect(room)}
                            className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                              selectedRoom?.id === room.id
                                ? 'bg-[#06EAFC] text-white hover:bg-[#05d9eb]'
                                : 'bg-white text-[#06EAFC] border border-[#06EAFC] hover:bg-blue-50'
                            }`}
                          >
                            {selectedRoom?.id === room.id ? 'Selected ✓' : 'Select Room'}
                          </button>
                          
                          <button
                            onClick={() => handleBookNow(room)}
                            className="w-full py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300"
                          >
                            Book Now
                          </button>
                        </div>
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
                    {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''} • {selectedRoom.occupancy[0]?.guests} guests • Free cancellation
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
                  onClick={() => handleBookNow(selectedRoom)}
                  className="px-8 py-3 bg-white text-[#06EAFC] rounded-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                >
                  Book Now
                </button>
                
                {/* Deselect Button */}
                <button
                  onClick={() => handleRoomSelect(selectedRoom)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-300"
                >
                  Deselect
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

        {/* Modal for Room Details with Glass Effect */}
        {showModal && modalRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            {/* Glass effect background */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseModal}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-[1245px] max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                    <span className="font-medium">{hotelInfo.rating}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{modalRoom.name}</h3>
                  <p className="text-gray-600 text-sm">{modalRoom.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{hotelInfo.location}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100/50 rounded-full transition-colors backdrop-blur-sm"
                >
                  <IoClose className="text-2xl text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Room Images Grid */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {modalRoom.images?.map((img, index) => (
                      <div key={index} className="rounded-xl overflow-hidden h-48 shadow-lg">
                        <img
                          src={img}
                          alt={`${modalRoom.name} - ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {modalRoom.specifications.map((spec, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <FontAwesomeIcon icon={spec.icon} className="text-[#06EAFC]" />
                          <p className="font-medium text-gray-700">{spec.label}</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h4>
                    <div className="space-y-3">
                      {modalRoom.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {feature.icon ? (
                            <FontAwesomeIcon 
                              icon={feature.icon} 
                              className={feature.included ? "text-green-500" : "text-gray-300"} 
                            />
                          ) : feature.included ? (
                            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} className="text-gray-300" />
                          )}
                          <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Additional Amenities */}
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-700 mb-3">Additional Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {modalRoom.amenities.map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-sm border border-gray-100">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Options</h4>
                    <div className="space-y-4">
                      {modalRoom.occupancy.map((option, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="font-medium text-gray-900">
                                {option.guests} {option.guests === 1 ? 'Person' : 'People'}
                              </span>
                              {option.breakfast && (
                                <p className="text-sm text-gray-600 mt-1">{option.breakfast}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {option.discount && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(option.price)}
                                  </span>
                                  {option.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(option.originalPrice)}
                                    </span>
                                  )}
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                    {option.discount}
                                  </span>
                                </div>
                              )}
                              
                              {!option.discount && (
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(option.price)}
                                </div>
                              )}
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </div>
                          
                          {/* Benefits */}
                          {option.benefits && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {option.benefits.map((benefit, idx) => (
                                  <span key={idx} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Amenities */}
                          {option.amenities && (
                            <div className="space-y-1">
                              {option.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                  {amenity}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Room Policies */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Policies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg border border-blue-100">
                      <h5 className="font-medium text-blue-700 mb-2">Cancellation Policy</h5>
                      <p className="text-sm text-gray-600">Free cancellation up to 24 hours before check-in. No cancellation fees.</p>
                    </div>
                    <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-lg border border-green-100">
                      <h5 className="font-medium text-green-700 mb-2">Check-in/Check-out</h5>
                      <p className="text-sm text-gray-600">Check-in: 2:00 PM • Check-out: 11:00 AM • Early check-in available</p>
                    </div>
                    <div className="bg-purple-50/80 backdrop-blur-sm p-4 rounded-lg border border-purple-100">
                      <h5 className="font-medium text-purple-700 mb-2">House Rules</h5>
                      <p className="text-sm text-gray-600">No smoking • No pets • Maximum occupancy: {modalRoom.maxOccupancy} guests</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-white/20 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50/50 transition-colors backdrop-blur-sm"
                >
                  Close
                </button>
                
                {/* Toggle Selection Button in Modal */}
                <button
                  onClick={() => {
                    handleRoomSelect(modalRoom);
                    handleCloseModal();
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedRoom?.id === modalRoom.id
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-[#06EAFC] text-white hover:bg-[#05d9eb]'
                  }`}
                >
                  {selectedRoom?.id === modalRoom.id ? 'Deselect Room' : 'Select This Room'}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedRoom(modalRoom);
                    handleBookNow(modalRoom);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg font-bold hover:opacity-90 transition-all duration-300 shadow-lg"
                >
                  Book This Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;