// components/ComingSoonModal.jsx
import { useState, useEffect } from "react";
import { IoRocket, IoClose, IoChatbubble, IoCompass, IoTime } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

const ComingSoonModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Show modal after 5 seconds, only once
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasBeenShown) {
        setIsVisible(true);
        setHasBeenShown(true);
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    document.body.style.height = 'auto';
    
    // Store in localStorage to prevent showing again
    localStorage.setItem('comingSoonModalShown', 'true');
  };

  // Check localStorage on mount
  useEffect(() => {
    const wasShown = localStorage.getItem('comingSoonModalShown');
    if (wasShown === 'true') {
      setHasBeenShown(true);
    }
  }, []);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay that locks the screen */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div 
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with your brand color */}
              <div className="sticky top-0 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <IoRocket className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">🚀 COMING SOON</h1>
                    <p className="text-sm text-white/90">Ajani AI Assistant</p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="text-white/90 hover:text-white p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <IoClose className="text-2xl" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Hero Section */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-[#06EAFC] to-[#06F49F] bg-clip-text text-transparent">
                      Discover Ibadan with AI
                    </span>
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Our AI assistant is launching soon to revolutionize how you explore Ibadan!
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-100 rounded-xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#06EAFC] to-[#00D1FF] flex items-center justify-center">
                      <IoChatbubble className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Smart Chat</h3>
                    <p className="text-sm text-gray-600">
                      Instant answers about places, prices & vendors
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#06F49F] to-[#00E6A0] flex items-center justify-center">
                      <IoCompass className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Local Guide</h3>
                    <p className="text-sm text-gray-600">
                      Real-time info about businesses & events
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 rounded-xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#06EAFC] to-[#06F49F] flex items-center justify-center">
                      <IoTime className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">24/7 Support</h3>
                    <p className="text-sm text-gray-600">
                      Always available to help you navigate
                    </p>
                  </div>
                </div>

                {/* Launch Timeline */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#06EAFC] animate-pulse"></div>
                    <div className="text-sm font-semibold text-[#06EAFC]">LAUNCH TIMELINE</div>
                    <div className="w-3 h-3 rounded-full bg-[#06EAFC] animate-pulse"></div>
                  </div>
                  
                  <div className="relative">
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                      <div 
                        className="h-full bg-gradient-to-r from-[#06EAFC] to-[#06F49F] rounded-full"
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    
                    {/* Progress markers */}
                    <div className="flex justify-between text-xs text-gray-600">
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-[#06EAFC] mx-auto mb-1"></div>
                        <div>Planning</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-[#06EAFC] mx-auto mb-1"></div>
                        <div>Development</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mx-auto mb-1"></div>
                        <div>Testing</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mx-auto mb-1"></div>
                        <div>Launch</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Launch Info Card */}
                <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 border-2 border-cyan-200 rounded-xl p-6 mb-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                      <IoRocket className="animate-bounce" />
                      LAUNCHING SOON
                    </div>
                    <p className="text-gray-700 mb-4">
                      We're building the ultimate Ibadan assistant. Get ready for a smarter way to explore!
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-cyan-100">
                        <p className="text-xs text-gray-500 uppercase">Current Status</p>
                        <p className="text-lg font-bold text-[#06EAFC]">Development</p>
                      </div>
                      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-cyan-100">
                        <p className="text-xs text-gray-500 uppercase">ETA Launch</p>
                        <p className="text-lg font-bold text-[#06EAFC]">Q1 2024</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-4">
                  <button
                    onClick={handleClose}
                    className="w-full py-4 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white text-lg font-bold rounded-xl hover:from-[#05D9EB] hover:to-[#05E090] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    🚀 I Can't Wait!
                  </button>
                  
                  <div className="text-center">
                    <button
                      onClick={handleClose}
                      className="text-[#06EAFC] hover:text-[#05D9EB] font-medium text-sm hover:underline"
                    >
                      ✨ Notify me when it's live
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Powered by <span className="font-bold text-[#06EAFC]">Ajani Smart Guide</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Your trusted guide to discovering the best of Ibadan
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;