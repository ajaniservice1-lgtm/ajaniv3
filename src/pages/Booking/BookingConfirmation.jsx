import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Home, 
  Share2,
  Calendar,
  Users,
  Clock,
  MapPin,
  Star,
  Download,
  Printer,
  Shield,
  DollarSign,
  User,
  Building,
  Package,
  CreditCard,
  Eye,
  Copy,
  AlertCircle
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Helper function to update session activity (for guest sessions)
const updateSessionActivity = () => {
  const guestSession = localStorage.getItem("guestSession");
  if (guestSession) {
    try {
      const sessionData = JSON.parse(guestSession);
      const updatedSession = {
        ...sessionData,
        lastActive: new Date().toISOString()
      };
      localStorage.setItem("guestSession", JSON.stringify(updatedSession));
    } catch (error) {
      // Silent error handling
    }
  }
};

// Helper to get persistent storage key
const getPersistentBookingKey = (type) => {
  return `confirmedBooking_${type}_persistent`;
};

// Helper function to format location
const formatLocation = (location) => {
  if (!location) return "Location available";
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    // Try to extract string values from the object
    try {
      return Object.values(location)
        .filter(value => typeof value === 'string' && value.trim().length > 0)
        .join(', ');
    } catch {
      return "Location available";
    }
  }
  
  return String(location);
};

// Helper function to generate unique booking ID
const generateBookingId = () => {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to determine user role and profile
const getUserRoleAndProfile = () => {
  try {
    const token = localStorage.getItem("auth_token");
    const userProfileStr = localStorage.getItem("userProfile");
    
    if (!token || !userProfileStr) {
      return { isLoggedIn: false, isVendor: false, profile: null };
    }
    
    const profile = JSON.parse(userProfileStr);
    const isVendor = profile.role === "vendor";
    
    return {
      isLoggedIn: true,
      isVendor: isVendor,
      profile: profile,
      userId: profile.id || profile._id,
      userEmail: profile.email,
      userName: profile.firstName && profile.lastName 
        ? `${profile.firstName} ${profile.lastName}` 
        : profile.username || profile.email,
      businessName: isVendor ? (profile.vendor?.businessName || profile.businessName) : null
    };
  } catch (error) {
    return { isLoggedIn: false, isVendor: false, profile: null };
  }
};

// Helper to save booking to appropriate profile
const saveBookingToProfile = (bookingData, type, bookingReference, vendorInfo, totalAmount) => {
  try {
    const userInfo = getUserRoleAndProfile();
    
    // Create booking record with user role info
    const bookingRecord = {
      id: generateBookingId(),
      type: type,
      status: "confirmed",
      date: new Date().toISOString(),
      confirmedDate: new Date().toISOString(),
      vendor: vendorInfo,
      details: {
        checkIn: bookingData?.checkInDate || bookingData?.bookingData?.checkIn,
        checkOut: bookingData?.checkOutDate || bookingData?.bookingData?.checkOut,
        guests: bookingData?.guests || bookingData?.bookingData?.numberOfGuests,
        totalAmount: totalAmount,
        paymentMethod: bookingData?.paymentMethod,
        specialRequests: bookingData?.specialRequests,
        time: bookingData?.bookingData?.time,
        serviceDate: bookingData?.bookingData?.serviceDate,
        serviceTime: bookingData?.bookingData?.serviceTime,
        locationType: bookingData?.bookingData?.locationType,
        problemDescription: bookingData?.bookingData?.problemDescription,
        address: bookingData?.bookingData?.address
      },
      reference: bookingReference,
      bookedBy: {
        role: userInfo.isVendor ? "vendor" : "user",
        isVendor: userInfo.isVendor,
        userId: userInfo.userId,
        userEmail: userInfo.userEmail,
        userName: userInfo.userName,
        businessName: userInfo.businessName,
        vendorId: userInfo.isVendor ? (userInfo.profile?.vendor?.id || userInfo.profile?.vendorId) : null
      },
      bookingCategory: userInfo.isVendor ? "personal" : "customer", // Important: Distinguish vendor personal bookings
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (userInfo.isLoggedIn) {
      // Save to logged-in user's profile
      const updatedProfile = { ...userInfo.profile };
      
      if (!updatedProfile.bookings) {
        updatedProfile.bookings = [];
      }
      
      // Add booking to profile
      updatedProfile.bookings.push(bookingRecord);
      
      // Limit bookings to last 50
      if (updatedProfile.bookings.length > 50) {
        updatedProfile.bookings = updatedProfile.bookings.slice(-50);
      }
      
      // Update localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      // Also save to separate bookings storage for easy access
      const allBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
      allBookings.push(bookingRecord);
      localStorage.setItem("userBookings", JSON.stringify(allBookings));
      
      // If vendor made a booking, save to vendor's personal bookings storage
      if (userInfo.isVendor) {
        const vendorPersonalBookings = JSON.parse(localStorage.getItem("vendorPersonalBookings") || "[]");
        vendorPersonalBookings.push(bookingRecord);
        localStorage.setItem("vendorPersonalBookings", JSON.stringify(vendorPersonalBookings));
        
        // Note: Business bookings (customers booking vendor's services) should be stored separately
        // This would come from vendor dashboard, not from making bookings
      }
      
      // Trigger storage event to update profile pages
      window.dispatchEvent(new Event("storage"));
      
      return { 
        success: true, 
        isLoggedIn: true, 
        isVendor: userInfo.isVendor,
        bookingId: bookingRecord.id,
        bookingCategory: userInfo.isVendor ? "personal" : "customer"
      };
    } else {
      // Save as guest booking
      const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
      guestBookings.push({
        ...bookingRecord,
        bookedBy: {
          role: "guest",
          isVendor: false,
          guestSessionId: localStorage.getItem("guestSessionId") || `guest_${Date.now()}`
        },
        bookingCategory: "guest"
      });
      
      localStorage.setItem("guestBookings", JSON.stringify(guestBookings));
      
      // Also save to persistent storage for this session
      const persistentKey = getPersistentBookingKey(type);
      localStorage.setItem(persistentKey, JSON.stringify({
        ...bookingData,
        timestamp: new Date().toISOString(),
        reference: bookingReference,
        bookingId: bookingRecord.id
      }));
      
      return { 
        success: true, 
        isLoggedIn: false, 
        isVendor: false,
        bookingId: bookingRecord.id,
        bookingCategory: "guest"
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  
  const [bookingData, setBookingData] = useState(null);
  const [bookingReference, setBookingReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [bookingSaved, setBookingSaved] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [userInfo, setUserInfo] = useState({ isLoggedIn: false, isVendor: false, profile: null });

  const isServiceBooking = type === 'service';
  const isRestaurantBooking = type === 'restaurant';

  const showToast = (message, type = "success") => {
    const toastOptions = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
    };

    switch(type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    updateSessionActivity();
    
    // Get user info
    const userData = getUserRoleAndProfile();
    setUserInfo(userData);
    
    const generateReference = () => {
      const prefix = type === 'restaurant' ? 'REST-' : 
                     type === 'shortlet' ? 'SHORT-' : 
                     type === 'hotel' ? 'AJN-' : 
                     type === 'service' ? 'SVC-' : 'BOOK-';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const loadBookingReference = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const refFromUrl = urlParams.get('ref');
      
      if (refFromUrl) {
        setBookingReference(refFromUrl);
        return refFromUrl;
      }
      
      const storedRef = localStorage.getItem('lastBookingReference');
      if (storedRef) {
        setBookingReference(storedRef);
        return storedRef;
      }
      
      const newRef = generateReference();
      setBookingReference(newRef);
      localStorage.setItem('lastBookingReference', newRef);
      return newRef;
    };
    
    const ref = loadBookingReference();
    
    const loadBookingData = () => {
      setLoading(true);
      
      let data = null;
      let guestBooking = false;
      
      const urlParams = new URLSearchParams(window.location.search);
      const bookingDataParam = urlParams.get('bookingData');
      
      if (bookingDataParam) {
        try {
          data = JSON.parse(decodeURIComponent(bookingDataParam));
          if (data) {
            const persistentKey = getPersistentBookingKey(type);
            localStorage.setItem(persistentKey, JSON.stringify({
              ...data,
              timestamp: new Date().toISOString(),
              reference: ref
            }));
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      if (!data) {
        const persistentKey = getPersistentBookingKey(type);
        const persistentData = localStorage.getItem(persistentKey);
        
        if (persistentData) {
          try {
            data = JSON.parse(persistentData);
          } catch (error) {
            // Silent error handling
          }
        }
      }
      
      if (!data) {
        const possibleKeys = [
          `confirmedBooking_${type}`,
          `${type}Booking`,
          'completeBooking',
          'confirmedBooking',
          `pendingGuest${type.charAt(0).toUpperCase() + type.slice(1)}Booking`,
          `pendingLoggedIn${type.charAt(0).toUpperCase() + type.slice(1)}Booking`
        ];
        
        for (const key of possibleKeys) {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            try {
              data = JSON.parse(storedData);
              const persistentKey = getPersistentBookingKey(type);
              localStorage.setItem(persistentKey, JSON.stringify({
                ...data,
                timestamp: new Date().toISOString(),
                reference: ref
              }));
              break;
            } catch (error) {
              // Silent error handling
            }
          }
        }
      }
      
      if (data) {
        if (data.isGuestBooking || data.bookingType === 'guest') {
          guestBooking = true;
          setIsGuestBooking(true);
          
          // Clean up guest session
          localStorage.removeItem("guestSession");
          
          const guestKeys = [
            'pendingGuestHotelBooking',
            'pendingGuestRestaurantBooking',
            'pendingGuestShortletBooking',
            'pendingGuestServiceBooking'
          ];
          
          guestKeys.forEach(key => localStorage.removeItem(key));
        }
        
        setBookingData(data);
        
        localStorage.setItem('lastBookingType', type);
        
        const vendorInfo = {
          name: getVendorName(data),
          location: getVendorLocation(data),
          image: getVendorImage(data),
          rating: getVendorRating(data)
        };
        
        const totalAmount = getTotalAmount(data);
        const saveResult = saveBookingToProfile(data, type, ref, vendorInfo, totalAmount);
        
        if (saveResult.success) {
          setBookingId(saveResult.bookingId);
          setBookingSaved(true);
          setIsGuestBooking(!saveResult.isLoggedIn);
          
          let successMessage = " Booking confirmed";
          if (saveResult.isLoggedIn) {
            if (saveResult.isVendor) {
              successMessage += " and saved to your vendor personal bookings!";
            } else {
              successMessage += " and saved to your profile!";
            }
          } else {
            successMessage += "! Save your reference for future access.";
          }
          
          showToast(successMessage, "success");
        } else {
          showToast("⚠️ Booking confirmed but could not save to profile. Please take a screenshot.", "warning");
        }
        
        // Clean up temporary storage
        const tempKeys = [
          'pendingHotelBooking',
          'pendingRestaurantBooking',
          'pendingShortletBooking',
          'pendingServiceBooking',
          'pendingGuestHotelBooking',
          'pendingLoggedInHotelBooking',
          'pendingGuestRestaurantBooking',
          'pendingLoggedInRestaurantBooking',
          'pendingGuestShortletBooking',
          'pendingLoggedInShortletBooking',
          'pendingGuestServiceBooking',
          'pendingLoggedInServiceBooking',
          'completeBooking',
          'confirmedBooking'
        ];
        
        tempKeys.forEach(key => {
          if (key !== getPersistentBookingKey(type)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        showToast("❌ No booking data found. Please start your booking again.", "error");
      }
      
      setLoading(false);
    };
    
    // Small delay to ensure all data is loaded
    setTimeout(loadBookingData, 100);
  }, [type]);

  const getVendorName = (data = bookingData) => {
    return data?.vendorData?.name || 
           data?.hotelData?.name || 
           data?.roomData?.hotel?.name || 
           data?.propertyName ||
           (isServiceBooking ? "Service Provider" : "Property");
  };

  const getVendorLocation = (data = bookingData) => {
    if (isServiceBooking) {
      const address = data?.bookingData?.address;
      if (address) {
        return formatLocation(address);
      }
      return "Oyo State, Nigeria";
    }
    
    const location = data?.vendorData?.area || 
                     data?.hotelData?.location || 
                     data?.roomData?.hotel?.location || 
                     data?.propertyLocation || 
                     data?.location;
    
    return formatLocation(location);
  };

  const getVendorImage = (data = bookingData) => {
    return data?.vendorData?.image || 
           data?.hotelData?.image || 
           data?.roomData?.hotel?.image || 
           data?.propertyImage ||
           (isServiceBooking 
             ? "https://images.unsplash.com/photo-1581094794329-c8112a89af12" 
             : "https://images.unsplash.com/photo-1552566626-52f8b828add9");
  };

  const getVendorRating = (data = bookingData) => {
    return data?.vendorData?.rating || 
           data?.hotelData?.rating || 
           data?.roomData?.hotel?.rating || 
           data?.propertyRating ||
           4.5;
  };

  const getTotalAmount = (data = bookingData) => {
    return data?.totalAmount || 
           data?.roomData?.booking?.price || 
           data?.bookingData?.totalPrice ||
           0;
  };

  const getPriceRange = (data = bookingData) => {
    if (isRestaurantBooking) {
      const priceFrom = data?.priceFrom || data?.bookingData?.priceFrom || 1000;
      const priceTo = data?.priceTo || data?.bookingData?.priceTo || 10000;
      
      const fromNum = typeof priceFrom === 'number' ? priceFrom : parseInt(priceFrom.toString().replace(/[^\d]/g, ""));
      const toNum = typeof priceTo === 'number' ? priceTo : parseInt(priceTo.toString().replace(/[^\d]/g, ""));
      
      if (isNaN(fromNum) && isNaN(toNum)) return "₦ --";
      if (isNaN(fromNum)) return `₦${toNum.toLocaleString()}`;
      if (isNaN(toNum)) return `₦${fromNum.toLocaleString()}`;
      
      if (fromNum === toNum) return `₦${fromNum.toLocaleString()}`;
      
      return `₦${fromNum.toLocaleString()} - ₦${toNum.toLocaleString()}`;
    }
    return null;
  };

  const getReservationFee = (data = bookingData) => {
    if (isRestaurantBooking) {
      return data?.reservationFee || data?.bookingData?.reservationFee || 0;
    }
    return 0;
  };

  const downloadConfirmation = () => {
    if (!bookingData) {
      showToast('❌ No booking data available to download', 'error');
      return;
    }
    
    const categoryName = type === 'hotel' ? 'Hotel' :
                        type === 'restaurant' ? 'Restaurant' :
                        type === 'shortlet' ? 'Shortlet' :
                        type === 'service' ? 'Service' : 'Booking';
    
    const userRole = userInfo.isVendor ? "Vendor" : (userInfo.isLoggedIn ? "Customer" : "Guest");
    
    let confirmationText = `
AJANI.AI BOOKING CONFIRMATION
================================

Booking Reference: ${bookingReference}
Booking ID: ${bookingId}
Booking Type: ${categoryName.toUpperCase()} ${type === 'service' ? 'SERVICE' : 'BOOKING'}
Booked By: ${userRole}
Status: Confirmed
Date: ${new Date().toLocaleDateString()}
Confirmation Time: ${new Date().toLocaleTimeString()}

${categoryName.toUpperCase()} DETAILS:
${'='.repeat(categoryName.length + 9)}
Name: ${getVendorName()}
Location: ${getVendorLocation()}
Rating: ${getVendorRating()}/5

BOOKED BY INFORMATION:
----------------------
${userInfo.isVendor ? 'Business Name: ' + (userInfo.profile?.vendor?.businessName || userInfo.profile?.businessName || 'N/A') : 'Name: ' + (userInfo.userName || "Guest")}
Email: ${userInfo.userEmail || bookingData?.email || bookingData?.bookingData?.contactPerson?.email || bookingData?.guestEmail || "Not provided"}
Phone: ${userInfo.profile?.phone || bookingData?.phone || bookingData?.bookingData?.contactPerson?.phone || "Not provided"}
Role: ${userRole}
    `;

    if (type === 'hotel') {
      confirmationText += `
BOOKING DETAILS:
----------------
Check-in: ${bookingData?.checkInDate || bookingData?.bookingData?.checkIn || "Not specified"}
Check-out: ${bookingData?.checkOutDate || bookingData?.bookingData?.checkOut || "Not specified"}
Guests: ${bookingData?.guests?.adults || bookingData?.bookingData?.adults || 2} adults
${bookingData?.guests?.children ? `Children: ${bookingData.guests.children}` : ''}
Nights: ${bookingData?.bookingData?.nights || 1}
Room: ${bookingData?.roomData?.room?.title || "Standard Room"}
      `;
    } else if (type === 'restaurant') {
      const priceRange = getPriceRange();
      confirmationText += `
BOOKING DETAILS:
----------------
Date: ${bookingData?.bookingData?.date || "Today"}
Time: ${bookingData?.bookingData?.time || "Not specified"}
Guests: ${bookingData?.bookingData?.numberOfGuests || bookingData?.guests?.adults || 2} people
Price Range: ${priceRange}
      `;
    } else if (type === 'shortlet') {
      confirmationText += `
BOOKING DETAILS:
----------------
Date: ${bookingData?.bookingData?.date || "Today"}
Time: ${bookingData?.bookingData?.time || "Not specified"}
Guests: ${bookingData?.bookingData?.numberOfGuests || bookingData?.guests?.adults || 2} people
      `;
    } else if (type === 'service') {
      confirmationText += `
SERVICE DETAILS:
----------------
Service Date: ${bookingData?.bookingData?.serviceDate || "Not specified"}
Service Time: ${bookingData?.bookingData?.serviceTime || "Not specified"}
Location Type: ${bookingData?.bookingData?.locationType || "Residential"}
Problem Description: ${bookingData?.bookingData?.problemDescription || "Not specified"}
${bookingData?.bookingData?.specialRequirements ? `Special Requirements: ${bookingData.bookingData.specialRequirements}` : ""}

ADDRESS:
--------
${getVendorLocation()}
      `;
    }

    if (type !== 'service') {
      const totalAmount = getTotalAmount();
      const priceRange = getPriceRange();
      
      confirmationText += `
PAYMENT INFORMATION:
--------------------
Payment Method: ${getPaymentMethodText()}
${isRestaurantBooking ? `Estimated Total Cost: ${priceRange}` : `Total Amount: ₦${totalAmount?.toLocaleString() || '0'}`}
Payment Status: ${bookingData?.paymentStatus || "Pending"}
      `;
    } else {
      confirmationText += `
PAYMENT INFORMATION:
--------------------
Payment Method: Pay at Service Completion
Payment Status: Pending (Pay when service is completed)
Note: Price will be determined after service assessment
      `;
    }

    confirmationText += `
ADDITIONAL INFORMATION:
-----------------------
${bookingData?.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : "No special requests"}

IMPORTANT NOTES:
----------------
• Keep this booking reference for reference: ${bookingReference}
• Booking ID: ${bookingId}
• Present this confirmation at the ${type === 'service' ? 'service location' : 'property'}
• Booking was made by: ${userRole}
• Contact support for any changes
• Booking is stored ${isGuestBooking ? 'as a guest booking' : `in your ${userInfo.isVendor ? 'vendor personal bookings' : 'account profile'}`}

Thank you for booking with Ajani.ai!
For assistance, contact support@ajani.com or call +234 8022662256

This confirmation was generated on: ${new Date().toLocaleString()}
================================
    `;
    
    try {
      const element = document.createElement("a");
      const file = new Blob([confirmationText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `ajani-${type}-booking-${bookingReference}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('✅ Confirmation downloaded successfully!', 'success');
    } catch (error) {
      showToast('❌ Failed to download confirmation', 'error');
    }
  };

  const printConfirmation = () => {
    window.print();
  };

  const getBookingStatus = () => {
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    
    if (paymentMethod === "hotel" || paymentMethod === "restaurant") {
      return {
        status: "confirmed",
        text: "Confirmed",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100",
        icon: CheckCircle,
        message: type === 'service' ? "Service appointment scheduled" : "Booking confirmed",
        note: type === 'service' ? "Service provider will contact you" : "Please pay when you arrive"
      };
    } else {
      return {
        status: "confirmed",
        text: "Confirmed",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100",
        icon: CheckCircle,
        message: "Booking confirmed",
        note: "Payment processed successfully"
      };
    }
  };

  const getPaymentMethodText = () => {
    const method = bookingData?.paymentMethod || "hotel";
    switch(method) {
      case "hotel":
        return type === 'service' ? "Payment after negotiation" : "Pay at Property";
      case "restaurant":
        return "Pay at Restaurant";
      case "card":
        return "Paid with Card";
      default:
        return type === 'service' ? "Payment after negotiation" : "Pay at Property";
    }
  };

  const getCategoryMessages = () => {
    const paymentMethod = bookingData?.paymentMethod || "hotel";
    const isPayAtProperty = paymentMethod === "hotel" || paymentMethod === "restaurant";
    
    switch(type) {
      case 'hotel':
        return {
          title: userInfo.isVendor 
            ? "Thank you for your hotel booking on Ajani.ai!" 
            : "Thank you for booking on Ajani.ai, Hotel Booking Confirmed!",
          subtitle: "Your hotel reservation has been received",
          message: "Your hotel booking has been confirmed successfully. You'll receive a confirmation email with all the details shortly.",
          nextSteps: [
            "Confirmation email sent to your inbox",
            "Check your email for booking details",
            "Present your booking reference at check-in",
            "Enjoy your stay!"
          ],
          contactMessage: "Need help with your hotel booking?"
        };
      
      case 'restaurant':
        return {
          title: userInfo.isVendor 
            ? "Thank you for your restaurant booking on Ajani.ai!" 
            : "Thank you for booking on Ajani.ai, Restaurant Booking Confirmed!",
          subtitle: "Your restaurant reservation has been received",
          message: "Your restaurant booking has been confirmed successfully. You'll receive a confirmation email with all the details shortly.",
          nextSteps: [
            "Confirmation email sent to your inbox",
            "Check your email for reservation details",
            "Present your booking reference at the restaurant",
            "Enjoy your dining experience!"
          ],
          contactMessage: "Need help with your restaurant reservation?"
        };
      
      case 'shortlet':
        return {
          title: userInfo.isVendor 
            ? "Thank you for your shortlet booking on Ajani.ai!" 
            : "Thank you for booking on Ajani.ai, Shortlet Booking Confirmed!",
          subtitle: "Your shortlet reservation has been received",
          message: "Your shortlet booking has been confirmed successfully. You'll receive a confirmation email with all the details shortly.",
          nextSteps: [
            "Confirmation email sent to your inbox",
            "Check your email for property details",
            "Present your booking reference at check-in",
            "Enjoy your stay!"
          ],
          contactMessage: "Need help with your shortlet booking?"
        };
      
      case 'service':
        return {
          title: userInfo.isVendor 
            ? "Thank you for your service booking on Ajani.ai!" 
            : "Thank you for booking on Ajani.ai, Service Booking Confirmed!",
          subtitle: "Your service appointment has been scheduled",
          message: "Your service booking has been confirmed successfully. The service provider will contact you to confirm the appointment time.",
          nextSteps: [
            "Service provider will contact you within 24 hours",
            "Discuss service details with the provider",
            "Provider will confirm the appointment time",
            "Pay after service completion when satisfied"
          ],
          contactMessage: "Need help with your service booking?"
        };
      
      default:
        return {
          title: userInfo.isVendor 
            ? "Thank you for your booking on Ajani.ai!" 
            : "Thank you for booking on Ajani.ai, Booking Confirmed!",
          subtitle: "Your booking has been received",
          message: "Your booking has been confirmed successfully. You'll receive a confirmation email with all the details shortly.",
          nextSteps: [
            "Confirmation email sent to your inbox",
            "Check your email for booking details",
            "Present your booking reference when required",
            "Enjoy your experience!"
          ],
          contactMessage: "Need help with your booking?"
        };
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const clearOldPersistentData = () => {
    const persistentKey = getPersistentBookingKey(type);
    const storedData = localStorage.getItem(persistentKey);
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const storedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - storedTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          localStorage.removeItem(persistentKey);
          localStorage.removeItem('lastBookingReference');
          localStorage.removeItem('lastBookingType');
        }
      } catch (error) {
        // Silent error handling
      }
    }
  };

  useEffect(() => {
    clearOldPersistentData();
  }, []);

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

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-16">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              No Booking Data Found
            </h2>
            <p className="text-gray-600 mb-5">
              Please start your booking again or check your email for confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-[#6cff] text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              If you've already completed a booking, your confirmation may have been sent to your email.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const bookingStatus = getBookingStatus();
  const StatusIcon = CheckCircle;
  const paymentMethod = bookingData?.paymentMethod || "hotel";
  const isPayAtProperty = paymentMethod === "hotel" || paymentMethod === "restaurant";
  const messages = getCategoryMessages();
  const totalAmount = getTotalAmount();
  const priceRange = getPriceRange();
  const reservationFee = getReservationFee();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ToastContainer />
      
      <div className="pt-0">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-3 sm:p-6">
              {isGuestBooking && (
                <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 text-sm">
                      {bookingSaved ? "Guest Booking Complete" : "Booking Saved"}
                    </p>
                    <p className="text-xs text-blue-700">
                      {bookingSaved 
                        ? "Your booking as a guest has been successfully submitted. Please save your booking reference for future reference."
                        : "Your booking has been saved to your profile. You can view it anytime in 'My Bookings'."}
                    </p>
                  </div>
                </div>
              )}


              <div className="text-center mb-4 sm:mb-8">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <CheckCircle className={`w-10 h-10 sm:w-12 sm:h-12 text-emerald-600`} />
                </div>
                
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {messages.title}
                </h1>
                <p className="text-lg font-medium text-emerald-600 mb-3">
                  {messages.subtitle}
                </p>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  {messages.message}
                </p>
              </div>

              <div className="bg-[#6cff] rounded-lg p-3 sm:p-4 text-white mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-1">
                      Booking Confirmed
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
                {bookingId && (
                  <div className="mt-2 text-xs opacity-90">
                    Booking ID: <span className="font-mono">{bookingId}</span>
                  </div>
                )}
              </div>

              <div className={`mb-4 sm:mb-6 bg-emerald-50 border border-emerald-100 rounded-lg p-3 sm:p-4 flex items-center gap-3`}>
                <CheckCircle className={`w-5 h-5 text-emerald-600`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {getPaymentMethodText()} • Confirmed
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isServiceBooking 
                      ? "Service provider will contact you to discuss details"
                      : isPayAtProperty 
                        ? `You'll pay when you arrive. ${type !== 'service' ? `${isRestaurantBooking ? `Total estimated: ${priceRange}` : `Amount: ${formatPrice(totalAmount)}`}` : ''}`
                        : "Payment processed successfully"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-4 sm:mb-6 shadow-sm rounded-lg p-3 sm:p-4 border border-blue-100">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="md:w-1/3 relative">
                        <img 
                          src={getVendorImage()} 
                          alt={getVendorName()}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.src = getVendorImage();
                          }}
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
                              <span className="truncate">{getVendorLocation()}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {type?.toUpperCase() || "BOOKING"}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {isServiceBooking ? (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  <span>Service Date</span>
                                </div>
                                <span className="font-medium">{bookingData?.bookingData?.serviceDate || "Not specified"}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Service Time</span>
                                </div>
                                <span className="font-medium">{bookingData?.bookingData?.serviceTime || "Not specified"}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Location Type</span>
                                </div>
                                <span className="font-medium">{bookingData?.bookingData?.locationType || "Residential"}</span>
                              </div>
                            </>
                          ) : type === 'hotel' ? (
                            <>
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
                            </>
                          ) : type === 'restaurant' ? (
                            <>
                              {bookingData?.bookingData?.date && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>Date</span>
                                  </div>
                                  <span className="font-medium">{bookingData.bookingData.date}</span>
                                </div>
                              )}
                              
                              {(bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests) && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Users className="w-3 h-3" />
                                    <span>Guests</span>
                                  </div>
                                  <span className="font-medium">
                                    {bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests} people
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
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Price Range</span>
                                </div>
                                <span className="font-medium text-emerald-600">
                                  {priceRange}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              {bookingData?.bookingData?.date && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>Date</span>
                                  </div>
                                  <span className="font-medium">{bookingData.bookingData.date}</span>
                                </div>
                              )}
                              
                              {(bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests) && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Users className="w-3 h-3" />
                                    <span>Guests</span>
                                  </div>
                                  <span className="font-medium">
                                    {bookingData?.guests?.adults || bookingData?.bookingData?.numberOfGuests} people
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6 shadow-sm rounded-lg p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      {isServiceBooking ? "Contact Information" : "Guest Information"}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">{isServiceBooking ? "Contact Person" : "Lead Guest"}</p>
                        <p className="font-medium text-sm">
                          {isServiceBooking 
                            ? `${bookingData?.bookingData?.contactPerson?.firstName || "Guest"} ${bookingData?.bookingData?.contactPerson?.lastName || ""}`
                            : `${bookingData?.firstName || bookingData?.bookingData?.contactPerson?.firstName || "Guest"} ${bookingData?.lastName || bookingData?.bookingData?.contactPerson?.lastName || ""}`
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm">
                          {isServiceBooking 
                            ? bookingData?.bookingData?.contactPerson?.email || bookingData?.guestEmail || "Not provided"
                            : bookingData?.email || bookingData?.bookingData?.contactPerson?.email || bookingData?.guestEmail || "Not provided"
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-sm">
                          {isServiceBooking 
                            ? bookingData?.bookingData?.contactPerson?.phone || "Not provided"
                            : bookingData?.phone || bookingData?.bookingData?.contactPerson?.phone || "Not provided"
                          }
                        </p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Booked By</p>
                        <p className="font-medium text-sm">
                          {userInfo.isVendor ? "Vendor Account" : userInfo.isLoggedIn ? "Registered User" : "Guest"}
                        </p>
                      </div>
                    </div>
                    
                    {isServiceBooking && bookingData?.bookingData?.problemDescription && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Problem Description</p>
                        <p className="text-sm text-gray-700 border-gray-300 bg-white p-2 rounded border">
                          {bookingData.bookingData.problemDescription}
                        </p>
                      </div>
                    )}
                    
                    {isServiceBooking && bookingData?.bookingData?.specialRequirements && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Special Requirements</p>
                        <p className="text-sm text-gray-700 bg-white p-2 border-gray-300 rounded border">
                          {bookingData.bookingData.specialRequirements}
                        </p>
                      </div>
                    )}
                    
                    {!isServiceBooking && bookingData?.specialRequests && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {bookingData.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingReference).then(() => {
                          showToast('✅ Booking reference copied to clipboard!', 'success');
                        }).catch(() => {
                          showToast('❌ Failed to copy to clipboard', 'error');
                        });
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Reference
                    </button>
                    
                    <button 
                      onClick={downloadConfirmation}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    
                    <button 
                      onClick={printConfirmation}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-20 space-y-4">
                    <div className={`bg-emerald-50 border border-emerald-100 rounded-lg p-3`}>
                      <h6 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-sm">
                        <CheckCircle className={`w-4 h-4 text-emerald-600`} />
                        {isServiceBooking ? "Service Status" : "Booking Status"}
                      </h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Reference</span>
                          <span className="font-mono font-bold text-emerald-600 text-xs">{bookingReference}</span>
                        </div>
                        {bookingId && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Booking ID</span>
                            <span className="font-mono font-bold text-emerald-600 text-xs truncate max-w-[100px]">
                              {bookingId}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Status</span>
                          <span className={`font-medium text-emerald-600 text-xs`}>
                            Confirmed
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
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Booked By</span>
                          <span className="font-medium text-xs">
                            {userInfo.isVendor ? "Vendor (Personal Booking)" : userInfo.isLoggedIn ? "User" : "Guest"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isServiceBooking ? (
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                        <h5 className="font-medium text-gray-800 mb-2 text-sm">Price Breakdown</h5>
                        
                        <div className="space-y-1.5 mb-3">
                          {isRestaurantBooking && (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Reservation fee</span>
                                <span className="font-medium">{formatPrice(reservationFee)}</span>
                              </div>
                              
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Estimated meal cost</span>
                                <span className="font-medium">{priceRange}</span>
                              </div>
                            </>
                          )}
                          
                          {!isRestaurantBooking && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                {type === 'hotel' ? `Room` : 'Reservation fee'}
                              </span>
                              <span className="font-medium">{formatPrice(totalAmount)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Taxes & fees</span>
                            <span className="font-medium">{formatPrice(0)}</span>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Service fee</span>
                            <span className="font-medium">{formatPrice(0)}</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-sm">
                              {isRestaurantBooking ? 'Total Estimated Cost' : 'Total Amount'}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">
                              {isRestaurantBooking ? priceRange : formatPrice(totalAmount)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-0.5">
                            {isRestaurantBooking 
                              ? "Reservation fee + meal cost" 
                              : isPayAtProperty ? "Pay at property" : "Payment received"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                        <h5 className="font-medium text-gray-800 mb-2 text-sm">Service Details</h5>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-600">Date</span>
                            <span className="font-medium text-xs text-right">{bookingData?.bookingData?.serviceDate || "Not specified"}</span>
                          </div>
                          
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-600">Time</span>
                            <span className="font-medium text-xs text-right">{bookingData?.bookingData?.serviceTime || "Not specified"}</span>
                          </div>
                          
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-600">Location Type</span>
                            <span className="font-medium text-xs text-right">{bookingData?.bookingData?.locationType || "Residential"}</span>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900 text-sm">Pricing</span>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-0.5">
                              Price will be determined after service assessment
                            </p>
                            <p className="text-xs text-gray-600 mt-2 text-center">
                              Pay only when satisfied with the service
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
                      <h6 className="font-bold text-gray-900 mb-1.5 text-sm">
                        Next Steps
                      </h6>
                      <ul className="space-y-1.5 text-xs">
                        {messages.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg border border-green-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <h6 className="font-bold text-gray-900 text-sm">Ajani Guarantee</h6>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {isServiceBooking ? (
                          <>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Pay only when satisfied with service</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Free cancellation up to 24 hours before service</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Verified service providers</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>24/7 customer support</span>
                            </li>
                          </>
                        ) : isRestaurantBooking ? (
                          <>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Pay only at restaurant</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Free cancellation up to 2 hours before reservation</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Best table guarantee</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>24/7 customer support</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Free cancellation up to 24 hours before check-in</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Best price guarantee</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>24/7 customer support</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="text-center border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-2">{messages.contactMessage}</p>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href="mailto:support@ajani.com"
                          className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-3 h-3" />
                          support@ajani.com
                        </a>
                        <a
                          href="tel:+2348022662256"
                          className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="w-3 h-3" />
                          +234 8022662256
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </button>
                
                {userInfo.isVendor ? (
                  <button
                    onClick={() => navigate("/vendor/profile", { state: { activeTab: "personal-bookings" } })}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-900 rounded-lg hover:bg-purple-50 transition-all font-medium text-sm"
                  >
                    <Building className="w-4 h-4" />
                    Go to Vendor Personal Bookings
                  </button>
                ) : userInfo.isLoggedIn ? (
                  <button
                    onClick={() => navigate("/buyer/profile", { state: { activeTab: "bookings" } })}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-[#6cff] text-[#6cff] rounded-lg hover:bg-blue-50 transition-all font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Go to My Profile
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/category/${type || 'hotel'}`)}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-[#6cff] text-[#6cff] rounded-lg hover:bg-blue-50 transition-all font-medium text-sm"
                  >
                    Browse More {type ? type.charAt(0).toUpperCase() + type.slice(1) + (type === 'service' ? 's' : 's') : 'Hotels'}
                  </button>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  View all your bookings in one place
                </p>
                <button
                  onClick={() => {
                    if (userInfo.isVendor) {
                      navigate("/vendor/profile", { state: { activeTab: "personal-bookings" } });
                    } else if (userInfo.isLoggedIn) {
                      navigate("/buyer/profile", { state: { activeTab: "bookings" } });
                    } else {
                      navigate("/login", { state: { from: "/my-bookings" } });
                    }
                  }}
                  className="inline-flex items-center gap-2 text-[#6cff] font-medium hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  {userInfo.isVendor ? "View in Vendor Personal Bookings" : "Go to My Bookings"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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