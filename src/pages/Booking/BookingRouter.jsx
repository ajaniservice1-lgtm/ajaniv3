// Update BookingRouter.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HotelBooking from "./HotelBooking";
import RestaurantBooking from "./RestaurantBooking";
import ShortletBooking from "./ShortletBooking";

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
        
        if (category.includes('restaurant') || category.includes('food') || category.includes('cafe')) {
          setBookingType('restaurant');
        } else if (category.includes('shortlet') || category.includes('apartment') || category.includes('rental') || category.includes('apartments')) {
          setBookingType('shortlet');
        } else if (category.includes('hotel') || category.includes('resort') || category.includes('lodging') || category.includes('hotels')) {
          setBookingType('hotel');
        } else {
          // Default based on URL or other indicators
          if (location.pathname.includes('/hotel')) {
            setBookingType('hotel');
          } else if (location.pathname.includes('/shortlet')) {
            setBookingType('shortlet');
          } else if (location.pathname.includes('/restaurant')) {
            setBookingType('restaurant');
          } else {
            setBookingType('hotel'); // Default fallback
          }
        }
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
  
  // Set page title based on booking type
  document.title = bookingType === 'hotel' 
    ? 'Complete Your Hotel Booking - Ajani' 
    : bookingType === 'shortlet' 
      ? 'Book Shortlet - Ajani' 
      : 'Book Restaurant - Ajani';

  switch(bookingType) {
    case 'hotel':
      return <HotelBooking vendorData={vendorData} />;
    case 'restaurant':
      return <RestaurantBooking vendorData={vendorData} />;
    case 'shortlet':
      return <ShortletBooking vendorData={vendorData} />;
    default:
      return <HotelBooking vendorData={vendorData} />;
  }
};

export default BookingRouter;