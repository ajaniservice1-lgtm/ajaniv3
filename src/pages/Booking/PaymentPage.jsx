import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CreditCard, Building, Smartphone } from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("hotel");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    // Load saved payment method
    const savedMethod = localStorage.getItem('paymentMethod');
    if (savedMethod) {
      setPaymentMethod(savedMethod);
    }
  }, []);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (paymentMethod === "card") {
      // Save card details securely
      localStorage.setItem('cardDetails', JSON.stringify(cardDetails));
    }
    
    // Navigate to confirmation
    navigate('/booking/confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Stepper currentStep={2} />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
            >
              ← Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Form */}
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                  Payment Information
                </h1>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Choose payment method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-emerald-500 rounded-lg bg-emerald-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="hotel"
                        checked={paymentMethod === "hotel"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1"
                      />
                      <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-gray-700" />
                        <div>
                          <span className="font-medium text-gray-900">Pay in the hotel</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Pay when you check-in
                          </p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1"
                      />
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-700" />
                        <div>
                          <span className="font-medium text-gray-900">Digital payment</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Credit/Debit card or mobile wallet
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div>
                  <div className="flex items-start gap-2 mb-6">
                    <input
                      type="checkbox"
                      id="paymentTerms"
                      required
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                    />
                    <label htmlFor="paymentTerms" className="text-sm text-gray-600">
                      I authorize Ajani to charge my payment method for the total amount shown.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition"
                  >
                    Book Now!
                  </button>
                  
                  <p className="text-center text-gray-500 text-sm mt-3">
                    We'll send confirmation of your booking to examplepgd@gmail.com
                  </p>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Hotel Details</h3>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-bold text-gray-900 mb-2">JAGZ Hotel</h4>
                    <p className="text-sm text-gray-500 mb-3">Model: RE 2344</p>
                    
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800">Key Features</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          WiFi
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Security gate
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Parking Space
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Economy
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Room Details */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-800 mb-3">Room Selected</h5>
                    <h6 className="font-semibold text-gray-900 mb-2">Superior Twin Room</h6>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Specification</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>Bed: 1 Double Bed or 2 Single Beds</li>
                          <li>View: City interior</li>
                          <li>Bathroom: Private</li>
                          <li>Wi-Fi: Yes</li>
                          <li>Air Conditioning: Yes</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Amenities</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>TV</li>
                          <li>Washing Machine</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Price */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-emerald-600">₦52,500</span>
                    </div>
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

export default PaymentPage;