// src/pages/Booking/BookingRouter.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HotelBooking from "./HotelBooking";
import RestaurantBooking from "./RestaurantBooking";
import ShortletBooking from "./ShortletBooking";
import BookingPage from "./BookingPage"; // Your existing hotel booking page

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
      
      let data = null;
      if (dataFromState) {
        data = dataFromState;
      } else if (fromLocalStorage) {
        data = JSON.parse(fromLocalStorage);
      } else {
        // Try from session storage as fallback
        const sessionData = sessionStorage.getItem('currentVendorBooking');
        if (sessionData) {
          data = JSON.parse(sessionData);
        }
      }
      
      if (data) {
        setVendorData(data);
        
        // Determine booking type
        const category = data.category?.toLowerCase() || data.bookingType?.toLowerCase() || "";
        
        if (category.includes('restaurant') || category.includes('food') || category.includes('cafe')) {
          setBookingType('restaurant');
        } else if (category.includes('shortlet') || category.includes('apartment') || category.includes('rental')) {
          setBookingType('shortlet');
        } else if (category.includes('hotel') || category.includes('resort') || category.includes('lodging')) {
          setBookingType('hotel');
        } else {
          // Default to restaurant for unknown categories
          setBookingType('restaurant');
        }
      }
      
      setLoading(false);
    };
    
    loadVendorData();
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!vendorData) {
    navigate('/');
    return null;
  }

  // Render appropriate booking component based on type
  switch(bookingType) {
    case 'hotel':
      return <BookingPage vendorData={vendorData} />;
    case 'restaurant':
      return <RestaurantBooking vendorData={vendorData} />;
    case 'shortlet':
      return <ShortletBooking vendorData={vendorData} />;
    default:
      return <RestaurantBooking vendorData={vendorData} />;
  }
};

export default BookingRouter;