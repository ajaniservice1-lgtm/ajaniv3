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
  const [selectedOccupancy, setSelectedOccupancy] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Vendor/Hotel Information
  const hotelInfo = {
    name: 'WETLAND HOTELS',
    location: 'Mokola, Rd. 2314',
    rating: 4.78,
    description: 'Premium hotel with excellent amenities and services in the heart of the city',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  };

  // Amenities filter options
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

  // Room data with your exact content structure
  const roomTypes = [
    {
      id: 'room-1',
      title: 'Superior Twin Room',
      name: 'Superior Twin Room',
      description: 'Comfortable room with twin beds and courtyard view',
      size: '35 m²',
      beds: '2 Single Beds',
      maxOccupancy: 6,
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
        { icon: faUsers, label: 'Max Occupancy', value: '6 Guests' },
        { icon: faExpand, label: 'View', value: 'Courtyard View' },
        { icon: faDoorClosed, label: 'Room Type', value: 'Standard' },
        { icon: faClock, label: 'Check-in', value: '3:00 PM' }
      ],
      features: [
        { name: 'WiFi', included: true, icon: faWifi },
        { name: 'Air conditioning', included: true, icon: faSnowflake },
        { name: 'Iron facilities', included: true, icon: faConciergeBell },
        { name: 'Cable channel', included: true, icon: faTv }
      ],
      amenities: [
        'Flat-screen TV',
        'Minibar',
        'Coffee/tea maker',
        'Safe',
        'Work desk',
        'Iron/ironing board',
        'Hairdryer',
        'Toiletries'
      ],
      occupancy: [
        { 
          id: 'occ-1',
          adults: "2 adults", 
          price: 435865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        },
        { 
          id: 'occ-2',
          adults: "4 adults", 
          price: 375865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        },
        { 
          id: 'occ-3',
          adults: "6 adults", 
          price: 335865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        }
      ],
      maxRooms: 8,
      rating: 4.78,
      reviewCount: 231
    },
    {
      id: 'room-2',
      title: '2 Bedroom pymont view suite',
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
        { name: 'Free WiFi', included: true, icon: faWifi },
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
          id: 'occ-4',
          adults: "2 adults", 
          price: 445865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        },
        { 
          id: 'occ-5',
          adults: "4 adults", 
          price: 405865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        }
      ],
      maxRooms: 5,
      rating: 4.8,
      reviewCount: 124
    },
    {
      id: 'room-3',
      title: 'One bedroom suite',
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
        { name: 'WiFi', included: true, icon: faWifi },
        { name: 'Non first floor', included: true, icon: faCheck },
        { name: 'Cable channel', included: true, icon: faTv },
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
          id: 'occ-6',
          adults: "2 adults", 
          price: 534865,
          originalPrice: 534928,
          discount: '-30%',
          breakfast: 'Very good breakfast available',
          breakfastPrice: '₦43,013',
          benefits: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        }
      ],
      maxRooms: 3,
      rating: 4.6,
      reviewCount: 89
    }
  ];

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const handleRoomSelect = (room, occupancyOption) => {
    if (selectedRoom?.id === room.id && selectedOccupancy?.id === occupancyOption.id) {
      setSelectedRoom(null);
      setSelectedOccupancy(null);
      setSelectedRoomsCount(1);
      if (onRoomSelect) onRoomSelect(null);
    } else {
      setSelectedRoom(room);
      setSelectedOccupancy(occupancyOption);
      setSelectedRoomsCount(1);
      if (onRoomSelect) onRoomSelect({ room, occupancy: occupancyOption });
    }
  };

  const handleViewDetails = (room) => {
    setModalRoom(room);
    setCurrentImageIndex(0);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalRoom(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const handleBookNow = (room, occupancyOption) => {
    if (onRoomBookNow) {
      onRoomBookNow({ room, occupancy: occupancyOption });
    } else {
      const bookingData = {
        vendorData: vendorData || {
          ...hotelInfo,
          id: 'vendor-123',
          category: 'hotel'
        },
        selectedRoom: room,
        selectedOccupancy: occupancyOption,
        selectedRoomsCount: selectedRoomsCount,
      };
      
      localStorage.setItem('roomBookingData', JSON.stringify(bookingData));
      sessionStorage.setItem('roomBookingData', JSON.stringify(bookingData));
      
      navigate('/booking');
    }
  };

  const handleOccupancySelect = (room, occupancy) => {
    setSelectedRoom(room);
    setSelectedOccupancy(occupancy);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + modalRoom.images.length) % modalRoom.images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % modalRoom.images.length);
  };

  if (category !== 'hotel') {
    return null;
  }

  return (
    <div className="w-full bg-white md:max-w-[1250px] md:mx-auto">
      <div className="sm:px-6 lg:px-4 py-6">
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
              {/* Main layout - Left card + Right options */}
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                
                {/* LEFT ROOM CARD */}
                <div className="lg:w-[270px] bg-[#f5f5f5] rounded-lg p-3 flex-shrink-0">
                  {/* Main Big Image */}
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-48 object-cover rounded-md cursor-pointer mb-3"
                    onClick={() => handleViewDetails(room)}
                  />

                  {/* Small Images Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {room.subImages?.map((img, index) => (
                      <div 
                        key={index} 
                        className="h-16 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewDetails(room)}
                      >
                        <img 
                          src={img} 
                          alt={`${room.title} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Room Title */}
                  <h3 className="font-semibold text-lg text-gray-900">
                    {room.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <FontAwesomeIcon icon={faStar} className="text-[#ffc802]" />
                    <span className="font-medium">{room.rating}</span>
                    <span className="text-gray-500">({room.reviewCount})</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-black" />
                    <span>{hotelInfo.location}</span>
                  </div>

                  {/* Preview Room Button */}
                  <button
                    onClick={() => handleViewDetails(room)}
                    className="mt-3 bg-[#06f49f] text-sm px-3 py-1.5 rounded-md w-full transition-colors cursor-pointer"
                  >
                    Preview Room
                  </button>

                  {/* Key Features Heading */}
                  <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">
                    Key Features
                  </h4>

                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faWifi} className="text-black" />
                      <span>WiFi</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faSnowflake} className="text-black" />
                      <span>Air conditioning</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faConciergeBell} className="text-black" />
                      <span>Iron facilities</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faTv} className="text-black" />
                      <span>Cable channel</span>
                    </span>
                  </div>
                </div>

                {/* RIGHT OPTIONS */}
                <div className="flex-1 space-y-4">
                  {room.occupancy.map((option, index) => (
                    <div
                      key={option.id}
                      className={`bg-[#f5f5f5] rounded-lg p-4 ${
                        index < room.occupancy.length - 1 ? 'mb-4' : ''
                      }`}
                    >
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        {/* Header with adults and breakfast */}
                        <div className="mb-4">
                          <p className="font-semibold text-gray-900 text-base mb-1">{option.adults}</p>
                          <p className="text-sm text-gray-600">
                            {option.breakfast} ({option.breakfastPrice})
                          </p>
                        </div>

                        {/* Benefits with checkmarks */}
                        <div className="space-y-2 mb-4">
                          {option.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <FontAwesomeIcon 
                                icon={faCheck} 
                                className={`text-xs ${benefit.includes('Pay at hotel') ? 'text-green-500' : 'text-gray-400'}`} 
                              />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>

                        {/* Price and Availability Section */}
                        <div className="border-t pt-4">
                          <div className="flex items-start justify-between mb-3">
                            {/* Left side: Price info */}
                            <div>
                              <div className="text-sm text-gray-400 line-through mb-1">
                                {formatPrice(option.originalPrice)}
                              </div>
                              <div className="text-xs font-medium text-red-500 mb-2">
                                {option.discount}
                              </div>
                              <div className="text-xl font-bold text-gray-900 mb-1">
                                {formatPrice(option.price)}
                              </div>
                              <p className="text-xs text-gray-500">
                                Per night before taxes
                              </p>
                            </div>
                            
                            {/* Right side: Availability */}
                            <div className="text-right">
                              {option.isAvailable ? (
                                <span className="inline-block text-sm text-green-700 font-medium">
                                  Available
                                </span>
                              ) : (
                                <span className="inline-block text-sm text-gray-500">
                                  Not Available
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Book Button */}
                          <div className="text-center">
                            {option.isAvailable ? (
                              <>
                                <button
                                  onClick={() => handleBookNow(room, option)}
                                  className="w-full bg-gradient-to-r from-[#2C83F9] to-[#06E] text-white py-3 rounded-full font-semibold text-base hover:opacity-90 transition-opacity cursor-pointer mb-2"
                                >
                                  BOOK
                                </button>
                                <p className="text-xs text-gray-500">
                                  It only takes 2 minutes
                                </p>
                                <p className="text-xs text-[#FF5C39] mt-1">
                                  Limited availability...
                                </p>
                              </>
                            ) : (
                              <button
                                disabled
                                className="w-full bg-gray-300 text-gray-500 py-3 rounded-full font-semibold text-base cursor-not-allowed"
                              >
                                Not Available
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex items-stretch h-full">
                        {/* COLUMN 1: Info */}
                        <div className="flex-1 flex flex-col justify-between pr-8">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm mb-2">{option.adults}</p>
                            <p className="text-xs text-gray-600 mb-3">
                              {option.breakfast} ({option.breakfastPrice})
                            </p>
                            <div className="space-y-1">
                              {option.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                                  <span className="text-xs text-gray-700">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* VERTICAL SEPARATOR 1 */}
                        <div className="flex items-center">
                          <div className="w-px bg-gray-300 h-full"></div>
                        </div>

                        {/* COLUMN 2: Price */}
                        <div className="flex-1 px-8 flex flex-col justify-center">
                          <div className="text-sm text-gray-400 line-through text-center">
                            {formatPrice(option.originalPrice)}
                          </div>
                          <div className="text-xs font-medium text-red-500 text-center mb-1">
                            {option.discount}
                          </div>
                          <div className="text-xl font-bold text-gray-900 text-center mb-1">
                            {formatPrice(option.price)}
                          </div>
                          <p className="text-xs text-gray-500 text-center mb-2">
                            Per night before taxes
                          </p>
                          <div className="text-center">
                            {option.isAvailable ? (
                              <span className="inline-block text-xs text-[#FF5C39] font-medium">
                                Available
                              </span>
                            ) : (
                              <span className="inline-block text-xs text-gray-500">
                                Not Available
                              </span>
                            )}
                          </div>
                        </div>

                        {/* VERTICAL SEPARATOR 2 */}
                        <div className="flex items-center">
                          <div className="w-px bg-gray-300 h-full"></div>
                        </div>

                        {/* COLUMN 3: Action */}
                        <div className="flex-1 pl-8 flex flex-col justify-center items-center">
                          {option.isAvailable ? (
                            <>
                              <button
                                onClick={() => handleBookNow(room, option)}
                                className="w-full max-w-[120px] bg-gradient-to-r from-[#2C83F9] to-[#06E] text-white py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                BOOK
                              </button>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                It only takes 2 minutes
                              </p>
                              <p className="text-xs text-[#FF5C39] mt-1 text-center">
                                Limited availability...
                              </p>
                            </>
                          ) : (
                            <button
                              disabled
                              className="w-full max-w-[120px] bg-gray-300 text-gray-500 py-2.5 rounded-full font-semibold text-sm cursor-not-allowed"
                            >
                              Not Available
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Horizontal line between options on mobile */}
                      {index < room.occupancy.length - 1 && (
                        <div className="lg:hidden w-full h-px bg-gray-300 mt-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Room Summary */}
        {selectedRoom && selectedOccupancy && (
          <div className="mt-8 p-6 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleViewDetails(selectedRoom)}>
                  <img 
                    src={selectedRoom.image} 
                    alt={selectedRoom.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Selected: {selectedRoom.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {selectedOccupancy.adults} • {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-white/90 text-sm">
                    {selectedOccupancy.breakfast} ({selectedOccupancy.breakfastPrice})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  {selectedOccupancy.originalPrice && (
                    <div className="text-sm text-white/80 line-through">
                      {formatPrice(selectedOccupancy.originalPrice * selectedRoomsCount)}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(selectedOccupancy.price * selectedRoomsCount)}
                  </div>
                  <div className="text-white/90 text-sm">
                    Total for {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookNow(selectedRoom, selectedOccupancy)}
                  className="px-8 py-3 bg-white text-[#06EAFC] rounded-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Book Now
                </button>
                
                {/* Deselect Button */}
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setSelectedOccupancy(null);
                  }}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-300 cursor-pointer"
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
                  <FontAwesomeIcon icon={faCar} className="text-black" />
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
                  <FontAwesomeIcon icon={faCheck} className="text-black" />
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
                  <FontAwesomeIcon icon={faClock} className="text-black" />
                </div>
                <span className="font-medium">Pay Later Option</span>
              </div>
              <p className="text-xs text-gray-600">
                Reserve now, pay when you check in
              </p>
            </div>
          </div>
        </div>

        {/* Modal for Room Details - Exact design from second component */}
        {showModal && modalRoom && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
              {/* Close Button */}
              <div className="p-4">
                <button 
                  onClick={handleCloseModal}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Main Content */}
              <div className="flex flex-col md:flex-row gap-4 p-4">
                {/* Left Side - Image Carousel */}
                <div className="md:w-3/5 relative">
                  {/* Main Image */}
                  <div className="relative overflow-hidden rounded-lg h-96 md:h-[500px]">
                    <img 
                      src={modalRoom.images[currentImageIndex]} 
                      alt="Hotel Room" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Pagination Dots */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {modalRoom.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer ${
                          currentImageIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Thumbnail Images */}
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {modalRoom.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Right Side - Hotel Information */}
                <div className="md:w-2/5 bg-gray-50 p-4 rounded-lg">
                  {/* Hotel Header */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-indigo-800">{hotelInfo.name}</h2>
                    <img 
                      src={modalRoom.images[0]} 
                      alt="Hotel" 
                      className="w-full h-24 object-cover rounded-md mt-2"
                    />
                  </div>
                  
                  {/* Room Type and Rating */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{modalRoom.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm">{modalRoom.rating} ({modalRoom.reviewCount})</span>
                    </div>
                  </div>
                  
                  {/* Specifications */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Specification</h4>
                    <ul className="space-y-1 text-sm">
                      {modalRoom.specifications.map((spec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{spec.label}: {spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <ul className="space-y-1 text-sm">
                      {modalRoom.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Pricing */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-500 line-through mr-2">{formatPrice(modalRoom.occupancy[0]?.originalPrice)}</span>
                      <span className="text-red-600 font-bold">{modalRoom.occupancy[0]?.discount}</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {formatPrice(modalRoom.occupancy[0]?.price)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Per night before taxes</div>
                  </div>

                  {/* Book Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        if (modalRoom.occupancy[0]?.isAvailable) {
                          handleOccupancySelect(modalRoom, modalRoom.occupancy[0]);
                          handleBookNow(modalRoom, modalRoom.occupancy[0]);
                        }
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                        selectedRoom?.id === modalRoom.id
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-[#06EAFC] text-white hover:bg-[#05d9eb]'
                      }`}
                    >
                      {selectedRoom?.id === modalRoom.id ? 'Deselect Room' : 'Select & Book This Room'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;