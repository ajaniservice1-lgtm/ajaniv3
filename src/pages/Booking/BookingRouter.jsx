// Updated BookingRouter.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HotelBooking from "./HotelBooking";
import RestaurantBooking from "./RestaurantBooking";
import ShortletBooking from "./ShortletBooking";
import EventBooking from "./EventBooking"; // Make sure this is imported
import ServiceBooking from "./ServiceBooking"; // Make sure this is imported

const BookingRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState("");

  useEffect(() => {
    const loadVendorData = () => {
      setLoading(true);
      
      // Try to get vendor data from various sources
      const dataFromState = location.state?.vendorData;
      const fromLocalStorage = localStorage.getItem('currentVendorBooking');
      const fromSession = sessionStorage.getItem('currentVendorBooking');
      
      let data = null;
      if (dataFromState) {
        data = dataFromState;
      } else if (fromLocalStorage) {
        data = JSON.parse(fromLocalStorage);
      } else if (fromSession) {
        data = JSON.parse(fromSession);
      } else {
        // Try roomBookingData as fallback
        const roomData = localStorage.getItem('roomBookingData');
        if (roomData) {
          try {
            const parsed = JSON.parse(roomData);
            data = parsed.hotel || parsed.vendorData;
          } catch (error) {
            console.error("Error parsing room data:", error);
          }
        }
      }
      
      if (data) {
        setVendorData(data);
        
        // Determine booking type
        const category = data.category?.toLowerCase() || 
                        data.bookingType?.toLowerCase() || 
                        data.type?.toLowerCase() || "";
        
        console.log("📊 Determining booking type from category:", category);
        console.log("📊 Full vendor data:", data);
        
        // UPDATED CATEGORY DETECTION - Event first
        if (category.includes('event') || category.includes('venue') || category.includes('hall') || category.includes('conference') || category.includes('party') || category.includes('wedding') || category.includes('banquet')) {
          console.log("✅ Detected as EVENT booking");
          setBookingType('event');
        } else if (category.includes('service') || category.includes('professional') || category.includes('consultation') || category.includes('therapy') || category.includes('repair') || category.includes('maintenance') || category.includes('cleaning') || category.includes('installation')) {
          console.log("✅ Detected as SERVICE booking");
          setBookingType('service');
        } else if (category.includes('restaurant') || category.includes('food') || category.includes('cafe') || category.includes('dining')) {
          console.log("✅ Detected as RESTAURANT booking");
          setBookingType('restaurant');
        } else if (category.includes('shortlet') || category.includes('apartment') || category.includes('rental') || category.includes('apartments') || category.includes('vacation')) {
          console.log("✅ Detected as SHORTLET booking");
          setBookingType('shortlet');
        } else if (category.includes('hotel') || category.includes('resort') || category.includes('lodging') || category.includes('hotels') || category.includes('inn') || category.includes('suite')) {
          console.log("✅ Detected as HOTEL booking");
          setBookingType('hotel');
        } else {
          // Default based on URL or other indicators
          console.log("⚠️ Category not detected, checking URL...");
          if (location.pathname.includes('/hotel')) {
            setBookingType('hotel');
          } else if (location.pathname.includes('/shortlet')) {
            setBookingType('shortlet');
          } else if (location.pathname.includes('/restaurant')) {
            setBookingType('restaurant');
          } else if (location.pathname.includes('/event')) {
            setBookingType('event');
          } else if (location.pathname.includes('/service') || location.pathname.includes('/services')) {
            setBookingType('service');
          } else {
            console.log("⚠️ Defaulting to hotel booking");
            setBookingType('hotel'); // Default fallback
          }
        }
        
        console.log("🎯 Final booking type:", bookingType);
      } else {
        // No data found, redirect to home
        console.warn("No vendor data found for booking");
        navigate('/');
      }
      
      setLoading(false);
    };
    
    loadVendorData();
  }, [location.state, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No booking data found</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Pass vendorData as prop to the appropriate component
  console.log("🎯 Rendering booking type:", bookingType);
  console.log("📦 Vendor data:", vendorData);
  
  // Set page title based on booking type
  const pageTitles = {
    'hotel': 'Complete Your Hotel Booking - Ajani',
    'shortlet': 'Book Shortlet - Ajani', 
    'restaurant': 'Book Restaurant - Ajani',
    'event': 'Book Event Venue - Ajani',
    'service': 'Book Service - Ajani'
  };
  
  document.title = pageTitles[bookingType] || 'Complete Booking - Ajani';

  // UPDATED switch statement
  switch(bookingType) {
    case 'hotel':
      return <HotelBooking vendorData={vendorData} />;
    case 'restaurant':
      return <RestaurantBooking vendorData={vendorData} />;
    case 'shortlet':
      return <ShortletBooking vendorData={vendorData} />;
    case 'event':
      return <EventBooking vendorData={vendorData} />;
    case 'service':
      return <ServiceBooking vendorData={vendorData} />;
    default:
      console.warn(`⚠️ Unknown booking type: ${bookingType}, defaulting to hotel`);
      return <HotelBooking vendorData={vendorData} />;
  }
};

export default BookingRouter;