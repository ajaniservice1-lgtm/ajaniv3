// ShortletBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  faCalendar, 
  faUsers, 
  faClock,
  faHome
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShortletBooking = ({ vendorData }) => {
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 2,
    additionalNotes: "",
    contactInfo: {
      name: "",
      phone: "",
      email: ""
    }
  });

  useEffect(() => {
    // Pre-fill dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    setBookingData(prev => ({
      ...prev,
      checkInDate: formatDate(today),
      checkOutDate: formatDate(tomorrow)
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate data
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.numberOfGuests) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingData.contactInfo.name || !bookingData.contactInfo.email || !bookingData.contactInfo.phone) {
      alert("Please fill in all contact information");
      return;
    }

    // Calculate nights
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Combine all data
    const completeBooking = {
      vendorData: vendorData,
      bookingData: {
        ...bookingData,
        nights: nights
      },
      bookingType: 'shortlet',
      bookingDate: new Date().toISOString(),
      bookingId: 'SHORT-' + Date.now().toString().slice(-8)
    };

    // Save to localStorage
    localStorage.setItem('shortletBooking', JSON.stringify(completeBooking));
    
    // Navigate directly to confirmation (skip payment)
    navigate('/booking-confirmation/shortlet', { 
      state: { 
        bookingData: completeBooking 
      } 
    });
  };

  // Custom stepper for shortlet (2 steps only)
  const shortletSteps = [
    { id: 1, label: "Booking Details", icon: faCalendar },
    { id: 2, label: "Booking Confirmed", icon: faClock }
  ];

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-8">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Custom Stepper for Shortlet */}
          <div className="w-full mb-10 flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200">
              <div
                className="h-[2px] bg-emerald-500 transition-all duration-300"
                style={{ width: '50%' }}
              />
            </div>
            
            {shortletSteps.map((step, index) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${index < 1 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                  <FontAwesomeIcon icon={step.icon} className="w-5 h-5" />
                </div>
                <p className={`mt-2 text-xs font-medium ${index < 1 ? "text-emerald-600" : "text-gray-400"}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Book {vendorData?.name || "Shortlet"}
              </h1>
              <p className="text-gray-600 mt-2">
                Please provide your booking details
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Dates Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                        Dates
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-in Date *
                          </label>
                          <input
                            type="date"
                            name="checkInDate"
                            value={bookingData.checkInDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guests Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                        Guests
                      </h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests *
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({
                              ...prev,
                              numberOfGuests: Math.max(1, prev.numberOfGuests - 1)
                            }))}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold">{bookingData.numberOfGuests}</span>
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({
                              ...prev,
                              numberOfGuests: prev.numberOfGuests + 1
                            }))}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Contact Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="contactInfo.name"
                            value={bookingData.contactInfo.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="contactInfo.phone"
                            value={bookingData.contactInfo.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="contactInfo.email"
                            value={bookingData.contactInfo.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Additional Notes (Optional)
                      </h2>
                      <textarea
                        name="additionalNotes"
                        value={bookingData.additionalNotes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Any specific requests or requirements..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition"
                      >
                        Send Booking Request
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Booking Summary</h3>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={vendorData?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                        alt={vendorData?.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{vendorData?.name}</h4>
                        <p className="text-sm text-gray-600">{vendorData?.area || "Location"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium">{bookingData.checkInDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium">{bookingData.checkOutDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-medium">{bookingData.numberOfGuests} people</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-medium">Total (estimated)</span>
                          <span className="font-bold text-emerald-600">
                            {formatPrice(vendorData?.priceFrom || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">✓ Booking request - confirmation required</p>
                    <p>✓ Flexible cancellation policy</p>
                  </div>
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

export default ShortletBooking;