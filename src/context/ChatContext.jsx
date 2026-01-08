// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidget from "../components/ChatWidget";
import { useModal } from "./ModalContext";
import { CiChat1 } from "react-icons/ci";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAnyModalOpen } = useModal();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  useEffect(() => {
    if (isAnyModalOpen && isChatOpen) {
      closeChat();
    }
  }, [isAnyModalOpen, isChatOpen]);

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}

      <AnimatePresence>
        {!isChatOpen && !isAnyModalOpen && (
          <motion.button
            key="global-chat-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={openChat}
          >
          </motion.button>
        )}
      </AnimatePresence>

      <ChatWidget isOpen={isChatOpen} onClose={closeChat} />
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};