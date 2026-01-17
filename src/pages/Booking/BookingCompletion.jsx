// src/pages/Booking/BookingCompletion.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import { CheckCircle, Mail, Phone, Home, FileText, Share2, Calendar, Users, CreditCard } from "lucide-react";

const BookingCompletion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingReference, setBookingReference] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeBookingData = () => {
      setIsLoading(true);
      
      try {
        // Try to get data from location state first
        if (location.state?.bookingData) {
          setBookingData(location.state.bookingData);
        }
        
        // Try to get data from localStorage as fallback
        const savedBookingData = localStorage.getItem('bookingData');
        if (savedBookingData && !location.state?.bookingData) {
          setBookingData(JSON.parse(savedBookingData));
        }
        
        // Try to get data from sessionStorage as another fallback
        const sessionBookingData = sessionStorage.getItem('currentBooking');
        if (sessionBookingData && !location.state?.bookingData && !savedBookingData) {
          setBookingData(JSON.parse(sessionBookingData));
        }
        
        // Generate booking reference
        const generateReference = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let result = 'AJN-';
          for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        
        const reference = generateReference();
        setBookingReference(reference);
        
        // Store reference in localStorage for future reference
        localStorage.setItem('lastBookingReference', reference);
        
        // Clear booking data from localStorage after successful completion
        setTimeout(() => {
          localStorage.removeItem('bookingData');
          sessionStorage.removeItem('currentBooking');
        }, 5000);
        
      } catch (error) {
        console.error('Error initializing booking data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeBookingData();
  }, [location.state]);

  const handleShare = async () => {
    const shareText = `I just booked with Ajani! 🎉\nBooking Reference: ${bookingReference}\nVendor: ${bookingData?.vendorName || 'Your Booking'}\nDate: ${bookingData?.date || 'N/A'}\nThank you for using Ajani!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Ajani Booking Confirmation',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to clipboard
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    navigator.clipboard.writeText(text);
    alert('Booking details copied to clipboard! 📋');
  };

  const handleDownloadReceipt = () => {
    // Create a simple receipt content
    const receiptContent = `
Ajani Booking Receipt
=====================

Booking Reference: ${bookingReference}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Booking Details:
----------------
Vendor: ${bookingData?.vendorName || 'N/A'}
Service Type: ${bookingData?.serviceType || 'N/A'}
Date: ${bookingData?.date || 'N/A'}
Guests: ${bookingData?.guests || 'N/A'}
Total Amount: ₦${bookingData?.totalAmount?.toLocaleString() || '0'}

Guest Information:
------------------
Name: ${bookingData?.firstName || 'N/A'} ${bookingData?.lastName || ''}
Email: ${bookingData?.email || 'N/A'}
Phone: ${bookingData?.phone || 'N/A'}

Thank you for booking with Ajani!
We'll contact you shortly with confirmation.

Contact Support:
Email: support@ajani.com
Phone: +234 800 123 4567
    `;

    // Create and trigger download
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ajani-Booking-${bookingReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Stepper - Only show if we have booking data */}
        {bookingData && (
          <div className="mb-8">
            <Stepper 
              currentStep={3} 
              steps={[
                { number: 1, label: 'Details' },
                { number: 2, label: 'Payment' },
                { number: 3, label: 'Confirmation' }
              ]}
            />
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Thank you for booking with Ajani! 🎉
            </h1>
            <p className="text-gray-600">
              Your booking request has been successfully submitted.
            </p>
          </div>

          {/* Booking Status Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Booking Processing
                </h3>
                <p className="text-blue-800 mb-3">
                  <span className="font-semibold">Ajani</span> is now checking availability with{' '}
                  <span className="font-semibold">{bookingData?.vendorName || 'the vendor'}</span> for your selected date and details.
                </p>
                <p className="text-blue-800">
                  Once availability is confirmed, we'll notify you via phone call, SMS, or WhatsApp with the next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Booking Details</h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                Pending Confirmation
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Booking Reference</span>
                <span className="font-mono font-bold text-emerald-600 text-lg">{bookingReference}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Service Type</span>
                </div>
                <span className="font-medium">{bookingData?.serviceType || 'Hotel'}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>Vendor</span>
                </div>
                <span className="font-medium">{bookingData?.vendorName || 'N/A'}</span>
              </div>
              
              {bookingData?.date && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Booking Date</span>
                  </div>
                  <span className="font-medium">{formatDate(bookingData.date)}</span>
                </div>
              )}
              
              {bookingData?.guests && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Number of Guests</span>
                  </div>
                  <span className="font-medium">{bookingData.guests}</span>
                </div>
              )}
              
              {bookingData?.totalAmount && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Total Amount</span>
                  </div>
                  <span className="font-medium text-emerald-600">
                    ₦{bookingData.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Lead Guest</span>
                <span className="font-medium">
                  {bookingData ? `${bookingData.firstName || ''} ${bookingData.lastName || ''}`.trim() : 'Guest'}
                </span>
              </div>
              
              {bookingData?.email && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Contact Email</span>
                  <span className="font-medium">{bookingData.email}</span>
                </div>
              )}
              
              {bookingData?.phone && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Contact Phone</span>
                  <span className="font-medium">{bookingData.phone}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Estimated Response Time</span>
                <span className="font-medium text-emerald-600">Within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Share2 className="w-5 h-5" />
              Share Booking Details
            </button>
            
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <FileText className="w-5 h-5" />
              Download Receipt
            </button>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <h4 className="font-semibold text-amber-800 mb-2">Important Information:</h4>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• This is a booking request, not a confirmed reservation</li>
              <li>• You will receive confirmation from the vendor within 24 hours</li>
              <li>• Keep your booking reference ({bookingReference}) for any inquiries</li>
              <li>• Contact support if you don't hear back within 24 hours</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Link>
            
            {bookingData?.serviceType && (
              <Link
                to={`/category/${bookingData.serviceType.toLowerCase()}`}
                className="flex items-center justify-center px-6 py-4 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors duration-200 font-medium"
              >
                Browse More {bookingData.serviceType}
              </Link>
            )}
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <h4 className="font-medium text-gray-900 mb-4">Need immediate assistance?</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="mailto:support@ajani.com"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@ajani.com
              </a>
              <span className="text-gray-400 hidden sm:block">|</span>
              <a
                href="tel:+2348001234567"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +234 800 123 4567
              </a>
              <span className="text-gray-400 hidden sm:block">|</span>
              <a
                href="https://wa.me/2348001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                </svg>
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCompletion;