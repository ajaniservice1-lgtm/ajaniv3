import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BookingPage = () => {
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "+1 (555) 000-0000",
    specialRequests: ""
  });

  const [selectedPayment, setSelectedPayment] = useState("hotel");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save booking data
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    localStorage.setItem('paymentMethod', selectedPayment);
    
    // Navigate to payment page
    navigate('/booking/payment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-8">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Stepper currentStep={1} />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
            >
              ← Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                  Complete Your Booking
                </h1>

                {/* Payment Option Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Choose your payment option
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-emerald-500 rounded-lg bg-emerald-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="hotel"
                        checked={selectedPayment === "hotel"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Pay in the hotel</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Pay when you arrive at the hotel
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={selectedPayment === "card"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Credit/debit card</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Secure online payment
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="mb-8">
                  <div className="mb-6">
   <h2 className="text-lg font-semibold text-gray-800 ">
                    Who's the lead guest?
                  </h2>
                <h2 className="text-gray-600 text-[14px]">contact information</h2>

                  </div>
               
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First name *
                        </label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last name *
                        </label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleInputChange}
                          placeholder="Adesoye"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country/region of residence *
                      </label>
                      <input 
                        type="text" 
                        name="country"
                        value={bookingData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile number *
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Please make sure your contact information is correct. We'll use it to send your booking confirmation and any reminders to assist you with booking completion.
                  </p>
                </div>

                {/* Special Requests */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Special requests
                  </h2>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe what you need..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Terms and Submit */}
                <div>
                  <div className="flex items-start gap-2 mb-6">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      By proceeding with this booking, I agree to Ajani Terms of Use and Privacy Policy.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition"
                  >
                    Next: Final Step
                  </button>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Booking Summary</h3>
                  
                  {/* Room Selected */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Room Selected</p>
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-900 mb-2">Superior Twin Room</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Bed: 1 double bed or 2 single beds</li>
                        <li>Room Size: 18-20 sqm</li>
                        <li>Bathroom: Private</li>
                        <li>View: City interior</li>
                        <li>Wi-Fi: Yes</li>
                        <li>Air Conditioning: Yes</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Price Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Room x 2 nights</span>
                        <span className="font-medium">₦45,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">₦7,500</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-lg font-bold text-emerald-600">₦52,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center">
                    You won't be charged until your booking is confirmed
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

export default BookingPage;