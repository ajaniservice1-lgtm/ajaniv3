// src/components/PaymentOptions.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faBuilding, faCheckCircle, faUniversity } from '@fortawesome/free-solid-svg-icons';

const PaymentOptions = ({ onPaymentSelect, selectedPayment }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: faCreditCard,
      description: 'Pay securely with your card',
      popular: true
    },
    {
      id: 'hotel',
      name: 'Pay at Hotel',
      icon: faBuilding,
      description: 'Pay when you check in',
      popular: false
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: faUniversity,
      description: 'Transfer directly to our account',
      popular: false
    }
  ];

  const handleCardInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Choose your payment option</h3>
        
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => onPaymentSelect(method.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedPayment === method.id
                  ? 'border-[#06EAFC] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedPayment === method.id ? 'bg-[#06EAFC]' : 'bg-gray-100'
                  }`}>
                    <FontAwesomeIcon 
                      icon={method.icon} 
                      className={selectedPayment === method.id ? 'text-white' : 'text-gray-600'}
                    />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{method.name}</span>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {method.popular && (
                    <span className="text-xs font-medium text-[#06EAFC] bg-blue-100 px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === method.id
                      ? 'border-[#06EAFC] bg-[#06EAFC]'
                      : 'border-gray-300'
                  }`}>
                    {selectedPayment === method.id && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Details Form */}
      {selectedPayment === 'card' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Card Details</h4>
          
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm opacity-80 mb-2">Card Number</p>
                  <p className="text-xl font-mono tracking-wider">
                    {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-8 bg-white/20 rounded mb-1"></div>
                  <p className="text-xs opacity-80">VISA</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80 mb-1">Card Holder</p>
                  <p className="font-medium">
                    {cardDetails.cardHolder || 'YOUR NAME'}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Expires</p>
                  <p className="font-medium">
                    {cardDetails.expiryDate || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    handleCardInputChange({ 
                      target: { 
                        name: 'cardNumber', 
                        value: formatted,
                        type: 'text'
                      } 
                    });
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleCardInputChange}
                  placeholder="John Adesoye"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      handleCardInputChange({ 
                        target: { 
                          name: 'expiryDate', 
                          value: formatted,
                          type: 'text'
                        } 
                      });
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                      handleCardInputChange({ 
                        target: { 
                          name: 'cvv', 
                          value: value,
                          type: 'text'
                        } 
                      });
                    }}
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveCard"
                  name="saveCard"
                  checked={cardDetails.saveCard}
                  onChange={handleCardInputChange}
                  className="w-4 h-4 text-[#06EAFC] rounded focus:ring-[#06EAFC]"
                />
                <label htmlFor="saveCard" className="text-sm text-gray-700">
                  Save this card for future payments
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay at Hotel Instructions */}
      {selectedPayment === 'hotel' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Pay at Hotel Instructions</h4>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Your room will be held for you until check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>You can pay with cash or card at the hotel reception</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Free cancellation up to 24 hours before check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>You'll receive an email confirmation with hotel contact details</span>
            </li>
          </ul>
        </div>
      )}

      {/* Bank Transfer Instructions */}
      {selectedPayment === 'bank-transfer' && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Instructions</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-700 mb-2">Bank Details:</p>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-medium">Ajani Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium">Ajani Hotels Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sort Code:</span>
                  <span className="font-medium">04-00-04</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Please use your booking reference as the payment reference. Send proof of payment to payments@ajani.com.
            </p>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-sm">🔒</span>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-1">Secure Payment</p>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;