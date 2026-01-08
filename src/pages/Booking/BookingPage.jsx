import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserGraduate, 
  faCreditCard, 
  faCheckCircle,
  faMapMarkerAlt,
  faStar,
  faChevronLeft,
  faPrint,
  faHome
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../hook/useAuth";

// Fallback images for different categories
const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  event: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
};

// Category normalization utility
const normalizeCategory = (category) => {
  if (!category) return 'restaurant';
  
  const cat = category.toString().toLowerCase().trim();
  
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('eatery') || cat.includes('diner') || cat.includes('bistro')) {
    return 'restaurant';
  }
  if (cat.includes('hotel') || cat.includes('shortlet') || cat.includes('resort') || cat.includes('inn') || cat.includes('motel') || cat.includes('lodging')) {
    return 'hotel';
  }
  if (cat.includes('event') || cat.includes('venue') || cat.includes('hall') || cat.includes('center') || cat.includes('conference') || cat.includes('meeting')) {
    return 'event';
  }
  
  return 'restaurant';
};

// Simple Stepper Component with Font Awesome icons
const StepProgress = ({ activeStep = 0 }) => {
  const steps = [
    {
      title: "Customer",
      subtitle: "Information",
      icon: faUserGraduate,
    },
    {
      title: "Payment",
      subtitle: "Information",
      icon: faCreditCard,
    },
    {
      title: "Booking is",
      subtitle: "Confirmed",
      icon: faCheckCircle,
    },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isActive = index === activeStep;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2
                ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-500"
                    : "border-gray-200 bg-gray-100 text-gray-400"
                }`}
              >
                <FontAwesomeIcon 
                  icon={step.icon} 
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}
                />
              </div>

              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-800 leading-tight">
                {step.title}
                <br />
                {step.subtitle}
              </p>
            </div>

            {index !== steps.length - 1 && (
              <div className="w-12 sm:w-20 mx-2 sm:mx-4 border-t-2 border-dashed border-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    contactName: "",
    phoneNumber: "",
    email: "",
    date: "",
    time: "",
    eventType: "",
    proposedCount: "2",
    expectedGuests: "2",
    duration: "4 hours",
    eventRequirements: "",
    numberOfGuests: "2",
    specialRequests: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: "1",
    numberOfNights: "1",
    guestName: "",
    country: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        console.log("Fetching vendor data...");
        console.log("Location state:", location.state);
        console.log("ID from params:", id);
        
        // Check if we have data in route state first
        if (location.state?.vendorData) {
          console.log("Using vendor data from route state");
          setVendorData(location.state.vendorData);
          localStorage.setItem('currentVendorBooking', JSON.stringify(location.state.vendorData));
          sessionStorage.setItem('currentVendorBooking', JSON.stringify(location.state.vendorData));
          setLoading(false);
          return;
        }
        
        // Try to get from sessionStorage (more reliable for immediate access)
        const sessionVendorData = sessionStorage.getItem('currentVendorBooking');
        if (sessionVendorData) {
          try {
            console.log("Using vendor data from sessionStorage");
            const parsedData = JSON.parse(sessionVendorData);
            setVendorData(parsedData);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing session vendor data:", error);
          }
        }
        
        // Try to get from localStorage
        const storedVendorData = localStorage.getItem('currentVendorBooking');
        if (storedVendorData) {
          try {
            console.log("Using vendor data from localStorage");
            const parsedData = JSON.parse(storedVendorData);
            setVendorData(parsedData);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing localStorage vendor data:", error);
          }
        }
        
        // If we have an ID but no stored data, try to fetch from API
        if (id) {
          console.log("Fetching vendor details for ID:", id);
          await fetchVendorDetails(id);
        } else {
          console.error("No vendor data available");
          setError("Please select a vendor to book from the vendor details page.");
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setError("Failed to load vendor details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id, location.state]);

  useEffect(() => {
    // Check for pending booking data
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking && vendorData) {
      try {
        const parsed = JSON.parse(pendingBooking);
        if (parsed.vendorId === (vendorData.id || id)) {
          console.log("Restoring pending booking data");
          setBookingData(parsed.bookingData);
          setActiveStep(parsed.activeStep || 0);
          localStorage.removeItem("pendingBooking");
        }
      } catch (error) {
        console.error("Error parsing pending booking:", error);
      }
    }
  }, [vendorData, id]);

  const fetchVendorDetails = async (vendorId) => {
    try {
      // This is a fallback method - you should implement your actual API call
      console.log("Fetching vendor details for:", vendorId);
      
      // For now, we'll use a mock response since we're relying on localStorage
      const mockVendorData = {
        id: vendorId,
        name: "Sample Vendor",
        category: "restaurant",
        priceFrom: "₦5,000",
        area: "Ibadan",
        description: "A sample vendor description",
        rating: "4.5",
        reviews: "50",
        image: FALLBACK_IMAGES.default
      };
      
      setVendorData(mockVendorData);
      localStorage.setItem('currentVendorBooking', JSON.stringify(mockVendorData));
      
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setError("Failed to fetch vendor details");
    }
  };

  const normalizedCategory = vendorData ? normalizeCategory(vendorData.category) : 'restaurant';

  const handleQuantityChange = (field, delta) => {
    setBookingData(prev => {
      const currentValue = parseInt(prev[field]) || 0;
      const newValue = Math.max(1, currentValue + delta);
      return {
        ...prev,
        [field]: newValue.toString()
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (activeStep < 2) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      if (!bookingData.contactName.trim()) return false;
      if (!bookingData.phoneNumber.trim()) return false;
      if (!bookingData.email.trim()) return false;
      
      if (normalizedCategory === 'event') {
        if (!bookingData.date) return false;
        if (!bookingData.eventType.trim()) return false;
      } else if (normalizedCategory === 'restaurant') {
        if (!bookingData.date) return false;
        if (!bookingData.time) return false;
      } else if (normalizedCategory === 'hotel') {
        if (!bookingData.checkInDate) return false;
        if (!bookingData.checkOutDate) return false;
        if (!bookingData.guestName.trim()) return false;
      }
    }
    return true;
  };

  const handleSubmitBooking = () => {
    if (activeStep === 1 && !isAuthenticated) {
      alert("Please login to complete your booking");
      
      localStorage.setItem("pendingBooking", JSON.stringify({
        vendorId: vendorData?.id || id,
        bookingData,
        activeStep,
        vendorData
      }));
      
      localStorage.setItem("redirectAfterLogin", `/booking`);
      navigate("/login");
      return;
    }
    
    const isSuccess = Math.random() > 0.3;
    
    if (isSuccess) {
      navigate(`/booking-confirmation/${vendorData?.id || id}`);
    } else {
      navigate(`/booking-failed/${vendorData?.id || id}`);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderCustomerInfo();
      case 1:
        return renderPaymentInfo();
      case 2:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderCustomerInfo = () => {
    switch (normalizedCategory) {
      case 'event':
        return renderEventBooking();
      case 'restaurant':
        return renderRestaurantBooking();
      case 'hotel':
        return renderHotelBooking();
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Category</h2>
              <p className="text-gray-600 mb-6">Please select a valid booking category</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        );
    }
  };

  const renderEventBooking = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Booking Request</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Event Type *
                </label>
                <input
                  type="text"
                  name="eventType"
                  value={bookingData.eventType}
                  onChange={handleInputChange}
                  placeholder="e.g., Wedding, Conference, Birthday"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Promised Number of Guests *
                  </label>
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('proposedCount', -1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={parseInt(bookingData.proposedCount || 1) <= 1}
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-900">{bookingData.proposedCount || "2"}</span>
                      <span className="block text-xs text-gray-600 mt-1">people...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('proposedCount', 1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={vendorData?.capacity && parseInt(bookingData.proposedCount || 1) >= parseInt(vendorData.capacity)}
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Expected number of guest *
                  </label>
                  <input
                    type="number"
                    name="expectedGuests"
                    value={bookingData.expectedGuests}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter expected number of guests"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Contact name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={bookingData.contactName}
                  onChange={handleInputChange}
                  placeholder="John Adesoye"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Phone number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={bookingData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+234-2467-567"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Event Requirements
                </label>
                <textarea
                  name="eventRequirements"
                  value={bookingData.eventRequirements}
                  onChange={handleInputChange}
                  placeholder="Describe your event need..."
                  rows="4"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Duration *
                </label>
                <select
                  name="duration"
                  value={bookingData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  required
                >
                  <option value="4 hours">4 hours</option>
                  <option value="6 hours">6 hours</option>
                  <option value="8 hours">8 hours</option>
                  <option value="12 hours">12 hours</option>
                  <option value="Full day">Full day</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRestaurantBooking = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Restaurant Booking Request</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <hr className="border-gray-300" />

              <div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
                  Number of Guests *
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Maximum number 8 guest *</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-400">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfGuests', -1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={parseInt(bookingData.numberOfGuests || 1) <= 1}
                    >
                      <span className="text-lg font-bold">   -</span>
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-900">{bookingData.numberOfGuests || "2"}</span>
                      <span className="block text-xs text-gray-600 mt-1">people...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfGuests', 1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={parseInt(bookingData.numberOfGuests || 1) >= 8}
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Special Requests (optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any specific requests or requirements"
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Contact name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    placeholder="John Adesoye"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Phone number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={bookingData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+234-2467-567"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHotelBooking = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Who's the lead guest?</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    First name *
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={bookingData.guestName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Last name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    placeholder="Adesoye"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Mobile number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={bookingData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                  Country/region of residence *
                </label>
                <input
                  type="text"
                  name="country"
                  value={bookingData.country || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={bookingData.checkInDate}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={bookingData.checkOutDate}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                    min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Number of Rooms *
                  </label>
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfRooms', -1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={parseInt(bookingData.numberOfRooms || 1) <= 1}
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-900">{bookingData.numberOfRooms || "1"}</span>
                      <span className="block text-xs text-gray-600 mt-1">rooms</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfRooms', 1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
                    Number of Nights *
                  </label>
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfNights', -1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={parseInt(bookingData.numberOfNights || 1) <= 1}
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-900">{bookingData.numberOfNights || "1"}</span>
                      <span className="block text-xs text-gray-600 mt-1">nights</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('numberOfNights', 1)}
                      className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentInfo = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setActiveStep(0)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-8"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Information</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Choose your payment option</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-[#06EAFC] rounded-lg bg-[#06EAFC]/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-[#06EAFC] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#06EAFC]"></div>
                    </div>
                    <span className="font-medium text-gray-900">Credit/Debit Card</span>
                  </div>
                  <span className="text-gray-600 text-sm">Popular</span>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    </div>
                    <span className="font-medium text-gray-900">Pay in the hotel</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-1">
                  <span className="text-green-600 mr-2">✓</span> We price match. Find it for less, and we'll match it!
                </p>
                <p className="text-green-700 text-sm">You saved ₦ 35,357.85 on this booking!</p>
              </div>

              <div className="space-y-4 sm:space-y-6 pt-2">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
                  <div className="flex justify-between items-start mb-6 sm:mb-8">
                    <div>
                      <p className="text-sm opacity-80">Card Number</p>
                      <p className="text-lg sm:text-xl font-mono">2894 •••• •••• 9432</p>
                    </div>
                    <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white/20 rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm opacity-80">Card Holder Name</p>
                      <p className="text-lg">Holder Name</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Expires</p>
                      <p className="text-lg">MM/YY</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Card Number"
                      className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Holder Name"
                      className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="saveCard" className="w-4 h-4 text-[#06EAFC] rounded" />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      Save this card for future payments
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 50000 : 50000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">₦5,000</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300 text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#06EAFC]">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 55000 : 55000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setActiveStep(1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-8"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Booking is Confirmed</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Booking is Confirmed</h2>
              <p className="text-gray-600 text-sm">Your booking has been successfully confirmed</p>
            </div>

            <div className="bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-xl p-4 sm:p-6 mb-8 border border-[#06EAFC]/20">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{vendorData?.name || "Golden Tulip Event Centre"}</h3>
              
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 text-sm">{vendorData?.area || vendorData?.address || "Mokola, Rd. 2314"}</span>
              </div>
              
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {vendorData?.description || "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan. Designed for both business and leisure travelers, the hotel provides a peaceful stay with quick access to major city landmarks."}
              </p>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 font-medium">{vendorData?.rating || "4.78"}</span>
                </div>
                <span className="text-gray-500">({vendorData?.reviews || "23"})</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Booking Reference</span>
                    <span className="font-medium text-sm sm:text-base">AJN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="font-medium text-sm sm:text-base">{new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-medium text-sm sm:text-base">{bookingData.checkInDate || bookingData.date || new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Check-out</span>
                    <span className="font-medium text-sm sm:text-base">{bookingData.checkOutDate || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium text-sm sm:text-base">{bookingData.numberOfGuests || bookingData.expectedGuests || "1"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Contact Person</span>
                    <span className="font-medium text-sm sm:text-base">{bookingData.contactName || bookingData.guestName || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg sm:text-xl font-bold text-[#06EAFC]">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 85000 : 85000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h4>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-700 font-medium">••••</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Credit Card</p>
                        <p className="text-sm text-gray-600">Ending in 4321</p>
                      </div>
                    </div>
                    <span className="text-gray-600">Paid</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-2">
                  <strong>Important:</strong> You'll receive a confirmation email shortly. Please check your spam folder if you don't see it within 10 minutes.
                </p>
                <p className="text-blue-800 text-sm">
                  For any changes or cancellations, please contact our support team at support@ajani.com or call +234 800 123 4567.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  <FontAwesomeIcon icon={faPrint} className="mr-2" />
                  Print Confirmation
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity flex-1"
                >
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen font-manrope bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06EAFC]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-manrope bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Booking</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-600 mb-6">Please try selecting a vendor again from the vendor details page.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors"
          >
            Return Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen font-manrope bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load vendor details. Please try selecting a vendor from the vendor details page.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors"
          >
            Return Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-manrope bg-white">
      <Header />
      
      <main className="lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <StepProgress activeStep={activeStep} />
        </div>

        {vendorData && (
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#06EAFC]/20">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-full sm:w-28 sm:flex-shrink-0">
                <div className="w-full h-40 sm:h-28 sm:w-28 rounded-lg overflow-hidden">
                  <img
                    src={vendorData.image || vendorData.images?.[0] || FALLBACK_IMAGES.default}
                    alt={vendorData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGES[vendorData.category] || FALLBACK_IMAGES.default;
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{vendorData.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm truncate">{vendorData.area}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">{vendorData.rating || "4.5"} ({vendorData.reviews || "0"})</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mt-3 line-clamp-2">
                      {vendorData.description}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                      {vendorData.priceFrom ? `₦${parseInt(vendorData.priceFrom.toString().replace(/[^\d]/g, "") || 0).toLocaleString()}` : 'Price on request'}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      {normalizedCategory === 'hotel' ? 'per night' : 
                       normalizedCategory === 'restaurant' ? 'per meal' : 
                       'per guest'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderStepContent()}

        <div className="max-w-4xl mx-auto mt-6 sm:mt-8 flex justify-between">
          {activeStep > 0 && (
            <button
              onClick={handlePreviousStep}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Back
            </button>
          )}
          
          {activeStep < 2 ? (
            <button
              onClick={handleNextStep}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity ml-auto text-sm sm:text-base"
            >
              {activeStep === 0 ? (
                normalizedCategory === 'event' ? 'Check Availability & Book' :
                normalizedCategory === 'restaurant' ? 'Reserve Table' :
                'Next Step'
              ) : (
                'Continue to Confirmation'
              )}
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4">
              {vendorData?.id && (
                <button
                  onClick={() => navigate(`/vendor-detail/${vendorData.id}`)}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 text-sm sm:text-base"
                >
                  View Vendor Details
                </button>
              )}
              <button
                onClick={handleSubmitBooking}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity flex-1 text-sm sm:text-base"
              >
                Complete Booking
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;