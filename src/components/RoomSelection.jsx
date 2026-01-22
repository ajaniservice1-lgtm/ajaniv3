import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronLeft,
  faChevronRight,
  faStar,
  faMapMarkerAlt,
  faXmark,
  faWifi,
  faTv,
  faCoffee,
  faSnowflake,
  faBath,
  faCar,
  faUtensils,
  faBed,
  faDoorClosed,
  faExpand,
  faRuler,
  faUsers,
  faClock,
  faShower,
  faConciergeBell,
  faParking,
} from "@fortawesome/free-solid-svg-icons";

/* ---------------- HELPERS ---------------- */

const formatPrice = (price) => {
  if (!price) return "₦ --";
  const num = parseInt(price.toString().replace(/[^\d]/g, ""));
  return `₦${num.toLocaleString()}`;
};

const getBestOccupancy = (room) => {
  if (!room?.occupancy?.length) return null;
  return [...room.occupancy]
    .filter((o) => o.isAvailable)
    .sort((a, b) => a.price - b.price)[0];
};

// Helper to format location
const formatLocation = (locationData) => {
  if (!locationData) return "Location not specified";
  
  // If it's a string, return it
  if (typeof locationData === 'string') return locationData;
  
  // If it's an object
  if (typeof locationData === 'object') {
    if (locationData.area) return locationData.area;
    if (locationData.address) return locationData.address;
    if (locationData.name) return locationData.name;
    
    // Handle geolocation object
    if (locationData.geolocation) {
      if (typeof locationData.geolocation === 'object') {
        return `${locationData.geolocation.lat}, ${locationData.geolocation.lng}`;
      }
      return locationData.geolocation;
    }
  }
  
  return "Location not specified";
};

/* ---------------- COMPONENT ---------------- */

const RoomSelection = ({ vendorData, category = "hotel" }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalRoom, setModalRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenGalleryIndex, setFullscreenGalleryIndex] = useState(0);

  if (category !== "hotel") return null;

  // Get formatted location
  const vendorLocation = formatLocation(vendorData?.location);

  /* ---------------- ROOM DATA ---------------- */
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
      amenitiesList: [
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

  /* ---------------- ACTIONS ---------------- */

  const openModal = (room) => {
    setModalRoom(room);
    setCurrentImageIndex(0);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setModalRoom(null);
    document.body.style.overflow = "auto";
  };

  // Open fullscreen gallery
  const openFullscreenGallery = (room, index = 0) => {
    setModalRoom(room);
    setFullscreenGalleryIndex(index);
    setShowFullscreenGallery(true);
    document.body.style.overflow = "hidden";
  };

  // Close fullscreen gallery
  const closeFullscreenGallery = () => {
    setShowFullscreenGallery(false);
    setModalRoom(null);
    setFullscreenGalleryIndex(0);
    document.body.style.overflow = "auto";
  };

  // Navigate gallery
  const handlePrevImage = (modalType = "fullscreen") => {
    if (modalRoom && modalRoom.images) {
      if (modalType === "fullscreen") {
        setFullscreenGalleryIndex((prev) => 
          (prev - 1 + modalRoom.images.length) % modalRoom.images.length
        );
      } else {
        setCurrentImageIndex((prev) => 
          (prev - 1 + modalRoom.images.length) % modalRoom.images.length
        );
      }
    }
  };

  const handleNextImage = (modalType = "fullscreen") => {
    if (modalRoom && modalRoom.images) {
      if (modalType === "fullscreen") {
        setFullscreenGalleryIndex((prev) => 
          (prev + 1) % modalRoom.images.length
        );
      } else {
        setCurrentImageIndex((prev) => 
          (prev + 1) % modalRoom.images.length
        );
      }
    }
  };

  const handleBookNow = (room, option) => {
    const bookingData = {
      room,
      booking: option,
      vendor: vendorData,
    };

    localStorage.setItem("roomBookingData", JSON.stringify(bookingData));
    navigate("/booking", { state: bookingData });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullscreenGallery) {
        if (e.key === "Escape") {
          closeFullscreenGallery();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage("fullscreen");
        } else if (e.key === "ArrowRight") {
          handleNextImage("fullscreen");
        }
      } else if (showModal) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage("details");
        } else if (e.key === "ArrowRight") {
          handleNextImage("details");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullscreenGallery, showModal]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="max-w-[1250px] mx-auto px-2 py-6">
      <h2 className="text-xl font-bold text-[#00065A] mb-6">
        Select Your Room
      </h2>

      {/* ROOM LIST */}
      <div className="space-y-6">
        {roomTypes.map((room) => {
          const bestOption = getBestOccupancy(room);

          return (
            <div
              key={room.id}
              className="border border-gray-200 rounded-xl p-2.5 lg:p-6  transition"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT CARD */}
                <div className="lg:w-[280px] flex-shrink-0">
                  <div className="relative">
                    <img
                      src={room.image}
                      alt={room.title}
                      onClick={() => openFullscreenGallery(room, 0)}
                      className="w-full h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    {/* Image count badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {room.images?.length || 1} photos available, click to view
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mt-3">
                    {room.title}
                  </h3>

                  <div className="flex items-center gap-1 text-sm mt-1">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                    <span>{room.rating}</span>
                    <span className="text-gray-500">
                      ({room.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{vendorLocation}</span>
                  </div>

                  <button
                    onClick={() => openModal(room)}
                    className="mt-3 w-full bg-[#06f49f] py-2 rounded-md text-sm font-medium hover:bg-[#06e495] transition-colors"
                  >
                    Preview Room
                  </button>
                </div>

                {/* RIGHT OPTIONS */}
                <div className="flex-1 space-y-4">
                  {room.occupancy.map((option) => (
                    <div
                      key={option.id}
                      className="bg-gray-50 rounded-lg p-4 flex flex-col lg:flex-row justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{option.adults}</p>
                        <p className="text-sm text-gray-600">
                          {option.breakfast} ({option.breakfastPrice})
                        </p>

                        <div className="mt-2 space-y-1">
                          {option.benefits.map((b, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-green-500 text-xs"
                              />
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 lg:w-48">
                        <p className="line-through text-sm text-gray-400">
                          {formatPrice(option.originalPrice)}
                        </p>
                        <p className="text-xs text-red-500">
                          {option.discount}
                        </p>
                        <p className="text-xl font-bold">
                          {formatPrice(option.price)}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Per night before taxes
                        </p>

                        <button
                          onClick={() => handleBookNow(room, option)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          BOOK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- FULLSCREEN IMAGE GALLERY MODAL ---------------- */}
      {showFullscreenGallery && modalRoom && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h2 className="text-lg font-semibold">{modalRoom.title}</h2>
              <p className="text-sm text-white/80">
                {fullscreenGalleryIndex + 1} / {modalRoom.images?.length}
              </p>
            </div>
            
            <button
              onClick={closeFullscreenGallery}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white text-2xl" />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={modalRoom.images[fullscreenGalleryIndex]}
              alt={`${modalRoom.title} - View ${fullscreenGalleryIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation Buttons */}
            {modalRoom.images.length > 1 && (
              <>
                <button
                  onClick={() => handlePrevImage("fullscreen")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all md:left-8"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                </button>
                
                <button
                  onClick={() => handleNextImage("fullscreen")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all md:right-8"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {modalRoom.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setFullscreenGalleryIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    fullscreenGalleryIndex === index 
                      ? "border-white scale-105" 
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Swipe Instructions */}
          <div className="md:hidden absolute bottom-20 left-0 right-0 text-center text-white/60 text-sm">
            <p>Swipe or use arrows to navigate</p>
          </div>
        </div>
      )}

      {/* ---------------- DETAILS MODAL ---------------- */}
      {showModal && modalRoom && (() => {
        const bestOption = getBestOccupancy(modalRoom);

        return (
          <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-xl overflow-y-auto max-h-[90vh]">
              {/* HEADER */}
              <div className="sticky top-0 bg-white border-b border-gray-300 p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">{modalRoom.title}</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - IMAGES & DETAILS */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={modalRoom.images[currentImageIndex]}
                      className="w-full md:h-[420px] object-cover rounded-xl"
                      alt={modalRoom.title}
                    />

                    {/* Navigation Buttons */}
                    {modalRoom.images.length > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevImage("details")}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                          onClick={() => handleNextImage("details")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3"
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {modalRoom.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-20 h-20 rounded-lg cursor-pointer object-cover border-2 ${
                          currentImageIndex === i
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        alt={`View ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Room Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">About this room</h4>
                      <p className="text-gray-600">{modalRoom.description}</p>
                    </div>

                    {/* Specifications */}
                    <div>
                      <h4 className="font-semibold mb-3">Specifications</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {modalRoom.specifications?.map((spec, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <FontAwesomeIcon icon={spec.icon} className="text-gray-500 w-5" />
                            <div>
                              <div className="text-sm text-gray-500">{spec.label}</div>
                              <div className="font-medium">{spec.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-3">Features</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {modalRoom.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FontAwesomeIcon 
                              icon={feature.included ? faCheck : faTimes} 
                              className={feature.included ? "text-green-500" : "text-red-500"} 
                            />
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-semibold mb-3">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {modalRoom.amenitiesList?.map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - PRICE CARD */}
                {bestOption && (
                  <div className="lg:sticky lg:top-6 border border-gray-300 rounded-xl p-5 h-fit shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold">{bestOption.adults}</p>
                        <p className="text-sm text-gray-600">
                          {bestOption.breakfast} ({bestOption.breakfastPrice})
                        </p>
                      </div>

                      <div className="space-y-2">
                        {bestOption.benefits.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-green-500 text-xs"
                            />
                            {b}
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-gray-300">
                        <p className="line-through text-sm text-gray-400">
                          {formatPrice(bestOption.originalPrice)}
                        </p>
                        <p className="text-red-500 text-xs">
                          {bestOption.discount}
                        </p>
                        <p className="text-3xl font-bold mt-1">
                          {formatPrice(bestOption.price)}
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Per night before taxes
                        </p>

                        <button
                          onClick={() => handleBookNow(modalRoom, bestOption)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                          Book Now
                        </button>
                      </div>

                      {/* All Occupancy Options */}
                      <div className="pt-4 border-t border-gray-300">
                        <h5 className="font-medium mb-3">Other Options</h5>
                        <div className="space-y-3">
                          {modalRoom.occupancy
                            .filter(opt => opt.id !== bestOption.id)
                            .map((option) => (
                              <div key={option.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="text-sm font-medium">{option.adults}</p>
                                  <p className="text-xs text-gray-600">{option.breakfast}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{formatPrice(option.price)}</p>
                                  <button
                                    onClick={() => handleBookNow(modalRoom, option)}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RoomSelection;