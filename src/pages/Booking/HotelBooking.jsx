import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faUsers, faBed, 
  faWifi, faCar, faUtensils,
  faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt,
  faShieldAlt, faCreditCard,
  faHotel, faKey, faConciergeBell,
  faChevronLeft, faSave, faTimes
} from "@fortawesome/free-solid-svg-icons";

// DateGuestSelectorCard Component with editable fields
const DateGuestSelectorCard = ({ 
  checkInDate = new Date(), 
  checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000), 
  guests = { adults: 2, children: 0 }, 
  onSave = () => {},
  onEditClick = () => {}, 
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editCheckInDate, setEditCheckInDate] = useState(checkInDate);
  const [editCheckOutDate, setEditCheckOutDate] = useState(checkOutDate);
  const [editGuests, setEditGuests] = useState(guests);
  
  // Format dates as "Sat, Jan 24"
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  // Format time as "15:00"
  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).slice(0, 5);
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for input field (HH:MM)
  const formatTimeForInput = (date) => {
    if (!date) return "15:00";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate number of nights
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalGuests = editGuests.adults + editGuests.children;
  const nights = calculateNights(editCheckInDate, editCheckOutDate);

  const handleStartEdit = () => {
    setEditCheckInDate(checkInDate);
    setEditCheckOutDate(checkOutDate);
    setEditGuests(guests);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCheckInDate(checkInDate);
    setEditCheckOutDate(checkOutDate);
    setEditGuests(guests);
  };

  const handleSave = () => {
    // Validate dates
    const checkIn = new Date(editCheckInDate);
    const checkOut = new Date(editCheckOutDate);
    
    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date");
      return;
    }
    
    if (editGuests.adults < 1) {
      alert("At least 1 adult is required");
      return;
    }
    
    onSave({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: editGuests
    });
    setIsEditing(false);
  };

  const handleDateChange = (type, value) => {
    if (type === 'checkIn') {
      const newDate = new Date(value);
      // Keep the time from existing date
      newDate.setHours(editCheckInDate.getHours(), editCheckInDate.getMinutes());
      setEditCheckInDate(newDate);
    } else {
      const newDate = new Date(value);
      // Keep the time from existing date
      newDate.setHours(editCheckOutDate.getHours(), editCheckOutDate.getMinutes());
      setEditCheckOutDate(newDate);
    }
  };

  const handleTimeChange = (type, value) => {
    const [hours, minutes] = value.split(':').map(Number);
    
    if (type === 'checkIn') {
      const newDate = new Date(editCheckInDate);
      newDate.setHours(hours, minutes);
      setEditCheckInDate(newDate);
    } else {
      const newDate = new Date(editCheckOutDate);
      newDate.setHours(hours, minutes);
      setEditCheckOutDate(newDate);
    }
  };

  const handleGuestChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setEditGuests(prev => ({
      ...prev,
      [type]: Math.max(0, numValue)
    }));
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Edit Dates & Guests</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date & Time */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Check-in Date</label>
              <input
                type="date"
                value={formatDateForInput(editCheckInDate)}
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={formatDateForInput(new Date())}
              />
              <label className="text-xs font-medium text-gray-700 mt-2">Check-in Time</label>
              <input
                type="time"
                value={formatTimeForInput(editCheckInDate)}
                onChange={(e) => handleTimeChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Check-out Date & Time */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Check-out Date</label>
              <input
                type="date"
                value={formatDateForInput(editCheckOutDate)}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={formatDateForInput(new Date(editCheckInDate.getTime() + 24 * 60 * 60 * 1000))}
              />
              <label className="text-xs font-medium text-gray-700 mt-2">Check-out Time</label>
              <input
                type="time"
                value={formatTimeForInput(editCheckOutDate)}
                onChange={(e) => handleTimeChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Guests */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Guests</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Adults</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleGuestChange('adults', Math.max(1, editGuests.adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={editGuests.adults}
                    onChange={(e) => handleGuestChange('adults', e.target.value)}
                    className="w-16 text-center px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleGuestChange('adults', editGuests.adults + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Children</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleGuestChange('children', Math.max(0, editGuests.children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={editGuests.children}
                    onChange={(e) => handleGuestChange('children', e.target.value)}
                    className="w-16 text-center px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleGuestChange('children', editGuests.children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {nights} night{nights !== 1 ? 's' : ''} • {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex items-center justify-between gap-4">
          {/* Check-in section */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-1">Check-in</div>
            <div>
              <div className="text-sm font-semibold text-gray-900 truncate">{formatDate(checkInDate)}</div>
              <div className="text-xs text-gray-500 truncate">{formatTime(checkInDate)}</div>
            </div>
          </div>

          {/* Nights and arrow */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">{nights} night{nights !== 1 ? 's' : ''}</div>
            <div className="text-gray-400 text-sm">→</div>
          </div>

          {/* Check-out section */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-1">Check-out</div>
            <div>
              <div className="text-sm font-semibold text-gray-900 truncate">{formatDate(checkOutDate)}</div>
              <div className="text-xs text-gray-500 truncate">{formatTime(checkOutDate)}</div>
            </div>
          </div>

          {/* Vertical separator */}
          <div className="h-10 w-px bg-gray-300"></div>

          {/* Guests and Change button */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="text-right mb-1">
              <div className="text-sm font-semibold text-gray-900">{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</div>
              <div className="text-xs text-gray-500">Guests</div>
            </div>
            <button
              onClick={handleStartEdit}
              className="bg-[#6cff] text-white text-xs font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HotelBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "Nigeria",
    phone: "+234 ",
    specialRequests: "",
    paymentMethod: "hotel"
  });

  const [selectedPayment, setSelectedPayment] = useState("hotel");
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelData, setHotelData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState("");

  // Date states for the DateGuestSelectorCard
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [guests, setGuests] = useState({ adults: 2, children: 0 });

  // Simple auth check - just check if user has auth token
  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token");
    const guestSession = localStorage.getItem("guestSession");
    
    if (token || guestSession) {
      return true;
    }
    
    return false;
  };

  // Fix 1: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Generate unique booking ID
  useEffect(() => {
    const generateBookingId = () => {
      const prefix = "AJN-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());
  }, []);

  // Parse date strings to Date objects
  const parseDateString = (dateString) => {
    if (!dateString) return new Date();
    
    // Try to parse from various formats
    if (typeof dateString === 'string') {
      // Check if it's a date string like "Sat, Jan 24"
      if (dateString.includes(',')) {
        const parts = dateString.split(',');
        if (parts.length > 1) {
          const monthDay = parts[1].trim().split(' ');
          const month = monthDay[0];
          const day = parseInt(monthDay[1]);
          const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          const currentYear = new Date().getFullYear();
          return new Date(currentYear, monthMap[month], day);
        }
      }
      
      // Check if it's a relative date like "Today" or "Tomorrow"
      if (dateString === 'Today') return new Date();
      if (dateString === 'Tomorrow') return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    return new Date();
  };

  useEffect(() => {
    const loadBookingData = () => {
      setLoading(true);
      
      console.log("🔄 Loading hotel booking data...");
      
      // Load vendor data from multiple sources
      const vendorDataFromState = location.state?.vendorData || location.state?.bookingData?.hotel;
      const fromLocalStorage = localStorage.getItem('currentVendorBooking');
      const fromSession = sessionStorage.getItem('currentVendorBooking');
      const roomBookingData = localStorage.getItem('roomBookingData');
      
      let vendorData = null;
      
      // Priority: location state > localStorage > sessionStorage
      if (vendorDataFromState) {
        console.log("📦 Vendor data from location state:", vendorDataFromState);
        vendorData = vendorDataFromState;
      } else if (fromLocalStorage) {
        vendorData = JSON.parse(fromLocalStorage);
      } else if (fromSession) {
        vendorData = JSON.parse(fromSession);
      }
      
      if (vendorData) {
        console.log("🏨 Hotel data set:", vendorData);
        setHotelData(vendorData);
      }
      
      // Load room data with priority
      if (roomBookingData) {
        try {
          const parsedData = JSON.parse(roomBookingData);
          console.log("🛏️ Room data loaded from localStorage:", parsedData);
          setRoomData(parsedData);
          
          // Set dates from room data
          if (parsedData.booking) {
            const checkIn = parseDateString(parsedData.booking.checkIn);
            const checkOut = parseDateString(parsedData.booking.checkOut);
            setCheckInDate(checkIn);
            setCheckOutDate(checkOut);
            
            // Set guests from room data
            if (parsedData.booking.adults) {
              setGuests({
                adults: parsedData.booking.adults,
                children: parsedData.booking.children || 0
              });
            }
          }
          
          // If we have room data but no hotel data, extract from room data
          if (!vendorData && parsedData.hotel) {
            setHotelData(parsedData.hotel);
          }
        } catch (error) {
          console.error("❌ Failed to parse room data:", error);
        }
      } else if (location.state?.bookingData) {
        console.log("📦 Room data from location state:", location.state.bookingData);
        setRoomData(location.state.bookingData);
        
        // Set dates from location state
        if (location.state.bookingData.booking) {
          const checkIn = parseDateString(location.state.bookingData.booking.checkIn);
          const checkOut = parseDateString(location.state.bookingData.booking.checkOut);
          setCheckInDate(checkIn);
          setCheckOutDate(checkOut);
          
          // Set guests from location state
          if (location.state.bookingData.booking.adults) {
            setGuests({
              adults: location.state.bookingData.booking.adults,
              children: location.state.bookingData.booking.children || 0
            });
          }
        }
        
        if (location.state.bookingData.hotel) {
          setHotelData(location.state.bookingData.hotel);
        }
      } else if (vendorData?.selectedRoom) {
        // Create room data from selected room
        const roomInfo = vendorData.selectedRoom;
        const newRoomData = {
          hotel: {
            id: vendorData.id || vendorData._id,
            name: vendorData.name || vendorData.title,
            location: vendorData.area || vendorData.location || "Location not specified",
            rating: vendorData.rating || 4.5,
            image: vendorData.image || vendorData.images?.[0],
            category: vendorData.category || "hotel"
          },
          room: {
            id: roomInfo.id || `room-${Date.now()}`,
            title: roomInfo.title || "Standard Room",
            name: roomInfo.name || "Standard Room",
            description: roomInfo.description || "Comfortable room with all amenities",
            image: roomInfo.image || vendorData.image,
            images: roomInfo.images || [roomInfo.image || vendorData.image],
            size: roomInfo.size || "Not specified",
            beds: roomInfo.beds || "1 Double Bed",
            maxOccupancy: roomInfo.maxOccupancy || 2,
            features: roomInfo.features || [],
            amenities: roomInfo.amenitiesList || [],
            rating: roomInfo.rating || 4.5,
            reviewCount: roomInfo.reviewCount || 0
          },
          booking: {
            checkIn: roomInfo.checkIn || "Today",
            checkOut: roomInfo.checkOut || "Tomorrow",
            adults: roomInfo.adults || roomInfo.occupancy?.[0]?.adults || 2,
            children: roomInfo.children || 0,
            nights: roomInfo.nights || 1,
            price: roomInfo.price || roomInfo.occupancy?.[0]?.price || vendorData.priceFrom || 0,
            originalPrice: roomInfo.originalPrice || roomInfo.occupancy?.[0]?.originalPrice || vendorData.priceTo || 0,
            discount: roomInfo.discount || roomInfo.occupancy?.[0]?.discount || "",
            breakfast: roomInfo.breakfast || roomInfo.occupancy?.[0]?.breakfast || "",
            breakfastPrice: roomInfo.breakfastPrice || roomInfo.occupancy?.[0]?.breakfastPrice || "",
            benefits: roomInfo.benefits || roomInfo.occupancy?.[0]?.benefits || ["Pay at hotel", "Free WiFi"],
            checkInTime: roomInfo.checkInTime || "15:00",
            totalPrice: roomInfo.totalPrice || roomInfo.price || vendorData.priceFrom || 0,
            perNight: roomInfo.perNight || roomInfo.price || vendorData.priceFrom || 0
          }
        };
        console.log("🛠️ Created room data:", newRoomData);
        setRoomData(newRoomData);
        
        // Set dates and guests from created room data
        const checkIn = parseDateString(newRoomData.booking.checkIn);
        const checkOut = parseDateString(newRoomData.booking.checkOut);
        setCheckInDate(checkIn);
        setCheckOutDate(checkOut);
        setGuests({
          adults: newRoomData.booking.adults,
          children: newRoomData.booking.children || 0
        });
      }
      
      // Load saved guest info
      const savedGuestInfo = localStorage.getItem('bookingData');
      if (savedGuestInfo) {
        try {
          const guestData = JSON.parse(savedGuestInfo);
          setBookingData(prev => ({
            ...prev,
            ...guestData
          }));
        } catch (error) {
          console.error("❌ Failed to parse guest info:", error);
        }
      }
      
      // Pre-fill user data if logged in
      const isAuthenticated = checkAuthStatus();
      if (isAuthenticated) {
        try {
          const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userEmail = localStorage.getItem("user_email");
          
          if (userProfile.firstName || userProfile.lastName || userProfile.email || userEmail) {
            setBookingData(prev => ({
              ...prev,
              firstName: userProfile.firstName || prev.firstName,
              lastName: userProfile.lastName || prev.lastName,
              email: userProfile.email || userEmail || prev.email,
              phone: userProfile.phone || prev.phone
            }));
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
      
      setLoading(false);
      console.log("✅ Booking data loading complete");
    };

    loadBookingData();
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
    setBookingData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleSaveDatesGuests = (updatedData) => {
    // Update local state
    setCheckInDate(updatedData.checkInDate);
    setCheckOutDate(updatedData.checkOutDate);
    setGuests(updatedData.guests);
    
    // Update roomData with new values
    if (roomData) {
      const updatedRoomData = {
        ...roomData,
        booking: {
          ...roomData.booking,
          checkIn: formatDateForDisplay(updatedData.checkInDate),
          checkOut: formatDateForDisplay(updatedData.checkOutDate),
          adults: updatedData.guests.adults,
          children: updatedData.guests.children || 0,
          nights: calculateNights(updatedData.checkInDate, updatedData.checkOutDate)
        }
      };
      setRoomData(updatedRoomData);
      
      // Save to localStorage
      localStorage.setItem('roomBookingData', JSON.stringify(updatedRoomData));
    }
    
    // Show success message
    console.log("✅ Dates and guests updated successfully");
  };

  const handleEditDatesGuests = () => {
    // For mobile, you can still navigate back or show modal
    // For now, we'll use inline editing, so this might not be needed
    // But keeping it for backward compatibility
    console.log("Edit dates and guests");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomData) {
      alert("Please select a room first");
      navigate(-1);
      return;
    }

    // Validate required fields
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      alert("Please fill in all required contact information");
      return;
    }

    // Check authentication - SIMPLE CHECK
    const isAuthenticated = checkAuthStatus();
    
    if (!isAuthenticated) {
      console.log("User not authenticated, saving booking and redirecting to login");
      
      // Save ALL booking data to localStorage
      const completeBooking = {
        type: "hotel",
        hotelId: hotelData?.id || roomData.hotel?.id,
        hotelName: hotelData?.name || roomData.hotel?.name,
        hotelImage: hotelData?.image || roomData.hotel?.image,
        roomData: roomData,
        bookingData: bookingData,
        selectedPayment: selectedPayment,
        bookingId: bookingId,
        totalAmount: calculateTotal(),
        checkInDate: roomData.booking?.checkIn,
        checkOutDate: roomData.booking?.checkOut,
        guests: guests,
        timestamp: Date.now()
      };
      
      // Save complete booking for later restoration
      localStorage.setItem("pendingHotelBooking", JSON.stringify(completeBooking));
      localStorage.setItem("bookingData", JSON.stringify(bookingData));
      localStorage.setItem("roomBookingData", JSON.stringify(roomData));
      
      // Redirect to login WITH booking intent
      navigate("/login", { 
        state: { 
          message: "Please login or continue as guest to complete your booking",
          fromBooking: true,
          intent: "hotel_booking",
          returnTo: "/booking-confirmation/hotel"
        } 
      });
      return;
    }

    console.log("🚀 User authenticated, proceeding with booking...");

    // Save guest information
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Combine booking data
    const completeBooking = {
      ...bookingData,
      paymentMethod: selectedPayment,
      roomData: roomData,
      hotelData: hotelData,
      bookingType: 'hotel',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      status: selectedPayment === "card" ? "pending_payment" : "confirmed",
      totalAmount: calculateTotal(),
      timestamp: Date.now(),
      userId: JSON.parse(localStorage.getItem("userProfile") || "{}")._id || null
    };

    console.log("💾 Complete booking data:", completeBooking);

    // Save complete booking data
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('hotelBooking', JSON.stringify(completeBooking));
    
    // Clear temporary data
    localStorage.removeItem('roomBookingData');
    localStorage.removeItem('currentVendorBooking');
    localStorage.removeItem('pendingHotelBooking');
    
    // Navigate to confirmation
    console.log("✅ Booking completed, redirecting to confirmation");
    navigate('/booking-confirmation/hotel', { 
      state: { 
        bookingData: completeBooking,
        bookingType: 'hotel'
      } 
    });
  };

  // ALL FEES SET TO ZERO
  const calculateTotal = () => {
    if (!roomData?.booking?.price) return 0;
    const roomPrice = roomData.booking.price;
    // All fees set to 0
    const taxes = 0;
    const serviceFee = 0;
    return roomPrice + taxes + serviceFee; // Just room price
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const getLocationString = (locationData) => {
    if (!locationData) return 'Location not specified';
    if (typeof locationData === 'string') return locationData;
    if (typeof locationData === 'object') {
      if (locationData.area) return locationData.area;
      if (locationData.address) return locationData.address;
      if (locationData.location) return getLocationString(locationData.location);
    }
    return 'Location not specified';
  };

  // Helper functions
  function formatDateForDisplay(date) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-3 py-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBed} className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Room Selected</h2>
            <p className="text-gray-600 mb-5">Please select a room before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              ← Go Back & Select Room
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ALL FEES SET TO ZERO
  const roomPrice = roomData?.booking?.price || 0;
  const taxes = 0;
  const serviceFee = 0;
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Reduced top spacing */}
      <div className="pt-0">
        {/* Main container with edge-to-edge padding on mobile */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          {/* Stepper - Reduced spacing */}
          <div className="mb-4 sm:mb-8">
            <Stepper currentStep={1} />
          </div>
          
          {/* Grid layout with DateGuestSelectorCard in right column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Main content */}
            <div className="lg:col-span-2">
              {/* DateGuestSelectorCard - Mobile only */}
              <div className="lg:hidden mb-6">
                <DateGuestSelectorCard
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  guests={guests}
                  onSave={handleSaveDatesGuests}
                  onEditClick={handleEditDatesGuests}
                />
              </div>
              
              {/* Main Card - Reduced padding and border radius on mobile */}
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Back Button - Compact */}
                <div className="px-3 sm:px-6 pt-3 sm:pt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    <span className="font-medium">Back to room selection</span>
                  </button>
                </div>

                <div className="p-3 sm:p-6">
                  {/* Header - Compact */}
                  <div className="px-1 mb-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      {hotelData?.category === 'shortlet' ? 'Book Your Shortlet Stay' : 
                       hotelData?.category === 'restaurant' ? 'Book Your Restaurant Table' : 
                       'Complete Your Hotel Booking'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {hotelData?.category === 'shortlet' ? 'Please fill in your details to book your stay' : 
                       hotelData?.category === 'restaurant' ? 'Please fill in your details to reserve your table' : 
                       'Please fill in your details to secure your stay'}
                    </p>
                  </div>

                  {/* Hotel & Room Preview Card - Compact */}
                  <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="md:w-1/3 relative">
                        <img 
                          src={roomData.hotel?.image || hotelData?.image} 
                          alt={roomData.hotel?.name}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                          {roomData.hotel?.rating || 4.5}
                        </div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {roomData.hotel?.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                              <span className="truncate">{getLocationString(roomData.hotel?.location)}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {roomData.room?.title}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faBed} className="text-blue-600 text-xs" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Beds</p>
                              <p className="font-medium text-xs">{roomData.room?.beds}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Guests</p>
                              <p className="font-medium text-xs">{guests.adults} adults</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                            <span>{formatDateForDisplay(checkInDate)} → {formatDateForDisplay(checkOutDate)}</span>
                          </div>
                          <div className="hidden sm:block h-3 w-px bg-gray-300"></div>
                          <div>
                            <span className="font-semibold">{calculateNights(checkInDate, checkOutDate)} night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options - Compact */}
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-sm" />
                      Payment Options
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handlePaymentChange("hotel")}
                        className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                          selectedPayment === "hotel" 
                            ? 'border-[#6cff] bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPayment === "hotel" 
                              ? 'border-[#6cff] bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedPayment === "hotel" && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <FontAwesomeIcon icon={faHotel} className="text-blue-600 text-xs" />
                              <span className="font-bold text-gray-900 text-xs sm:text-sm">Pay at Hotel</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-tight">Pay when you arrive</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handlePaymentChange("card")}
                        className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                          selectedPayment === "card" 
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPayment === "card" 
                              ? 'border-emerald-500 bg-emerald-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedPayment === "card" && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <FontAwesomeIcon icon={faCreditCard} className="text-emerald-600 text-xs" />
                              <span className="font-bold text-gray-900 text-xs sm:text-sm">Credit/Debit Card</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-tight">Secure online payment</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4 sm:mb-6">
                    <div className="mb-3">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUser} className="text-blue-500 text-sm" />
                        Guest Information
                      </h2>
                      <p className="text-xs text-gray-600">Who's checking in?</p>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            First Name *
                          </label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={bookingData.firstName}
                            onChange={handleInputChange}
                            placeholder="FirstName"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Last Name *
                          </label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={bookingData.lastName}
                            onChange={handleInputChange}
                            placeholder="LastName"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input 
                            type="email" 
                            name="email"
                            value={bookingData.email}
                            onChange={handleInputChange}
                            placeholder="your email address or gmail address"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input 
                            type="tel" 
                            name="phone"
                            value={bookingData.phone}
                            onChange={handleInputChange}
                            placeholder="+234 800 000 0000"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Special Requests
                        </label>
                        <textarea
                          name="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={handleInputChange}
                          rows={2}
                          placeholder="Any special requirements or preferences..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <div className="mt-6">
                    <div className="flex items-start gap-2 mb-3 p-2.5 bg-blue-50 rounded-lg">
                      <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                        By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my booking is subject to the hotel's cancellation policy and any applicable fees.
                      </label>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-[#6cff] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                    >
                      {selectedPayment === "hotel" ? "Confirm Booking" : "Proceed to Payment"}
                      <span className="ml-2">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary & DateGuestSelectorCard */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-4">
               
                
                {/* Summary Header */}
                <div className="bg-[#6cff] rounded-lg p-3 text-white">
                  <h3 className="text-base font-bold mb-1">Booking Summary</h3>
                  <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                </div>
                
                 {/* DateGuestSelectorCard - Desktop only */}
                <div className="hidden lg:block">
                  <DateGuestSelectorCard
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    guests={guests}
                    onSave={handleSaveDatesGuests}
                    onEditClick={handleEditDatesGuests}
                  />
                </div>

                {/* Hotel Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-2.5">
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={roomData.hotel?.image} 
                        alt={roomData.hotel?.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{roomData.hotel?.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                          <span className="text-xs font-medium">{roomData.hotel?.rating}</span>
                          <span className="text-xs text-gray-500 hidden sm:inline">• {getLocationString(roomData.hotel?.location)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-600">Room Type</span>
                        <span className="text-xs font-semibold text-gray-900">{roomData.room?.title}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Stay Duration</span>
                        <span className="text-xs font-medium">{calculateNights(checkInDate, checkOutDate)} night</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-3">
                    <h5 className="font-bold text-gray-900 mb-2 text-sm">Price Breakdown</h5>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Room x {calculateNights(checkInDate, checkOutDate)} night</span>
                        <span className="font-medium">{formatPrice(roomData.booking?.price)}</span>
                      </div>
                      
                      {/* Taxes & Fees - Showing as ₦0 */}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="font-medium">{formatPrice(taxes)}</span>
                      </div>
                      
                      {/* Service fee - Showing as ₦0 */}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">{formatPrice(serviceFee)}</span>
                      </div>
                      
                      {/* Discount */}
                      {roomData.booking?.discount && (
                        <div className="pt-1.5 border-t border-gray-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-bold text-emerald-600">{roomData.booking.discount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Total */}
                    <div className="mt-2.5 pt-2.5 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {selectedPayment === "hotel" ? "Pay at hotel upon arrival" : "Payment required now"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Benefits Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 p-2.5">
                  <h6 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-sm">
                    <FontAwesomeIcon icon={faConciergeBell} className="text-emerald-600" />
                    What's Included
                  </h6>
                  <div className="space-y-1">
                    {roomData.booking?.benefits?.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Guarantee */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                    <span className="font-medium">Best Price Guarantee</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Free cancellation up to 24 hours before check-in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HotelBooking;