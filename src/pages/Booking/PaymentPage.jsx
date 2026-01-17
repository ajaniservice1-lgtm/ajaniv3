import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  CreditCard, 
  Building, 
  Calendar, 
  Users, 
  MapPin, 
  Star,
  Bed,
  Coffee,
  Shield
} from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState("hotel");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    // Generate booking ID
    const generateBookingId = () => {
      const prefix = "PAY-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());

    const loadBookingData = () => {
      setLoading(true);
      
      console.log("📍 Payment page location state:", location.state);
      
      // 1. First try to get from location state
      if (location.state?.bookingData) {
        console.log("📦 Got booking data from location state");
        setBookingData(location.state.bookingData);
      } 
      // 2. Try from localStorage
      else {
        console.log("🔍 Looking for booking data in localStorage...");
        const savedData = localStorage.getItem('completeBooking');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log("📦 Got booking data from localStorage:", parsedData);
            setBookingData(parsedData);
          } catch (error) {
            console.error("Failed to parse booking data:", error);
          }
        }
        
        // Also try hotelBooking as fallback
        const hotelData = localStorage.getItem('hotelBooking');
        if (hotelData && !savedData) {
          try {
            const parsedData = JSON.parse(hotelData);
            console.log("📦 Got booking data from hotelBooking:", parsedData);
            setBookingData(parsedData);
          } catch (error) {
            console.error("Failed to parse hotel booking data:", error);
          }
        }
      }
      
      // Load saved payment method
      const savedMethod = localStorage.getItem('paymentMethod');
      if (savedMethod) {
        setPaymentMethod(savedMethod);
      }
      
      setLoading(false);
    };

    loadBookingData();
  }, [location.state]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingData) {
      alert("No booking data found. Please start over.");
      navigate('/');
      return;
    }

    // Validate card details if card payment selected
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        alert("Please fill in all card details");
        return;
      }
    }

    // Save payment details
    localStorage.setItem('paymentMethod', paymentMethod);
    
    if (paymentMethod === "card") {
      localStorage.setItem('cardDetails', JSON.stringify(cardDetails));
    }
    
    // Create complete booking record
    const completeBooking = {
      ...bookingData,
      paymentMethod: paymentMethod,
      cardDetails: paymentMethod === "card" ? cardDetails : null,
      paymentStatus: paymentMethod === "hotel" ? "pending" : "paid",
      paymentDate: new Date().toISOString(),
      bookingId: bookingId,
      status: "confirmed",
      timestamp: new Date().toISOString()
    };

    // Save complete booking
    localStorage.setItem('confirmedBooking', JSON.stringify(completeBooking));
    
    // Determine booking type for confirmation page
    const bookingType = bookingData.bookingType || 'hotel';
    
    // Navigate to confirmation page
    navigate(`/booking-confirmation/${bookingType}`, { 
      state: { 
        bookingData: completeBooking 
      } 
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  // Extract data from bookingData
  const hotelData = bookingData?.hotelData || bookingData?.roomData?.hotel;
  const roomData = bookingData?.roomData?.room;
  const bookingDetails = bookingData?.roomData?.booking;
  const guestInfo = bookingData || {};

  // Calculate totals
  const roomPrice = bookingDetails?.price || 0;
  const taxes = Math.round(roomPrice * 0.1);
  const serviceFee = Math.round(roomPrice * 0.05);
  const total = roomPrice + taxes + serviceFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Data Found</h2>
            <p className="text-gray-600 mb-6">Please start your booking again.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Stepper currentStep={2} />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 cursor-pointer"
            >
              ← Back to Booking
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Form */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Complete Payment
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Final step to confirm your booking at {hotelData?.name || "the property"}
                  </p>
                </div>

                {/* Guest Information Summary */}
                <div className="mb-8 bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Guest Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Lead Guest</p>
                      <p className="font-medium">
                        {guestInfo.firstName} {guestInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{guestInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium">{guestInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Country</p>
                      <p className="font-medium">{guestInfo.country || "Nigeria"}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Choose payment method
                  </h2>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "hotel" 
                        ? "border-2 border-emerald-500 bg-emerald-50" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="hotel"
                        checked={paymentMethod === "hotel"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1 cursor-pointer"
                      />
                      <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-gray-700" />
                        <div>
                          <span className="font-medium text-gray-900">Pay at the property</span>
                          <p className="text-sm text-gray-500 mt-1">
                            No upfront payment required. Pay when you check-in.
                          </p>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card" 
                        ? "border-2 border-emerald-500 bg-emerald-50" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1 cursor-pointer"
                      />
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-700" />
                        <div>
                          <span className="font-medium text-gray-900">Pay now with card</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Secure payment with credit/debit card
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Card Details Form (only show if card selected) */}
                {paymentMethod === "card" && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Card Details
                    </h2>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="number"
                            value={cardDetails.number}
                            onChange={handleCardInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleCardInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              name="expiry"
                              value={cardDetails.expiry}
                              onChange={handleCardInputChange}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleCardInputChange}
                              placeholder="123"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">Secure Payment</p>
                    <p className="text-sm text-emerald-700">Your payment information is encrypted and secure</p>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-start gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="paymentTerms"
                        required
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1 cursor-pointer"
                      />
                      <label htmlFor="paymentTerms" className="text-sm text-gray-600 cursor-pointer">
                        I authorize Ajani to charge my payment method for the total amount shown.
                      </label>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="cancellationPolicy"
                        required
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1 cursor-pointer"
                      />
                      <label htmlFor="cancellationPolicy" className="text-sm text-gray-600 cursor-pointer">
                        I accept the cancellation policy (free cancellation up to 24 hours before check-in)
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition cursor-pointer"
                  >
                    {paymentMethod === "hotel" ? "Confirm Booking" : "Pay Now & Confirm Booking"}
                  </button>
                  
                  <p className="text-center text-gray-500 text-sm mt-3">
                    Confirmation will be sent to {guestInfo.email || "your email"}
                  </p>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Booking Summary</h3>
                  
                  {/* Property Summary */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={hotelData?.image} 
                        alt={hotelData?.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{hotelData?.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-500">{hotelData?.location || "Location"}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{hotelData?.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stay Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Dates</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{bookingDetails?.checkIn || "Today"}</p>
                            <p className="text-xs text-gray-500">to {bookingDetails?.checkOut || "Tomorrow"}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Guests</span>
                          </div>
                          <span className="text-sm font-medium">{bookingDetails?.adults || 2} adults</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Nights</span>
                          <span className="text-sm font-medium">{bookingDetails?.nights || 1} night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Room Details */}
                  {roomData && (
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-800">Room</h5>
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatPrice(bookingDetails?.price)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="font-semibold text-gray-900 text-sm mb-1">{roomData.title}</h6>
                        <img 
                          src={roomData.image} 
                          alt={roomData.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Size</span>
                          <span className="font-medium">{roomData.size}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Beds</span>
                          <span className="font-medium">{roomData.beds}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Max Guests</span>
                          <span className="font-medium">{roomData.maxOccupancy}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Price Breakdown */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-800 mb-3">Price Breakdown</h5>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Room x {bookingDetails?.nights || 1} night</span>
                        <span className="font-medium">{formatPrice(bookingDetails?.price)}</span>
                      </div>
                      
                      {bookingDetails?.breakfastPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Breakfast</span>
                          <span className="font-medium">{bookingDetails.breakfastPrice}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="font-medium">{formatPrice(taxes)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">{formatPrice(serviceFee)}</span>
                      </div>
                      
                      {/* Discount */}
                      {bookingDetails?.discount && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 line-through">
                              Original price
                            </span>
                            <span className="text-gray-400 line-through">
                              {formatPrice(bookingDetails.originalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-red-500 mt-1">
                            <span>Discount</span>
                            <span>{bookingDetails.discount}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Total */}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {paymentMethod === "hotel" ? "Pay at property" : "To be charged now"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Policies */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Free cancellation</span> up to 24 hours before check-in
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      You'll receive confirmation within minutes
                    </p>
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