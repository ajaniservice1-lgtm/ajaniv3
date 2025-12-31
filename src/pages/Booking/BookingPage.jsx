import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../hook/useAuth";

// Category normalization utility
const normalizeCategory = (category) => {
  if (!category) return 'restaurant';
  
  const cat = category.toString().toLowerCase().trim();
  
  // Handle categories with slashes
  if (cat.includes("/")) {
    const parts = cat.split("/").map(part => part.trim());
    for (const part of parts) {
      if (part.includes('restaurant') || part.includes('food') || part.includes('cafe') || part.includes('eatery')) {
        return 'restaurant';
      }
      if (part.includes('hotel') || part.includes('shortlet') || part.includes('resort') || part.includes('inn')) {
        return 'hotel';
      }
      if (part.includes('event') || part.includes('venue') || part.includes('hall') || part.includes('center')) {
        return 'event';
      }
    }
    // If no specific match found but contains "food", default to restaurant
    if (cat.includes('food')) return 'restaurant';
  }
  
  // Check for individual keywords
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('eatery') || cat.includes('diner') || cat.includes('bistro')) {
    return 'restaurant';
  }
  if (cat.includes('hotel') || cat.includes('shortlet') || cat.includes('resort') || cat.includes('inn') || cat.includes('motel') || cat.includes('lodging')) {
    return 'hotel';
  }
  if (cat.includes('event') || cat.includes('venue') || cat.includes('hall') || cat.includes('center') || cat.includes('conference') || cat.includes('meeting')) {
    return 'event';
  }
  
  return 'restaurant'; // Default fallback
};

const BookingPage = () => {
  const { id } = useParams(); // Changed from category to id
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    // Common fields
    contactName: "",
    phoneNumber: "",
    email: "",
    date: "",
    time: "",
    
    // Event-specific fields
    eventName: "",
    eventType: "",
    proposedCount: "",
    expectedGuests: "",
    duration: "4 hours",
    eventRequirements: "",
    
    // Restaurant-specific fields
    numberOfGuests: "",
    specialRequests: "",
    
    // Hotel-specific fields
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: "1",
    numberOfNights: "1",
    guestName: "",
  });

  // Scroll to top on component mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch vendor data based on ID
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        console.log("Booking page vendor ID:", id);
        
        if (id) {
          await fetchVendorDetails(id);
        } else {
          // If no ID in URL, check localStorage
          const storedVendorData = localStorage.getItem('currentVendorBooking');
          if (storedVendorData) {
            try {
              const parsedData = JSON.parse(storedVendorData);
              console.log("Vendor data from localStorage:", parsedData);
              setVendorData(parsedData);
            } catch (error) {
              console.error("Error parsing vendor data:", error);
              setError("Failed to load vendor data");
            }
          } else {
            console.warn("No vendor ID found in URL or localStorage");
            setError("No vendor specified for booking");
          }
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setError("Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);
  
  const fetchVendorDetails = async (vendorId) => {
    try {
      const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
      const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:Z1000?key=${API_KEY}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      
      if (json.values && Array.isArray(json.values) && json.values.length > 1) {
        const headers = json.values[0];
        const rows = json.values.slice(1);
        
        const vendors = rows
          .filter((row) => Array.isArray(row) && row.length > 0)
          .map((row) => {
            const obj = {};
            headers.forEach((h, i) => {
              obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                .toString()
                .trim();
            });
            return obj;
          });
        
        // Find the specific vendor by ID
        const vendor = vendors.find((item) => item.id === vendorId);
        
        if (vendor) {
          console.log("Found vendor in sheet:", vendor);
          
          // Determine category based on vendor data
          const vendorCategory = normalizeCategory(vendor.category);
          
          const vendorData = {
            id: vendor.id,
            name: vendor.name,
            category: vendorCategory,
            originalCategory: vendor.category,
            priceFrom: vendor.price_from,
            priceTo: vendor.price_to,
            area: vendor.area,
            contact: vendor.contact,
            email: vendor.email,
            description: vendor.description,
            rating: vendor.rating,
            capacity: vendor.capacity,
            amenities: vendor.amenities
          };
          
          console.log("Processed vendor data:", vendorData);
          setVendorData(vendorData);
          localStorage.setItem('currentVendorBooking', JSON.stringify(vendorData));
        } else {
          setError("Vendor not found");
          console.error("Vendor not found with ID:", vendorId);
        }
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setError("Failed to fetch vendor details");
    }
  };

  // Get normalized category from vendor data
  const normalizedCategory = vendorData ? normalizeCategory(vendorData.category) : 'restaurant';

  // Stepper configuration based on category
  const steps = {
    event: ["Customer Information", "Payment Information", "Booking is Confirmed"],
    restaurant: ["Customer Information", "Payment Information", "Booking is Confirmed"],
    hotel: ["Customer Information", "Payment Information", "Booking is Confirmed"]
  };

  // Colors for active steps
  const stepColors = ["#06EAFC", "#06F49F", "#06EAFC"];

  // Use vendor-specific name or fallback
  const getVendorName = () => {
    if (vendorData?.name) {
      return vendorData.name;
    }
    
    switch(normalizedCategory) {
      case 'event': return 'Event Centre';
      case 'restaurant': return 'Restaurant';
      case 'hotel': return 'Hotel';
      default: return 'Vendor';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
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
      // Validate customer info step
      if (!bookingData.contactName.trim()) return false;
      if (!bookingData.phoneNumber.trim()) return false;
      if (!bookingData.email.trim()) return false;
      
      if (normalizedCategory === 'event') {
        if (!bookingData.date) return false;
        if (!bookingData.eventType.trim()) return false;
        if (!bookingData.proposedCount.trim()) return false;
        if (!bookingData.expectedGuests.trim()) return false;
      } else if (normalizedCategory === 'restaurant') {
        if (!bookingData.date) return false;
        if (!bookingData.time) return false;
        if (!bookingData.numberOfGuests.trim()) return false;
      } else if (normalizedCategory === 'hotel') {
        if (!bookingData.checkInDate) return false;
        if (!bookingData.checkOutDate) return false;
        if (!bookingData.guestName.trim()) return false;
      }
    }
    return true;
  };

  const handleSubmitBooking = () => {
    // Only require authentication when submitting (at payment step)
    if (activeStep === 1 && !isAuthenticated) {
      // Show toast or message asking to login
      alert("Please login to complete your booking");
      
      // Save current booking data to localStorage to restore after login
      localStorage.setItem("pendingBooking", JSON.stringify({
        vendorId: id,
        bookingData,
        activeStep,
        vendorData
      }));
      
      localStorage.setItem("redirectAfterLogin", `/booking/${id}`);
      navigate("/login");
      return;
    }
    
    // Simulate booking submission
    const isSuccess = Math.random() > 0.3;
    
    if (isSuccess) {
      navigate(`/booking-confirmation/${id}`);
    } else {
      navigate(`/booking-failed/${id}`);
    }
  };

  // Check for pending booking data when page loads
  useEffect(() => {
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        if (parsed.vendorId === id) {
          setBookingData(parsed.bookingData);
          setActiveStep(parsed.activeStep || 0);
          if (parsed.vendorData) {
            setVendorData(parsed.vendorData);
          }
          localStorage.removeItem("pendingBooking");
        }
      } catch (error) {
        console.error("Error parsing pending booking:", error);
      }
    }
  }, [id]);

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
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Booking</h2>
              <p className="text-gray-600 mb-6">{getVendorName()}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <input
                    type="text"
                    name="eventType"
                    value={bookingData.eventType}
                    onChange={handleInputChange}
                    placeholder="e.g., Wedding, Conference, Birthday"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={bookingData.eventName}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Number of Guests *
                    </label>
                    <input
                      type="number"
                      name="proposedCount"
                      value={bookingData.proposedCount}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Number of Guests *
                    </label>
                    <input
                      type="number"
                      name="expectedGuests"
                      value={bookingData.expectedGuests}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={bookingData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 080-1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  >
                    <option value="4 hours">4 hours</option>
                    <option value="6 hours">6 hours</option>
                    <option value="8 hours">8 hours</option>
                    <option value="12 hours">12 hours</option>
                    <option value="Full day">Full day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Requirements
                  </label>
                  <textarea
                    name="eventRequirements"
                    value={bookingData.eventRequirements}
                    onChange={handleInputChange}
                    placeholder="Describe your event needs..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'restaurant':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Reservation</h2>
              <p className="text-gray-600 mb-6">{getVendorName()}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <select
                    name="numberOfGuests"
                    value={bookingData.numberOfGuests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  >
                    <option value="">Select number of guests</option>
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5">5 people</option>
                    <option value="6">6 people</option>
                    <option value="7">7 people</option>
                    <option value="8">8 people</option>
                    <option value="9">9 people</option>
                    <option value="10">10 people</option>
                    <option value="10+">10+ people (please specify in notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={bookingData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 080-1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any specific requests or requirements"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Booking</h2>
              <p className="text-gray-600 mb-6">{getVendorName()}</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={bookingData.checkInDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={bookingData.checkOutDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                      min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Rooms *
                    </label>
                    <select
                      name="numberOfRooms"
                      value={bookingData.numberOfRooms}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'room' : 'rooms'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Nights *
                    </label>
                    <select
                      name="numberOfNights"
                      value={bookingData.numberOfNights}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    >
                      {[1,2,3,4,5,6,7].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'night' : 'nights'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="guestName"
                        value={bookingData.guestName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={bookingData.contactName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={bookingData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., +1 (555) 800-0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-2xl mx-auto">
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

  const renderPaymentInfo = () => {
    // Calculate price
    const calculatePrice = () => {
      if (vendorData?.priceFrom) {
        const price = parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 0;
        return price + 5000; // Add taxes
      }
      
      // Default prices
      const defaultPrices = {
        hotel: 85000,
        restaurant: 45000,
        event: 250000
      };
      
      return (defaultPrices[normalizedCategory] || 45000) + 5000;
    };

    const totalPrice = calculatePrice();

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose your payment option</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#06EAFC] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#06EAFC] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#06EAFC]"></div>
                </div>
                <span className="font-medium text-gray-900">Credit/Debit Card</span>
              </div>
              <span className="text-gray-500">Popular</span>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <span className="font-medium text-gray-900">Pay at venue</span>
              </div>
              <p className="text-gray-600 text-sm">Pay directly at the venue</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <span className="font-medium text-gray-900">Bank Transfer</span>
              </div>
              <p className="text-gray-600 text-sm">Transfer to our bank account</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                <span className="text-green-600">✓</span> We price match. Find it for less, and we'll match it!
              </p>
              <p className="text-green-700 text-sm mt-1">You saved ₦ 35,357.85 on this booking!</p>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
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

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{(totalPrice - 5000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">₦5,000</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-[#06EAFC]">₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    // Calculate booking reference
    const bookingRef = `AJN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate total price
    const calculateTotal = () => {
      if (vendorData?.priceFrom) {
        const price = parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 0;
        return price + 5000;
      }
      
      const defaultPrices = {
        hotel: 85000,
        restaurant: 45000,
        event: 250000
      };
      
      return (defaultPrices[normalizedCategory] || 45000) + 5000;
    };

    const totalPrice = calculateTotal();

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking is Confirmed</h2>
            <p className="text-gray-600">Your booking has been successfully confirmed</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Booking Reference</span>
              <span className="font-medium">{bookingRef}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Vendor</span>
              <span className="font-medium">{getVendorName()}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Category</span>
              <span className="font-medium capitalize">{normalizedCategory}</span>
            </div>
            
            {normalizedCategory === 'event' && (
              <>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Event Date</span>
                  <span className="font-medium">{bookingData.date || new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Event Type</span>
                  <span className="font-medium">{bookingData.eventType || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Expected Guests</span>
                  <span className="font-medium">{bookingData.expectedGuests || bookingData.proposedCount || "Not specified"}</span>
                </div>
              </>
            )}
            
            {normalizedCategory === 'restaurant' && (
              <>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Reservation Date</span>
                  <span className="font-medium">{bookingData.date || new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{bookingData.time || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Number of Guests</span>
                  <span className="font-medium">{bookingData.numberOfGuests || "Not specified"}</span>
                </div>
              </>
            )}
            
            {normalizedCategory === 'hotel' && (
              <>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Check-in Date</span>
                  <span className="font-medium">{bookingData.checkInDate || new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Check-out Date</span>
                  <span className="font-medium">{bookingData.checkOutDate || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Number of Rooms</span>
                  <span className="font-medium">{bookingData.numberOfRooms || "1"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Number of Nights</span>
                  <span className="font-medium">{bookingData.numberOfNights || "1"}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contact Person</span>
              <span className="font-medium">{bookingData.contactName || bookingData.guestName || "Not specified"}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contact Email</span>
              <span className="font-medium">{bookingData.email || "Not specified"}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contact Phone</span>
              <span className="font-medium">{bookingData.phoneNumber || "Not specified"}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-xl font-bold text-[#06EAFC]">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm mb-2">
              <strong>Important:</strong> You'll receive a confirmation email shortly. Please check your spam folder if you don't see it within 10 minutes.
            </p>
            <p className="text-blue-800 text-sm">
              For any changes or cancellations, please contact our support team at support@ajani.com or call +234 800 123 4567.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
            >
              Print Confirmation
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors flex-1"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen font-manrope">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06EAFC]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen font-manrope">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Booking</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-600 mb-6">Please try selecting a vendor again from the home page.</p>
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

  // If no vendor data but we have a vendorId, show error
  if (!vendorData) {
    return (
      <div className="min-h-screen font-manrope">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load vendor details. Please try again.</p>
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
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Vendor Info Banner */}
        {vendorData && (
          <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-2xl p-6 border border-[#06EAFC]/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{vendorData.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">{vendorData.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600 text-sm">{vendorData.rating || "4.5"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {vendorData.priceFrom ? `₦${parseInt(vendorData.priceFrom.replace(/[^\d]/g, "") || 0).toLocaleString()}` : 'Price on request'}
                </div>
                <div className="text-gray-600 text-sm">
                  {normalizedCategory === 'hotel' ? 'per night' : 
                   normalizedCategory === 'restaurant' ? 'per meal' : 
                   'per guest'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps[normalizedCategory]?.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                    index <= activeStep
                      ? `bg-[${stepColors[index]}] text-white`
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: index <= activeStep ? stepColors[index] : undefined
                  }}
                >
                  {index + 1}
                </div>
                <span className={`text-xs font-medium text-center px-2 ${
                  index <= activeStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                
                {index < steps[normalizedCategory].length - 1 && (
                  <div className={`absolute top-5 left-3/4 w-full h-0.5 -z-10 ${
                    index < activeStep ? 'bg-[#06EAFC]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="max-w-2xl mx-auto mt-8 flex justify-between">
          {activeStep > 0 && (
            <button
              onClick={handlePreviousStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          
          {activeStep < 2 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity ml-auto"
            >
              {activeStep === 0 ? (
                normalizedCategory === 'event' ? 'Check Availability & Book' :
                normalizedCategory === 'restaurant' ? 'Reserve Table' :
                'Continue to Payment'
              ) : (
                'Continue to Confirmation'
              )}
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-4">
              {id && (
                <button
                  onClick={() => navigate(`/vendor-detail/${id}`)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  View Vendor Details
                </button>
              )}
              <button
                onClick={handleSubmitBooking}
                className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity flex-1"
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