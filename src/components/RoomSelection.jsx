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

  // Room data matching the original 3 rooms with their exact content
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
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Pay at hotel', 'Free cancellation', 'No prepayment needed'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        },
        { 
          id: 'occ-2',
          adults: "4 adults", 
          price: 375865,
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Pay at hotel', 'Free cancellation', 'Best price guarantee'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: true
        },
        { 
          id: 'occ-3',
          adults: "6 adults", 
          price: null,
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Pay at hotel', 'Free cancellation'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking'],
          isAvailable: false
        }
      ],
      maxRooms: 8,
      rating: 4.78,
      reviewCount: 23
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
          adults: "4 adults", 
          price: 445865,
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Free cancellation', 'Pay at hotel', 'No prepayment needed'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Breakfast included'],
          isAvailable: true
        },
        { 
          id: 'occ-5',
          adults: "2 adults", 
          price: 405865,
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Free cancellation', 'Pay later option', 'Breakfast included'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Room service'],
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
          breakfast: 'Very good breakfast available (₦43,013)',
          benefits: ['Free cancellation', 'Pay later option', 'Breakfast included'],
          amenities: ['Pay at hotel', 'Free WiFi', 'Parking', 'Room service'],
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
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalRoom(null);
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
              {/* Main 4-column layout for large screens */}
              <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-0">
                
                {/* Column 1: Room Images and Info - 25% width */}
                <div className="lg:w-1/4 lg:border-r lg:border-gray-200 lg:pr-6 mb-6 lg:mb-0">
                  <div className="flex flex-col h-full">
                    {/* Main Image */}
                    <div 
                      className="relative h-48 w-full rounded-xl overflow-hidden mb-4 cursor-pointer"
                      onClick={() => handleViewDetails(room)}
                    >
                      <img 
                        src={room.image} 
                        alt={room.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="text-[#ffc802]" />
                        <span>{room.rating}</span>
                      </div>
                    </div>
                    
                    {/* Small Images */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {room.subImages?.map((img, index) => (
                        <div 
                          key={index} 
                          className="h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
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
                    
                    {/* Room Title and Rating */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{room.title}</h3>
                        <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-md">
                          <FontAwesomeIcon icon={faStar} className="text-[#ffc802]" />
                          <span className="text-sm font-medium">{room.rating}</span>
                          <span className="text-xs text-gray-500">({room.reviewCount})</span>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-black" />
                        <span>{hotelInfo.location}</span>
                      </div>
                      
                      {/* Room Description */}
                      <p className="text-sm text-gray-600 mb-4">{room.description}</p>
                    </div>
                    
                    {/* Key Features */}
                    <div className="mt-auto">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Features</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        {room.features.slice(0, 4).map((feature, idx) => (
                          <span key={idx} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={feature.icon} className="text-black" />
                            <span>{feature.name}</span>
                          </span>
                        ))}
                      </div>
                      
                      {/* Preview Room Button */}
                      <button
                        onClick={() => handleViewDetails(room)}
                        className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                      >
                        Preview Room
                      </button>
                    </div>
                  </div>
                </div>

                {/* Occupancy Options - 75% width divided equally */}
                <div className="lg:w-3/4 lg:flex">
                  {room.occupancy.map((option, index) => (
                    <React.Fragment key={option.id}>
                      <div className={`lg:w-1/${room.occupancy.length} ${
                        index < room.occupancy.length - 1 ? 'lg:border-r lg:border-gray-200' : ''
                      } ${index > 0 ? 'lg:px-6' : 'lg:pl-6 lg:pr-4'}`}>
                        
                        {/* Occupancy Header */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FontAwesomeIcon icon={faUser} className="text-black" />
                              {option.adults}
                            </span>
                            
                            {/* Availability Badge */}
                            {option.isAvailable ? (
                              <span className="text-xs text-[#FF5C39] bg-amber-50 px-2 py-1 rounded">
                                Available
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Not Available
                              </span>
                            )}
                          </div>
                          
                          {option.breakfast && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                              <FontAwesomeIcon icon={faCoffee} className="text-black" />
                              {option.breakfast}
                            </p>
                          )}
                        </div>

                        {/* Price Section - Only show price if available */}
                        {option.isAvailable && option.price ? (
                          <div className="mb-4">
                            {option.discount ? (
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
                            ) : (
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {formatPrice(option.price)}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">Per night before taxes</p>
                          </div>
                        ) : !option.isAvailable && (
                          <div className="mb-4">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                              {formatPrice(option.price)}
                            </div>
                            <p className="text-xs text-gray-500">Per night before taxes</p>
                          </div>
                        )}

                        {/* Amenities */}
                        {option.amenities && (
                          <ul className="text-xs text-green-600 space-y-1 mb-6">
                            {option.amenities.slice(0, 3).map((amenity, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faCheck} className="text-black" />
                                {amenity}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Book Now Button - Only show if available */}
                        <div className="mt-4">
                          {option.isAvailable && option.price ? (
                            <>
                              <button
                                onClick={() => handleBookNow(room, option)}
                                className="w-full py-3 bg-gradient-to-r from-[#2C83F9] to-[#06E] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 cursor-pointer mb-2"
                              >
                                Book Now
                              </button>
                              <p className="text-[11px] text-gray-500">It only takes two minutes</p>
                              <p className="text-[11px] text-[#FF5C39]">Limited availability</p>
                            </>
                          ) : !option.isAvailable && (
                            <button
                              disabled
                              className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                            >
                              Not Available
                            </button>
                          )}
                        </div>

                        {/* Select Option Button */}
                        {option.isAvailable && option.price && (
                          <button
                            onClick={() => handleOccupancySelect(room, option)}
                            className={`w-full mt-3 py-2 border rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                              selectedRoom?.id === room.id && selectedOccupancy?.id === option.id
                                ? 'border-[#06EAFC] bg-blue-50 text-[#06EAFC]'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {selectedRoom?.id === room.id && selectedOccupancy?.id === option.id
                              ? 'Selected'
                              : 'Select Option'
                            }
                          </button>
                        )}
                      </div>
                    </React.Fragment>
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
                    {selectedOccupancy.adults} • {selectedRoomsCount} room{selectedRoomsCount > 1 ? 's' : ''} • Free cancellation
                  </p>
                  <p className="text-white/90 text-sm">
                    {selectedOccupancy.breakfast && selectedOccupancy.breakfast.split('(')[0].trim()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  {selectedOccupancy.price ? (
                    <>
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(selectedOccupancy.price * selectedRoomsCount)}
                      </div>
                      {selectedOccupancy.originalPrice && (
                        <div className="text-white/80 text-sm line-through">
                          {formatPrice(selectedOccupancy.originalPrice * selectedRoomsCount)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(selectedOccupancy.price)}
                    </div>
                  )}
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

        {/* Modal for Room Details with Glass Effect */}
        {showModal && modalRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            {/* Glass effect background */}
            <div 
              className="absolute inset-0 bg-black/50 cursor-pointer"
              onClick={handleCloseModal}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-[1245px] max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon icon={faStar} className="text-black" />
                    <span className="font-medium">{modalRoom.rating}</span>
                    <span className="text-sm text-gray-500">({modalRoom.reviewCount} reviews)</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{modalRoom.title}</h3>
                  <p className="text-gray-600 text-sm">{modalRoom.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-black" />
                    <span>{hotelInfo.location}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100/50 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
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
                      <div key={index} className="rounded-xl overflow-hidden h-48 shadow-lg cursor-pointer" onClick={() => window.open(img, '_blank')}>
                        <img
                          src={img}
                          alt={`${modalRoom.title} - ${index + 1}`}
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
                          <FontAwesomeIcon icon={spec.icon} className="text-black" />
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
                              className="text-black" 
                            />
                          ) : feature.included ? (
                            <FontAwesomeIcon icon={faCheck} className="text-black" />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} className="text-black" />
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

                  {/* Pricing & Occupancy Options */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Options</h4>
                    <div className="space-y-4">
                      {modalRoom.occupancy.map((option) => (
                        <div key={option.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="font-medium text-gray-900 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-black" />
                                {option.adults}
                              </span>
                              {option.breakfast && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faCoffee} className="text-black" />
                                  {option.breakfast}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {option.isAvailable ? (
                                <span className="text-xs text-[#FF5C39] bg-amber-50 px-2 py-1 rounded">
                                  Available
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Not Available
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {option.isAvailable && option.price ? (
                            <div className="mb-3">
                              {option.discount ? (
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
                              ) : (
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(option.price)}
                                </div>
                              )}
                              <div className="text-sm text-gray-600">Per night before taxes</div>
                            </div>
                          ) : !option.isAvailable && (
                            <div className="mb-3">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(option.price)}
                              </div>
                              <div className="text-sm text-gray-600">Per night before taxes</div>
                            </div>
                          )}
                          
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
                          
                          {/* Book Button */}
                          {option.isAvailable && option.price && (
                            <button
                              onClick={() => {
                                setSelectedRoom(modalRoom);
                                setSelectedOccupancy(option);
                                handleBookNow(modalRoom, option);
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 cursor-pointer"
                            >
                              Book This Option
                            </button>
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
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50/50 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    if (modalRoom.occupancy[0]?.isAvailable) {
                      handleOccupancySelect(modalRoom, modalRoom.occupancy[0]);
                    }
                    handleCloseModal();
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                    selectedRoom?.id === modalRoom.id
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-[#06EAFC] text-white hover:bg-[#05d9eb]'
                  }`}
                >
                  {selectedRoom?.id === modalRoom.id ? 'Deselect Room' : 'Select This Room'}
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