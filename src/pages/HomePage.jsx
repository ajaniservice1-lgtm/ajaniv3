// src/pages/HomePage.jsx
import LocalBusinessSchema from "../components/LocalBusinessSchema";
import Header from "../components/Header";
import Hero from "../components/Hero";
import AiTopPicks from "../components/AiTopPicks";
import Directory from "../components/Directory";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { useState } from "react";
import Meta from "../components/Meta";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function HomePage() {
  const [toastMessage, setToastMessage] = useState("");

  // This function will be called on login OR logout
  const showAuthToast = (message) => {
    setToastMessage(message);
  };
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const closeToast = () => {
    setToastMessage("");
  };

  return (
    <section className="relative">
      <div>
        <Meta
          title=" Home | Ajani Directory | Ajani.ai | Find Hotels | Vendors | Events & Prices in Ibadan"
          description="Discover top-rated local businesses near you."
          url="https://ajani.ai/"
          image="https://ajani.ai/images/home-og.jpg"
        />
      </div>
      <LocalBusinessSchema />
      <ChatWidget />
      <Header  />
      <Hero />
      <Directory />
      <AiTopPicks />
      <Footer />
    </section>
  );
}
