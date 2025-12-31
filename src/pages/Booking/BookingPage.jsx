import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const { id } = useParams();
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
    proposedCount: "50",
    expectedGuests: "50",
    duration: "4 hours",
    eventRequirements: "",
    
    // Restaurant-specific fields
    numberOfGuests: "2",
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
          
          // Get vendor images from the sheet
          const vendorImages = (vendor["image url"] || "")
            .split(",")
            .map(url => url.trim())
            .filter(url => url && url.startsWith("http"));
          
          const vendorData = {
            id: vendor.id,
            name: vendor.name || vendor.title || "Unknown Vendor",
            category: vendorCategory,
            originalCategory: vendor.category,
            priceFrom: vendor.price_from,
            priceTo: vendor.price_to,
            area: vendor.area || vendor.location || "Location not specified",
            address: vendor.address || "",
            contact: vendor.contact,
            email: vendor.email,
            // Use "about" field from sheet if available, otherwise use description
            description: vendor.about || vendor.description || vendor.details || "No description available",
            rating: vendor.rating || "4.5",
            reviews: vendor.reviews || vendor.review_count || "0",
            capacity: vendor.capacity,
            amenities: vendor.amenities,
            // Use images from the sheet
            images: vendorImages.length > 0 ? vendorImages : [FALLBACK_IMAGES[vendorCategory] || FALLBACK_IMAGES.default],
            // Primary image for display
            image: vendorImages[0] || (FALLBACK_IMAGES[vendorCategory] || FALLBACK_IMAGES.default)
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

  // Stepper configuration - matching the image design with multi-line text
  const steps = [
    { title: "Customer", subtitle: "Information", icon: "👤" },
    { title: "Payment", subtitle: "Information", icon: "💳" },
    { title: "Booking is", subtitle: "Confirmed", icon: "✓" }
  ];

  // Handle quantity increment/decrement
  const handleQuantityChange = (field, delta) => {
    setBookingData(prev => {
      const currentValue = parseInt(prev[field]) || 0;
      const newValue = Math.max(0, currentValue + delta);
      return {
        ...prev,
        [field]: newValue.toString()
      };
    });
  };

  // Handle input change
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

  // Quantity Selector Component
  const QuantitySelector = ({ value, onChange, min = 0, max = 1000, label }) => {
    const handleIncrement = () => {
      if (max && parseInt(value) >= max) return;
      onChange(parseInt(value || 0) + 1);
    };

    const handleDecrement = () => {
      if (parseInt(value || 0) <= min) return;
      onChange(parseInt(value || 0) - 1);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-10 h-10 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={parseInt(value || 0) <= min}
          >
            <span className="text-xl font-bold">-</span>
          </button>
          <span className="w-16 text-center text-lg font-bold text-gray-900">{value || "0"}</span>
          <button
            type="button"
            onClick={handleIncrement}
            className="w-10 h-10 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={max && parseInt(value || 0) >= max}
          >
            <span className="text-xl font-bold">+</span>
          </button>
        </div>
      </div>
    );
  };

  // Render step content
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
              <p className="text-gray-600 mb-6">{vendorData?.name || "Event Centre"}</p>
              
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

                <QuantitySelector
                  value={bookingData.proposedCount}
                  onChange={(newValue) => setBookingData(prev => ({
                    ...prev,
                    proposedCount: newValue.toString()
                  }))}
                  min={1}
                  max={vendorData?.capacity ? parseInt(vendorData.capacity) : 1000}
                  label="Proposed Number of Guests *"
                />

                <QuantitySelector
                  value={bookingData.expectedGuests}
                  onChange={(newValue) => setBookingData(prev => ({
                    ...prev,
                    expectedGuests: newValue.toString()
                  }))}
                  min={1}
                  max={vendorData?.capacity ? parseInt(vendorData.capacity) : 1000}
                  label="Expected Number of Guests *"
                />

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
              <p className="text-gray-600 mb-6">{vendorData?.name || "Restaurant"}</p>
              
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

                <QuantitySelector
                  value={bookingData.numberOfGuests}
                  onChange={(newValue) => setBookingData(prev => ({
                    ...prev,
                    numberOfGuests: newValue.toString()
                  }))}
                  min={1}
                  max={vendorData?.capacity ? parseInt(vendorData.capacity) : 20}
                  label="Number of Guests *"
                />

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
              <p className="text-gray-600 mb-6">{vendorData?.name || "Hotel"}</p>
              
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

                <QuantitySelector
                  value={bookingData.numberOfRooms}
                  onChange={(newValue) => setBookingData(prev => ({
                    ...prev,
                    numberOfRooms: newValue.toString()
                  }))}
                  min={1}
                  max={10}
                  label="Number of Rooms *"
                />

                <QuantitySelector
                  value={bookingData.numberOfNights}
                  onChange={(newValue) => setBookingData(prev => ({
                    ...prev,
                    numberOfNights: newValue.toString()
                  }))}
                  min={1}
                  max={30}
                  label="Number of Nights *"
                />

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
    return (
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setActiveStep(0)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Stepper Display - Matching image design */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
          <span>Customer Information</span>
          <span className="text-gray-300">|</span>
          <span className="text-[#06EAFC] font-medium">Payment Information</span>
          <span className="text-gray-300">|</span>
          <span>Booking is Confirmed</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose your payment option</h2>
          
          <div className="space-y-6">
            {/* Payment Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-[#06EAFC] rounded-lg bg-[#06EAFC]/5">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#06EAFC] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#06EAFC]"></div>
                  </div>
                  <span className="font-medium text-gray-900">Credit/Debit Card</span>
                </div>
                <span className="text-gray-500 text-sm">Popular</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <span className="font-medium text-gray-900">Pay in the hotel</span>
                </div>
              </div>
            </div>

            {/* Price Match Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-1">
                <span className="text-green-600 mr-2">✓</span> We price match. Find it for less, and we'll match it!
              </p>
              <p className="text-green-700 text-sm">You saved ₦ 35,357.85 on this booking!</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-6 pt-2">
              <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
              
              {/* Card Preview */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-80">Card Number</p>
                    <p className="text-xl font-mono">2894 •••• •••• 9432</p>
                  </div>
                  <div className="w-12 h-8 bg-white/20 rounded"></div>
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

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Card Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
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
                      CVV
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
            </div>

            {/* Total Price */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 50000 : 50000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">₦5,000</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-[#06EAFC]">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 55000 : 55000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setActiveStep(1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Stepper Display */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
          <span>Customer Information</span>
          <span className="text-gray-300">|</span>
          <span>Payment Information</span>
          <span className="text-gray-300">|</span>
          <span className="text-[#06EAFC] font-medium">Booking is Confirmed</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Confirmation Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking is Confirmed</h2>
            <p className="text-gray-600 text-sm">Your booking has been successfully confirmed</p>
          </div>

          {/* Vendor Information Card */}
          <div className="bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-xl p-6 mb-8 border border-[#06EAFC]/20">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{vendorData?.name || "Golden Tulip Event Centre"}</h3>
            
            {/* Location */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">{vendorData?.area || vendorData?.address || "Mokola, Rd. 2314"}</span>
            </div>
            
            {/* Description from "about" field in Google Sheet */}
            <p className="text-gray-700 text-sm mb-4">
              {vendorData?.description || "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan. Designed for both business and leisure travelers, the hotel provides a peaceful stay with quick access to major city landmarks."}
            </p>
            
            {/* Rating from Google Sheet */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-600 font-medium">{vendorData?.rating || "4.78"}</span>
              </div>
              <span className="text-gray-400">({vendorData?.reviews || "23"})</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Booking Reference</span>
                  <span className="font-medium">AJN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Booking Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{bookingData.checkInDate || bookingData.date || new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{bookingData.checkOutDate || "Not specified"}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{bookingData.numberOfGuests || bookingData.expectedGuests || "1"}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Contact Person</span>
                  <span className="font-medium">{bookingData.contactName || bookingData.guestName || "Not specified"}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-[#06EAFC]">₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 85000 : 85000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-700 font-medium">••••</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Credit Card</p>
                      <p className="text-sm text-gray-500">Ending in 4321</p>
                    </div>
                  </div>
                  <span className="text-gray-600">Paid</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Important:</strong> You'll receive a confirmation email shortly. Please check your spam folder if you don't see it within 10 minutes.
              </p>
              <p className="text-blue-800 text-sm">
                For any changes or cancellations, please contact our support team at support@ajani.com or call +234 800 123 4567.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
              >
                Print Confirmation
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity flex-1"
              >
                Return to Home
              </button>
            </div>
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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Vendor Image from sheet */}
              <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={vendorData.image}
                  alt={vendorData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGES[vendorData.category] || FALLBACK_IMAGES.default;
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{vendorData.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">{vendorData.area}</span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600 text-sm">{vendorData.rating || "4.5"} ({vendorData.reviews || "0"})</span>
                  </div>
                </div>
                {/* Description - using "about" field from sheet */}
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                  {vendorData.description}
                </p>
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

        {/* Stepper - Matching image design with multi-line text and icons */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10 flex-1">
                {/* Step Circle with Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium mb-2 ${
                    index <= activeStep
                      ? 'bg-[#06EAFC] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                
                {/* Multi-line Step Title */}
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    index <= activeStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-sm font-medium ${
                    index <= activeStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.subtitle}
                  </div>
                </div>
                
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-3/4 w-full h-0.5 -z-10 ${
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