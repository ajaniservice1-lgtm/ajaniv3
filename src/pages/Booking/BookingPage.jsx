// BookingPage.jsx - Updated version
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../hook/useAuth";

const BookingPage = () => {
  const { category } = useParams(); // 'event', 'restaurant', or 'hotel'
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0); // 0: Customer Info, 1: Payment, 2: Confirmation
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

  // Stepper configuration based on category
  const steps = {
    event: ["Customer Information", "Payment Information", "Booking is Confirmed"],
    restaurant: ["Customer Information", "Payment Information", "Booking is Confirmed"],
    hotel: ["Customer Information", "Payment Information", "Booking is Confirmed"]
  };

  // Colors for active steps
  const stepColors = ["#06EAFC", "#06F49F", "#06EAFC"];

  // REMOVED: The authentication check that was redirecting to login
  // Booking page is now public

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmitBooking = () => {
    // Only require authentication when submitting (at payment step)
    if (activeStep === 1 && !isAuthenticated) { // Payment step
      // Show toast or message asking to login
      alert("Please login to complete your booking");
      
      // Save current booking data to localStorage to restore after login
      localStorage.setItem("pendingBooking", JSON.stringify({
        category,
        bookingData,
        activeStep
      }));
      
      localStorage.setItem("redirectAfterLogin", `/booking/${category}`);
      navigate("/login");
      return;
    }
    
    // Simulate booking submission
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (isSuccess) {
      navigate(`/booking-confirmation/${category}`);
    } else {
      navigate(`/booking-failed/${category}`);
    }
  };

  // Check for pending booking data when page loads
  useEffect(() => {
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        if (parsed.category === category) {
          setBookingData(parsed.bookingData);
          setActiveStep(parsed.activeStep || 0);
          localStorage.removeItem("pendingBooking");
        }
      } catch (error) {
        console.error("Error parsing pending booking:", error);
      }
    }
  }, [category]);

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
    switch (category) {
      case 'event':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Booking</h2>
              <p className="text-gray-600 mb-6">Golden Tulip Event Centre</p>
              
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
              </div>
            </div>
          </div>
        );

      case 'restaurant':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Reservation</h2>
              <p className="text-gray-600 mb-6">JAGZ Restaurant</p>
              
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
              <p className="text-gray-600 mb-6">JAZZ Hotel</p>
              
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
        return <div>Invalid category</div>;
    }
  };

  const renderPaymentInfo = () => {
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
                <span className="font-medium text-gray-900">Pay in the hotel</span>
              </div>
              <p className="text-gray-600 text-sm">Pay directly at the venue</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                <span className="text-green-600">✓</span> We price match. Find it for less, and we'll match it!
              </p>
              <p className="text-green-700 text-sm mt-1">You saved ₦ 35,357.85 on this booking!</p>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Card Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="CVV"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
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
              <span className="font-medium">AJN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{bookingData.date || new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{bookingData.time || "7:00 PM"}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contact</span>
              <span className="font-medium">{bookingData.contactName}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-xl font-bold text-[#06EAFC]">₦{category === 'hotel' ? '85,000' : category === 'event' ? '250,000' : '45,000'}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              You'll receive a confirmation email shortly. For any changes or cancellations, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps[category]?.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
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
                <span className={`text-xs font-medium ${
                  index <= activeStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                
                {index < steps[category].length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
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
              className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors ml-auto"
            >
              {category === 'event' ? 'Check Availability & Book' :
               category === 'restaurant' ? 'Reserve Table' :
               'Next Step'}
            </button>
          ) : (
            <button
              onClick={handleSubmitBooking}
              className="px-6 py-3 bg-[#06F49F] text-white rounded-lg hover:bg-[#05e18f] transition-colors ml-auto"
            >
              Validate Payment & Complete Booking
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;