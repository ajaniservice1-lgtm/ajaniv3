// ReviewSection.jsx - With dynamic messages for each category
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faQuoteLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

// Ibadan-specific names
const generateReviews = (vendorName, category) => {
  const ibadanNames = [
    { id: 1, name: "Tunde Adeyemi", color: "bg-blue-100", text: "text-blue-600" },
    { id: 2, name: "Bisi Ogunleye", color: "bg-green-100", text: "text-green-600" },
    { id: 3, name: "Chukwuemeka Nwosu", color: "bg-purple-100", text: "text-purple-600" },
    { id: 4, name: "Adebisi Ajayi", color: "bg-yellow-100", text: "text-yellow-600" }
  ];

  // Dynamic messages for each category - concise but meaningful
  const getCategoryContent = (category, vendorName) => {
    const categories = {
      hotel: [
        `My stay at ${vendorName} was exceptional. The rooms were spotless, and the view of Cocoa House was breathtaking. Perfect location near University of Ibadan.`,
        `From my business in Mokola Market, I appreciate value. ${vendorName} exceeded expectations. The pool was refreshing, and staff were incredibly helpful.`,
        `Working at UCH Challenge, I need reliable accommodation. ${vendorName} delivered. Quiet, clean, and the security gave me peace of mind.`,
        `As a frequent visitor to Ring Road, ${vendorName} is my go-to. The conference facilities are excellent for meetings. Highly recommended.`
      ],
      restaurant: [
        `The best amala I've had in Ibadan! ${vendorName}'s ewedu and gbegiri tasted just like home. The live Fuji music made it perfect.`,
        `As someone who knows good food, ${vendorName}'s ofada rice is legendary. Fresh palm wine and authentic Ibadan atmosphere. Will return!`,
        `Perfect for business lunches near Cocoa House. The service at ${vendorName} maintains that Ibadan warmth while being professional.`,
        `From Sango, worth every minute of the drive. ${vendorName}'s goat meat pepper soup warmed my soul. Authentic Ibadan dining experience.`
      ],
      event: [
        `Our wedding at ${vendorName} was magical. The adire patterns in the decoration were stunning. Sound system handled both Fuji and modern music perfectly.`,
        `Corporate AGM went smoothly thanks to ${vendorName}. Accessible from all parts of Ibadan, and the generator backup was reliable throughout.`,
        `Community meeting from Challenge area was successful at ${vendorName}. Spacious hall and the AC was a blessing in Ibadan's heat.`,
        `As an event planner, ${vendorName} understands Ibadan events. Coordinated with local vendors seamlessly. Ample parking for guests.`
      ],
      shortlet: [
        `Perfect accommodation for visiting UI professors. ${vendorName}'s Bodija apartment had everything needed. Reliable power and fast WiFi.`,
        `Great for business suppliers visiting Mokola. ${vendorName} provides clean, modern apartments at reasonable Ibadan prices. Very accessible.`,
        `Recommended ${vendorName} to UCH patients' families. Apartments are hygienic and the security makes families feel safe in Ibadan.`,
        `Living in Agodi GRA, ${vendorName} stands out. Proper cooking facilities for traditional soups and reliable internet for remote work.`
      ],
      service: [
        `${vendorName} did excellent work on our Bodija home renovation. Team arrived early, sourced quality materials from Challenge market.`,
        `Efficient security installation from ${vendorName}. They understood Ibadan's specific needs and provided responsive after-service support.`,
        `Professional maintenance service at UCH Challenge. ${vendorName} was punctual, reasonably priced, and technicians were knowledgeable.`,
        `Home repairs near Cocoa House done right by ${vendorName}. They understood Ibadan's climate challenges and used quality local materials.`
      ]
    };

    return categories[category] || [
      `Excellent service from ${vendorName}. Professional, timely, and exceeded expectations in Ibadan.`,
      `Reliable service from ${vendorName}. Showed up on time and delivered excellent results.`,
      `${vendorName} exceeded expectations. They understand Ibadan's specific needs perfectly.`,
      `Professional service with local knowledge from ${vendorName}. Good value for Ibadan residents.`
    ];
  };

  const reviewContents = getCategoryContent(category, vendorName);

  return ibadanNames.map((review, index) => ({
    ...review,
    content: reviewContents[index] || reviewContents[0],
    initials: review.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    rating: 5,
    date: ["Last week", "2 weeks ago", "3 days ago", "1 month ago"][index],
    verified: true
  }));
};

const ReviewCard = ({ review, vendorName, category }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:border-[#06EAFC] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${review.color} flex items-center justify-center`}>
            <span className={`font-bold ${review.text} text-sm md:text-base`}>
              {review.initials}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm md:text-base">{review.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className="text-green-500 text-xs" 
                title="Verified"
              />
              <span className="text-gray-500 text-xs">Verified</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                className="text-xs md:text-sm text-black"
              />
            ))}
          </div>
          <p className="text-gray-500 text-xs">{review.date}</p>
        </div>
      </div>

      <div className="relative">
        <FontAwesomeIcon 
          icon={faQuoteLeft} 
          className="text-black text-lg absolute -top-2 -left-1" 
        />
        <p className={`text-gray-700 text-[12px] md:text-[14.5px] leading-relaxed pl-4 ${
          !expanded && 'line-clamp-3'
        }`}>
          {review.content}
        </p>
       
      </div>
    </motion.div>
  );
};

const ReviewSection = ({ vendorName = "Vendor", category = "service", reviewsCount = 127 }) => {
  const reviews = generateReviews(vendorName, category);
  const averageRating = 4.9;

  return (
    <section className="w-full px-2.5 md:px-4 py-6 md:py-8">
      <div className="max-w-[1245px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-manrope mb-2">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faStar} className="text-black text-lg" />
                  <span className="ml-1 font-bold text-gray-900 text-lg">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">·</span>
                <span className="text-gray-600">{reviewsCount} reviews</span>
              </div>
            </div>
          </div>
          
       
        </div>

        {/* Simple Rating Summary */}
        <div className="bg-gray-50 rounded-xl p-4 md:p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-sm text-black"
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-1">Overall Rating</p>
            </div>
            
            {['Cleanliness', 'Service', 'Location', 'Value'].map((item) => (
              <div key={item} className="text-center">
                <div className="text-xl font-bold text-gray-900">4.9</div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="text-xs text-black"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              vendorName={vendorName}
              category={category}
            />
          ))}
        </div>

       
      </div>
    </section>
  );
};

export default ReviewSection;