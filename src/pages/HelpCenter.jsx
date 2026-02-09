import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaEnvelope, FaWhatsapp, FaInfoCircle, FaHeadset, FaFileContract, FaShieldAlt, FaChevronRight } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      q: "How does Ajani work?",
      a: "Ajani is your AI guide to Ibadan. Just ask me anything about prices, places, or recommendations on WhatsApp, and I'll provide personalized answers based on verified data from our community.",
    },
    {
      q: "Are the prices verified?",
      a: 'Yes! Ajani\'s team verifies prices regularly. We show a "Last verified" date for each recommendation and highlight recently updated information to ensure accuracy.',
    },
    {
      q: "How often is data updated?",
      a: "Our database updates in real-time as vendors and our team submit new information. Community contributions are reviewed daily to ensure accuracy.",
    },
    {
      q: "Is Ajani free to use?",
      a: "Yes! Ajani is completely free for users. Businesses pay only for featured listings and advertising space, which helps us maintain and improve the service.",
    },
    {
      q: "How can I list my business on Ajani?",
      a: 'You can submit your business information through our "For Business Owners" form. Ajani will learn about your business and recommend you to relevant customers automatically.',
    },
    {
      q: "How can I report incorrect information?",
      a: "Use the WhatsApp chat to report any issues. We appreciate community feedback to keep Ajani accurate and helpful for everyone.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-manrope">
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow pt-20">
        {/* Back Button (Desktop) */}
        <div className="hidden lg:block absolute left-0 top-24 p-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors group"
            aria-label="Go back"
          >
            <FaArrowLeft 
              size={20} 
              className="group-hover:-translate-x-0.5 transition-transform" 
            />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">Help Center</h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
              Find answers to common questions about using Ajani
            </p>
          </div>

          {/* FAQ Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm md:text-base">
              Everything you need to know about using Ajani
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full px-5 py-4 md:px-6 md:py-5 text-left flex justify-between items-center focus:outline-none hover:bg-slate-50 transition-colors duration-200"
                  aria-expanded={openIndex === i}
                >
                  <h3 className="font-semibold text-slate-900 pr-4 text-base md:text-lg">{faq.q}</h3>
                  {openIndex === i ? (
                    <FaChevronUp className="text-slate-500 flex-shrink-0 text-lg" />
                  ) : (
                    <FaChevronDown className="text-slate-500 flex-shrink-0 text-lg" />
                  )}
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-4 md:pb-5">
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Additional Help Center Content */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Contact Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Still Need Help?</h3>
              <p className="text-slate-600 mb-6 text-sm md:text-base">
                Can't find the answer you're looking for? Our support team is here to help you.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <FaEnvelope className="text-cyan-500 text-lg" />
                  <div>
                    <p className="font-medium text-slate-900">Email Us</p>
                    <p className="text-slate-600 text-sm">info@ajani.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <FaWhatsapp className="text-cyan-500 text-lg" />
                  <div>
                    <p className="font-medium text-slate-900">WhatsApp</p>
                    <p className="text-slate-600 text-sm">+234 802 266 2256</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resources Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Helpful Resources</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/about")}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <FaInfoCircle className="text-cyan-500" />
                    <span className="font-medium text-slate-900">About Ajani</span>
                  </div>
                  <FaChevronRight className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/contact-us")}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <FaHeadset className="text-cyan-500" />
                    <span className="font-medium text-slate-900">Contact Support</span>
                  </div>
                  <FaChevronRight className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/termspage")}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <FaFileContract className="text-cyan-500" />
                    <span className="font-medium text-slate-900">Terms of Service</span>
                  </div>
                  <FaChevronRight className="text-slate-400" />
                </button>
                <button
                  onClick={() => navigate("/privacypage")}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <FaShieldAlt className="text-cyan-500" />
                    <span className="font-medium text-slate-900">Privacy Policy</span>
                  </div>
                  <FaChevronRight className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenterPage;