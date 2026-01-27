import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Home, 
  FileText, 
  Share2,
  Calendar,
  Users,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CreditCard,
  Building
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  
  const [bookingData, setBookingData] = useState(null);
  const [bookingReference, setBookingReference] = useState("");
  const [loading, setLoading] = useState(true);

  // Fix: Scroll to top on entry
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Generate booking reference
    const generateReference = () => {
      const prefix = type === 'restaurant' ? 'REST-' : 
                     type === 'shortlet' ? 'SHORT-' : 
                     type === 'hotel' ? 'AJN-' : 'BOOK-';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    setBookingReference(generateReference());
    
    // Load booking data based on type
    const loadBookingData = () => {
      setLoading(true);
      console.log("📦 Loading booking data for type:", type);
      
      let data = null;
      
      // Try multiple storage locations
      const possibleKeys = [
        'confirmedBooking',
        `${type}Booking`,
        'completeBooking',
        'hotelBooking',
        'restaurantBooking',
        'shortletBooking',
        'pendingGuestHotelBooking',
        'pendingLoggedInHotelBooking'
      ];
      
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            data = JSON.parse(storedData);
            console.log(`✅ Found booking data in ${key}:`, data);
            break;
          } catch (error) {
            console.error(`Failed to parse data from ${key}:`, error);
          }
        }
      }
      
      if (data) {
        setBookingData(data);
        
        // Clean up temporary data
        const tempKeys = [
          'pendingHotelBooking',
          'pendingRestaurantBooking',
          'pendingShortletBooking',
          'pendingGuestHotelBooking',
          'pendingLoggedInHotelBooking',
          'pendingGuestRestaurantBooking',
          'pendingLoggedInRestaurantBooking',
          'pendingGuestShortletBooking',
          'pendingLoggedInShortletBooking'
        ];
        
        tempKeys.forEach(key => localStorage.removeItem(key));
      }
      
      setLoading(false);
    };
    
    loadBookingData();
  }, [type]);

  // Determine booking status based on payment method
  const getBookingStatus = () => {
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    
    if (paymentMethod === "hotel" || paymentMethod === "restaurant") {
      return {
        status: "pending",
        text: "Pending Confirmation",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-100",
        icon: AlertCircle,
        message: "Awaiting payment at the property"
      };
    } else if (paymentMethod === "card" && bookingData?.paymentStatus === "paid") {
      return {
        status: "confirmed",
        text: "Confirmed",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100",
        icon: CheckCircle,
        message: "Payment received & booking confirmed"
      };
    } else {
      return {
        status: "pending",
        text: "Pending",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-100",
        icon: AlertCircle,
        message: "Awaiting confirmation"
      };
    }
  };

  // Get payment method display text
  const getPaymentMethodText = () => {
    const method = bookingData?.paymentMethod || "hotel";
    switch(method) {
      case "hotel":
        return "Pay at Hotel";
      case "restaurant":
        return "Pay at Restaurant";
      case "card":
        return "Paid with Card";
      default:
        return "Pay at Property";
    }
  };

  // Get category-specific messages
  const getCategoryMessages = () => {
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    const isPayAtProperty = paymentMethod === "hotel" || paymentMethod === "restaurant";
    
    switch(type) {
      case 'hotel':
        return {
          title: isPayAtProperty 
            ? "Thank you for booking on Ajani.ai 🎉 Hotel Reservation Request Received!" 
            : "Thank you for booking on Ajani.ai 🎉 Hotel Payment Successful!",
          message: isPayAtProperty
            ? "Your hotel reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed. You'll pay when you arrive at the hotel."
            : "Your hotel payment has been processed successfully! Your reservation is now confirmed. You'll receive a confirmation email with all the details shortly.",
          requestMessage: " Your hotel reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed.",
          paidMessage: "Your hotel payment has been processed successfully! Your reservation is now confirmed. You'll receive a confirmation email with all the details shortly."
        };
      
      case 'restaurant':
        return {
          title: isPayAtProperty 
            ? "Thank you for booking on Ajani.ai 🎉 Restaurant Reservation Request Received!" 
            : "Thank you for booking on Ajani.ai 🎉 Restaurant Payment Successful!",
          message: isPayAtProperty
            ? "Your restaurant reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed. You'll pay at the restaurant."
            : "Your restaurant payment has been processed successfully! Your table reservation is now confirmed. You'll receive a confirmation email with all the details shortly.",
          requestMessage: " Your restaurant reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed.",
          paidMessage: "Your restaurant payment has been processed successfully! Your table reservation is now confirmed. You'll receive a confirmation email with all the details shortly."
        };
      
      case 'shortlet':
        return {
          title: isPayAtProperty 
            ? "Thank you for booking on Ajani.ai 🎉 Shortlet Reservation Request Received!" 
            : "Thank you for booking on Ajani.ai 🎉 Shortlet Payment Successful!",
          message: isPayAtProperty
            ? "Your shortlet reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed. You'll pay when you arrive at the property."
            : "Your shortlet payment has been processed successfully! Your accommodation is now confirmed. You'll receive a confirmation email with all the details shortly.",
          requestMessage: "Your shortlet reservation request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed.",
          paidMessage: "Your shortlet payment has been processed successfully! Your accommodation is now confirmed. You'll receive a confirmation email with all the details shortly."
        };
      
      default:
        return {
          title: isPayAtProperty 
            ? "Thank you for booking on Ajani.ai 🎉 Booking Request Received!" 
            : "Thank you for booking on Ajani.ai 🎉 Payment Successful!",
          message: isPayAtProperty
            ? "Thank you for booking on Ajani.ai. Your booking request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed."
            : "Your payment has been processed successfully! Your booking is now confirmed. You'll receive a confirmation email with all the details shortly.",
          requestMessage: "Thank you for booking on Ajani.ai. Your booking request is under review and subject to availability. Our team will confirm shortly or contact you if alternatives are needed.",
          paidMessage: "Your payment has been processed successfully! Your booking is now confirmed. You'll receive a confirmation email with all the details shortly."
        };
    }
  };

  const getTitle = () => {
    const messages = getCategoryMessages();
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    
    if (paymentMethod === "hotel" || paymentMethod === "restaurant") {
      return messages.title;
    } else {
      return messages.title;
    }
  };

  const getMessage = () => {
    const messages = getCategoryMessages();
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    
    if (paymentMethod === "hotel" || paymentMethod === "restaurant") {
      return messages.message;
    } else {
      return messages.message;
    }
  };

  const getVendorName = () => {
    return bookingData?.hotelData?.name || 
           bookingData?.vendorData?.name || 
           bookingData?.roomData?.hotel?.name || 
           "Vendor";
  };

  const getVendorLocation = () => {
    return bookingData?.hotelData?.location || 
           bookingData?.vendorData?.area || 
           bookingData?.roomData?.hotel?.location || 
           "";
  };

  const getVendorImage = () => {
    return bookingData?.hotelData?.image || 
           bookingData?.vendorData?.image || 
           bookingData?.roomData?.hotel?.image || 
           "https://images.unsplash.com/photo-1552566626-52f8b828add9";
  };

  const getVendorRating = () => {
    return bookingData?.hotelData?.rating || 
           bookingData?.vendorData?.rating || 
           bookingData?.roomData?.hotel?.rating || 
           4.5;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const getTotalAmount = () => {
    return bookingData?.totalAmount || 
           bookingData?.roomData?.booking?.price || 
           0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking confirmation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const bookingStatus = getBookingStatus();
  const StatusIcon = bookingStatus.icon;
  const paymentMethod = bookingData?.paymentMethod || "hotel";
  const isPayAtProperty = paymentMethod === "hotel" || paymentMethod === "restaurant";
  const messages = getCategoryMessages();

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      
      {/* Reduced top spacing */}
      <div className="pt-0">
        {/* Main container with edge-to-edge padding on mobile */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          {/* Main Card */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-3 sm:p-6">
              {/* Success Icon & Title */}
              <div className="text-center mb-4 sm:mb-8">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${bookingStatus.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <StatusIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${bookingStatus.color}`} />
                </div>
                
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {getTitle()}
                </h1>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  {getMessage()}
                </p>
              </div>

              {/* Booking Reference Card */}
              <div className="bg-[#6cff] rounded-lg p-3 sm:p-4 text-white mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-1">
                      {isPayAtProperty ? "Booking Request Received" : "Booking Confirmed"}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      Your booking reference number
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="font-mono font-bold text-lg sm:text-xl bg-white/20 px-3 py-1.5 rounded-lg">
                      {bookingReference}
                    </div>
                    <p className="text-xs mt-1 opacity-90">Keep this for your records</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Banner */}
              <div className={`mb-4 sm:mb-6 ${bookingStatus.bgColor} border ${bookingStatus.borderColor} rounded-lg p-3 sm:p-4 flex items-center gap-3`}>
                {isPayAtProperty ? (
                  <Building className={`w-5 h-5 ${bookingStatus.color}`} />
                ) : (
                  <CreditCard className={`w-5 h-5 ${bookingStatus.color}`} />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {isPayAtProperty ? "Pay at Property" : "Paid Online"} • {bookingStatus.text}
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isPayAtProperty 
                      ? `You'll pay when you arrive. Amount: ${formatPrice(getTotalAmount())}`
                      : "Payment processed successfully"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Vendor Details */}
                <div className="lg:col-span-2">
                  {/* Vendor Card */}
                  <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="md:w-1/3 relative">
                        <img 
                          src={getVendorImage()} 
                          alt={getVendorName()}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 text-yellow-400 mr-1 inline" />
                          {getVendorRating()}
                        </div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {getVendorName()}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              <span className="truncate">{getVendorLocation() || "Location not specified"}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {type?.toUpperCase() || "BOOKING"}
                          </span>
                        </div>
                        
                        {/* Booking Details */}
                        <div className="space-y-2">
                          {bookingData?.checkInDate && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>Check-in</span>
                              </div>
                              <span className="font-medium">{bookingData.checkInDate}</span>
                            </div>
                          )}
                          
                          {bookingData?.checkOutDate && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>Check-out</span>
                              </div>
                              <span className="font-medium">{bookingData.checkOutDate}</span>
                            </div>
                          )}
                          
                          {(bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests) && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Users className="w-3 h-3" />
                                <span>Guests</span>
                              </div>
                              <span className="font-medium">
                                {bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests} 
                                {bookingData?.guests?.children ? ` + ${bookingData.guests.children} children` : ''}
                              </span>
                            </div>
                          )}
                          
                          {bookingData?.bookingData?.time && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>Time</span>
                              </div>
                              <span className="font-medium">{bookingData.bookingData.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div className="mb-4 sm:mb-6 bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      Guest Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Lead Guest</p>
                        <p className="font-medium text-sm">
                          {bookingData?.firstName || bookingData?.bookingData?.firstName || "Guest"} {bookingData?.lastName || bookingData?.bookingData?.lastName || ""}
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm">
                          {bookingData?.email || bookingData?.bookingData?.email || bookingData?.guestEmail || "Not provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-sm">
                          {bookingData?.phone || bookingData?.bookingData?.phone || "Not provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="font-medium text-sm">
                          {getPaymentMethodText()}
                        </p>
                      </div>
                    </div>
                    
                    {bookingData?.specialRequests && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {bookingData.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons - Stack on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingReference);
                        alert('Booking reference copied to clipboard!');
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Copy Reference
                    </button>
                    
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Print Confirmation
                    </button>
                  </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-20 space-y-4">
                    {/* Status Card */}
                    <div className={`${bookingStatus.bgColor} border ${bookingStatus.borderColor} rounded-lg p-3`}>
                      <h6 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-sm">
                        <StatusIcon className={`w-4 h-4 ${bookingStatus.color}`} />
                        Booking Status
                      </h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Reference</span>
                          <span className="font-mono font-bold text-emerald-600 text-xs">{bookingReference}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Status</span>
                          <span className={`font-medium ${bookingStatus.color} text-xs`}>
                            {bookingStatus.text}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Date</span>
                          <span className="font-medium text-xs">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Payment</span>
                          <span className="font-medium text-xs">
                            {getPaymentMethodText()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                      <h5 className="font-medium text-gray-800 mb-2 text-sm">Price Breakdown</h5>
                      
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            {type === 'hotel' ? `Room` : 'Reservation fee'}
                          </span>
                          <span className="font-medium">{formatPrice(getTotalAmount())}</span>
                        </div>
                        
                        {/* Taxes & Fees - Showing as ₦0 */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(0)}</span>
                        </div>
                        
                        {/* Service fee - Showing as ₦0 */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(0)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="pt-2 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatPrice(getTotalAmount())}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-0.5">
                          {isPayAtProperty ? "Pay at property" : "Payment received"}
                        </p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
                      <h6 className="font-bold text-gray-900 mb-1.5 text-sm">
                        {isPayAtProperty ? "What Happens Next?" : "What's Next?"}
                      </h6>
                      <ul className="space-y-1.5 text-xs">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {isPayAtProperty 
                              ? `You'll receive a confirmation email with ${type} details`
                              : `Confirmation email sent to your inbox`}
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {isPayAtProperty
                              ? messages.requestMessage
                              : messages.paidMessage}
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {isPayAtProperty
                              ? "Pay the amount when you arrive at the property"
                              : "Keep your booking reference handy"}
                          </span>
                        </li>
                        {isPayAtProperty && (
                          <li className="flex items-start gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              Amount to pay: {formatPrice(getTotalAmount())}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Support */}
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-2">Need assistance with your booking?</p>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href="mailto:support@ajani.com"
                          className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-3 h-3" />
                          support@ajani.com
                        </a>
                        <a
                          href="tel:+2348000000000"
                          className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="w-3 h-3" />
                          +234 800 000 0000
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </button>
                
                <button
                  onClick={() => navigate(`/category/${type || 'hotel'}`)}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-[#6cff] text-[#6cff] rounded-lg hover:bg-blue-50 transition-all font-medium text-sm"
                >
                  Browse More {type ? type.charAt(0).toUpperCase() + type.slice(1) + 's' : 'Hotels'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;