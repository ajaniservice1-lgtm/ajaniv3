import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faWifi, faTv, faCoffee, 
  faSnowflake, faBath, faCar, faUtensils, faBed,
  faUser, faCalendar, faDoorClosed, faExpand,
  faRuler, faUsers, faClock, faStar,
  faShower, faWind, faConciergeBell, faParking,
  faMapMarkerAlt, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const RoomSelection = ({ category = 'hotel', onRoomSelect, vendorData, onRoomBookNow }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedOccupancy, setSelectedOccupancy] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalRoom, setModalRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Handle location object properly
  const getLocationString = (locationData) => {
    if (!locationData) return 'Location not specified';
    
    // If it's a string, return it
    if (typeof locationData === 'string') return locationData;
    
    // If it's an object with area property
    if (typeof locationData === 'object') {
      if (locationData.area) return locationData.area;
      if (locationData.address) return locationData.address;
      if (locationData.geolocation) {
        if (typeof locationData.geolocation === 'object') {
          return `${locationData.geolocation.lat}, ${locationData.geolocation.lng}`;
        }
        return locationData.geolocation;
      }
    }
    
    return 'Location not specified';
  };

  // Vendor/Hotel Information - Use vendorData if available
  const hotelInfo = {
    name: vendorData?.name || vendorData?.title || 'Hotel',
    location: getLocationString(vendorData?.location || vendorData?.area),
    rating: vendorData?.rating || 4.78,
    description: vendorData?.description || 'Premium hotel with excellent amenities and services',
    image: vendorData?.image || vendorData?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    id: vendorData?.id || vendorData?._id || 'vendor-' + Date.now(),
    category: vendorData?.category || 'hotel'
  };

  // Amenities filter options - renamed from 'amenities' to 'amenityOptions' to avoid conflict
  const amenityOptions = [
    { name: 'Breakfast Included', value: false },
    { name: 'Free Cancellation', value: false },
    { name: 'Pay later option', value: false },
    { name: 'Pay at the hotel', value: true },
    { name: 'Non-smoking', value: true },
    { name: 'Kitchen', value: false },
    { name: 'Balcony', value: false },
    { name: 'King Bed', value: false }
  ];

  // Room data with your exact content structure - ENHANCED WITH ALL REQUIRED DATA
  const roomTypes = [
    {
      id: 'room-1',
      title: 'Superior Twin Room',
      name: 'Superior Twin Room',
      description: 'Comfortable room with twin beds and courtyard view',
      size: '35 m²',
      beds: '2 Single Beds',
      maxOccupancy: 6,
      mainImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
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
      amenitiesList: [  // ✅ Changed from 'amenities' to 'amenitiesList' to avoid conflict
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
      mainImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
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
      amenitiesList: [
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
      mainImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
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
      amenitiesList: [
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

  // ✅ ENHANCED: Handle Book Now with comprehensive data
  const handleBookNow = (room, occupancyOption) => {
    console.log("🟢 Book Now clicked with data:", {
      room,
      occupancyOption,
      hotelInfo,
      vendorData
    });

    // Create comprehensive booking data object
    const bookingData = {
      // Hotel/Vendor Information
      hotel: {
        id: hotelInfo.id,
        name: hotelInfo.name,
        location: hotelInfo.location,
        rating: hotelInfo.rating,
        image: hotelInfo.image,
        mainImage: hotelInfo.image,
        description: hotelInfo.description,
        category: hotelInfo.category
      },
      
      // Room Information
      room: {
        id: room.id,
        title: room.title,
        name: room.name,
        description: room.description,
        mainImage: room.mainImage || room.image,
        image: room.image,
        images: room.images || [],
        size: room.size,
        beds: room.beds,
        maxOccupancy: room.maxOccupancy,
        rating: room.rating,
        reviewCount: room.reviewCount,
        specifications: room.specifications,
        amenities: room.amenitiesList,
        features: room.features
      },
      
      // Booking Details
      booking: {
        occupancy: occupancyOption.adults,
        adults: parseInt(occupancyOption.adults) || 2,
        price: occupancyOption.price,
        originalPrice: occupancyOption.originalPrice,
        discount: occupancyOption.discount,
        breakfast: occupancyOption.breakfast,
        breakfastPrice: occupancyOption.breakfastPrice,
        benefits: occupancyOption.benefits,
        checkIn: "Sat, Jan 24",
        checkOut: "Sun, Jan 25",
        checkInTime: "15:00",
        nights: 1,
        totalPrice: occupancyOption.price,
        perNight: occupancyOption.price,
        taxes: Math.round(occupancyOption.price * 0.1),
        serviceFee: Math.round(occupancyOption.price * 0.05),
        finalTotal: Math.round(occupancyOption.price * 1.15)
      },
      
      // Timestamps
      timestamp: new Date().toISOString(),
      bookingId: 'AJ' + Date.now().toString().slice(-8)
    };

    // Store in both localStorage and sessionStorage
    localStorage.setItem('roomBookingData', JSON.stringify(bookingData));
    sessionStorage.setItem('roomBookingData', JSON.stringify(bookingData));
    
    // Store in a specific key for easy retrieval
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Also call the parent callback if provided
    if (onRoomBookNow) {
      onRoomBookNow(bookingData);
    }
    
    // Navigate to booking page
    navigate('/booking', { 
      state: { 
        bookingData: bookingData 
      }
    });
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

  const handlePrevImage = () => {
    if (modalRoom && modalRoom.images) {
      setCurrentImageIndex((prev) => (prev - 1 + modalRoom.images.length) % modalRoom.images.length);
    }
  };

  const handleNextImage = () => {
    if (modalRoom && modalRoom.images) {
      setCurrentImageIndex((prev) => (prev + 1) % modalRoom.images.length);
    }
  };

  const handleSelectRoom = (room, occupancy) => {
    setSelectedRoom(room);
    setSelectedOccupancy(occupancy);
    if (onRoomSelect) {
      onRoomSelect({ room, occupancy });
    }
  };

  // Don't render if category is not hotel
  if (category !== 'hotel') {
    return null;
  }

  return (
    <div className="w-full bg-white md:max-w-[1250px] md:mx-auto">
      <div className="sm:px-6 lg:px-4 py-6">
        <h2 className="text-lg md:text-xl font-bold text-[#00065A] mb-6">
          Select Your Room
        </h2>
        
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

                  {/* Location display */}
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
                    {selectedOccupancy.adults} • 1 room
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
                      {formatPrice(selectedOccupancy.originalPrice)}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(selectedOccupancy.price)}
                  </div>
                  <div className="text-white/90 text-sm">
                    Total for 1 room
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookNow(selectedRoom, selectedOccupancy)}
                  className="px-8 py-3 bg-white text-[#06EAFC] rounded-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Details Modal */}
        {showModal && modalRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">{modalRoom.title}</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Gallery */}
                  <div className="lg:w-1/2">
                    <div className="relative mb-4">
                      <img 
                        src={modalRoom.images[currentImageIndex]} 
                        alt={modalRoom.title}
                        className="w-full h-96 object-cover rounded-lg"
                      />
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                    
                    <div className="flex space-x-2 overflow-x-auto">
                      {modalRoom.images?.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="lg:w-1/2">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{modalRoom.name}</h3>
                      <p className="text-gray-600 mb-4">{modalRoom.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {modalRoom.specifications?.map((spec, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={spec.icon} className="text-gray-500" />
                            <div>
                              <div className="text-sm text-gray-500">{spec.label}</div>
                              <div className="font-medium">{spec.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking Options in Modal */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">Select Occupancy</h4>
                      {modalRoom.occupancy?.map((option) => (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-4 ${
                            selectedOccupancy?.id === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{option.adults}</p>
                              <p className="text-sm text-gray-600">{option.breakfast} ({option.breakfastPrice})</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {option.benefits.map((benefit, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-400 line-through">
                                {formatPrice(option.originalPrice)}
                              </div>
                              <div className="text-xs text-red-500">{option.discount}</div>
                              <div className="text-xl font-bold text-gray-900">
                                {formatPrice(option.price)}
                              </div>
                              <div className="text-xs text-gray-500">Per night before taxes</div>
                              
                              <button
                                onClick={() => {
                                  handleSelectRoom(modalRoom, option);
                                  handleBookNow(modalRoom, option);
                                }}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                              >
                                Select & Book
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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