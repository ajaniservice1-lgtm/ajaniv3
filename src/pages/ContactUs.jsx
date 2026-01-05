import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import axiosInstance from '../lib/axios';
import Header from "../components/Header"
import Footer from "../components/Footer"

// Import Manrope font - You'll need to add this to your global CSS too
import '@fontsource/manrope';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';

// Toast Notification Component
const ToastNotification = ({ message, type = "success", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-50 border-green-200" : 
                  "bg-red-50 border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'animate-slideInRight' : 'animate-slideOutRight'
    }`}>
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className={iconColor}>
            {type === "success" ? <FaCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${textColor}`}>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`${iconColor} hover:opacity-70 transition-opacity`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', type: 'success' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Fix page to always start at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form validation schema
  const schema = yup.object().shape({
    product: yup.string().required('Please select a product'),
    firstName: yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: yup.string()
      .email('Enter a valid email address')
      .required('Email is required'),
    phone: yup.string()
      .required('Phone number is required')
      .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Enter a valid phone number'),
    company: yup.string(),
    message: yup.string()
      .required('Message is required')
      .min(10, 'Message must be at least 10 characters')
      .max(500, 'Message cannot exceed 500 characters'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
  });

  const showNotification = (message, type = 'success') => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Check terms acceptance
      if (!acceptedTerms) {
        showNotification('Please accept the terms and conditions', 'error');
        setIsSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = {
        ...data,
        submittedAt: new Date().toISOString(),
      };

      console.log('Sending contact form:', payload);

      // Send to backend API
      const response = await axiosInstance.post('/contact', payload);

      if (response.data.success) {
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        reset();
        setAcceptedTerms(false);
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showNotification(
        error.response?.data?.message || 
        'Failed to send message. Please try again later.', 
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const products = [
    { value: 'orders', label: 'Orders' },
    { value: 'account', label: 'Account & Billing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-manrope">
      {/* Header - Outside the main content container */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
          <ToastNotification
            message={toastConfig.message}
            type={toastConfig.type}
            onClose={() => setShowToast(false)}
          />
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 mt-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Contact us using the information below. We'll respond promptly to your inquiries and feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Information & Illustration */}
            <div className="space-y-8">
              {/* Illustration Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's talk about everything!
                  </h2>
                  <p className="text-gray-600">
                    Have questions about our platform? Want to become a vendor? 
                    We're here to help you succeed.
                  </p>
                </div>

                {/* Illustration Placeholder - Replace with actual illustration */}
                <div className="relative h-64 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-xl font-semibold">We're Here to Help!</p>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaPhone className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Direct Support</h4>
                      <p className="text-gray-600 text-sm">
                        Get quick assistance by calling our support line during business hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FaEnvelope className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Response</h4>
                      <p className="text-gray-600 text-sm">
                        Expect a response within 24 hours for email inquiries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Office Location</h4>
                      <p className="text-gray-600 text-sm">
                        Visit our office for face-to-face consultations and meetings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Before You Contact Us</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Check Documentation</h4>
                    <p className="text-blue-700 text-sm">
                      If you haven't found what you're looking for, please check our comprehensive documentation page for answers to common questions.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Live Support</h4>
                    <p className="text-green-700 text-sm">
                      If you can't find what you need, connect to live support for quick assistance during business hours.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Required Information</h4>
                    <p className="text-yellow-700 text-sm">
                      Please select the product, enter your first and last name, and provide your email and phone number before submitting your message.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Send us your message now!
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select which Product *
                  </label>
                  <select
                    {...register('product')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.product ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                  {errors.product && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle size={12} />
                      {errors.product.message}
                    </p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      placeholder="First name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaExclamationTriangle size={12} />
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      placeholder="Last name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaExclamationTriangle size={12} />
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@company.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle size={12} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+234 801 234 5678"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle size={12} />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Company (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    placeholder="Your company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows="5"
                    placeholder="Please describe your inquiry or feedback in detail..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle size={12} />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="/termspage" className="text-blue-600 hover:text-blue-800 font-medium underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacypage" className="text-blue-600 hover:text-blue-800 font-medium underline">
                        Privacy Policy
                      </a>. I understand that my information will be used to process my inquiry and may be stored for customer service purposes.
                    </label>
                  </div>
                  {!acceptedTerms && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <FaExclamationTriangle size={12} />
                      You must accept the terms and conditions to send your message
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !acceptedTerms}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaPhone className="mx-auto text-blue-600 text-2xl mb-3" />
                    <h4 className="font-semibold text-gray-900">Call Us</h4>
                    <p className="text-gray-600 text-sm mt-1">+234 802 266 2256</p>
                    <p className="text-gray-500 text-xs mt-1">Mon-Fri, 9AM-5PM</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaEnvelope className="mx-auto text-green-600 text-2xl mb-3" />
                    <h4 className="font-semibold text-gray-900">Email Us</h4>
                    <p className="text-gray-600 text-sm mt-1">info@ajani.com</p>
                    <p className="text-gray-500 text-xs mt-1">Response within 24h</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="mx-auto text-purple-600 text-2xl mb-3" />
                    <h4 className="font-semibold text-gray-900">Visit Us</h4>
                    <p className="text-gray-600 text-sm mt-1">7 Oluyoro St, off Awolowo Avenue, Old Bodija, Lagelu 000234, Oyo</p>
                    <p className="text-gray-500 text-xs mt-1">By appointment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer - Outside the main content container */}
      <Footer />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-in forwards;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactUs;