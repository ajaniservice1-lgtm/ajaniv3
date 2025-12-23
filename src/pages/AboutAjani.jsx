import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Meta from "../components/Meta";

import FounderImg from "../assets/Logos/IMG_9395.jpeg";
import WhoWeAreImg from "../assets/Logos/images.jpg";

import {
  FaBullseye,
  FaEye,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaThLarge,
  FaCalendarCheck,
  FaQuoteLeft,
} from "react-icons/fa";

const AboutAjani = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO */}
      <Meta
        title="About Ajani | Trusted Local Services in Nigeria"
        description="Learn more about Ajani — a local discovery and booking platform built for trust, transparency, and local impact."
      />

      <Header />

      <main className="bg-white font-manrope">
        {/* ================= HERO ================= */}
        <section className="bg-[#D9FBF4] min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full grid lg:grid-cols-2 gap-10 items-center">
            {/* TEXT */}
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold md:mt-0 mt-20">
                Built for Locals.
              </h1>
              <h2 className="text-3xl lg:text-5xl font-bold mt-2">
                Designed for Trust.
              </h2>
              <h3 className="text-3xl lg:text-5xl font-bold mt-2">
                Powered by Ajani.
              </h3>

              <p className="mt-6 max-w-xl text-gray-700 lg:text-lg">
                Ajani helps people across Oyo State discover, compare, and book
                trusted local services — from hotels and restaurants to event
                centers and everyday service providers.
              </p>

              <div className="mt-8 flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Explore Service
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
                  List Your Business
                </button>
              </div>
            </div>

            {/* IMAGE */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg h-[460px] rounded-xl overflow-hidden shadow-lg">
                <img
                  src={FounderImg}
                  alt="Ajani Founder"
                  className="w-full h-full object-cover object-[center_15%]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHO WE ARE ================= */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Who We Are
              </h2>

              <p className="text-gray-700 mb-4">
                Ajani is a local discovery and booking platform built to
                simplify how people find reliable services around them.
              </p>

              <p className="text-gray-700 mb-4">
                We noticed a common problem: people rely on word-of-mouth,
                scattered social media posts, or outdated listings when
                searching for hotels, restaurants, event halls, and local
                service providers.
              </p>

              <p className="text-gray-700">
                Ajani brings everything into one trusted place — verified
                listings, clear information, and easy booking — all designed
                with local realities in mind.
              </p>
            </div>

            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden h-[320px] lg:h-full">
              <img
                src={WhoWeAreImg}
                alt="Who We Are"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ================= MISSION & VISION ================= */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-[#EEF4FF] rounded-xl p-8 text-center">
              <FaBullseye className="text-4xl text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Our Mission</h4>
              <p className="text-gray-700 text-sm">
                To make discovering and booking trusted local services simple,
                transparent, and stress-free across Oyo State.
              </p>
            </div>

            <div className="bg-[#EEF4FF] rounded-xl p-8 text-center">
              <FaEye className="text-4xl text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Our Vision</h4>
              <p className="text-gray-700 text-sm">
                To become the most trusted local services platform in South-West
                Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* ================= WHAT MAKES AJANI DIFFERENT ================= */}
        <section className="bg-[#F5FFFD] py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              What Makes Ajani Different
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Feature
                icon={<FaMapMarkedAlt />}
                title="Local-First"
                text="Built specifically for Oyo State and its communities."
              />
              <Feature
                icon={<FaCheckCircle />}
                title="Verified Listings"
                text="Real businesses with real locations."
              />
              <Feature
                icon={<FaThLarge />}
                title="Multiple Categories"
                text="Hotels, restaurants, events, and services."
              />
              <Feature
                icon={<FaCalendarCheck />}
                title="Flexible Booking"
                text="Pay online or at the venue."
              />
            </div>

            {/* FOUNDER */}
            <div className="mt-16 bg-[#D9FBF4] rounded-2xl p-8 flex flex-col lg:flex-row gap-6 items-center">
              <img
                src={FounderImg}
                alt="Ladele Ajao"
                className="w-24 h-24 rounded-full object-cover"
              />

              <div>
                <FaQuoteLeft className="text-blue-600 text-2xl mb-3" />
                <p className="text-gray-700 max-w-3xl mb-4">
                  Ajani was created from personal frustration — finding reliable
                  services shouldn’t be hard. Ajani exists to bring trust,
                  clarity, and opportunity to local businesses.
                </p>
                <p className="font-semibold">
                  Ladele Ajao
                  <span className="block text-sm text-gray-600">
                    Founder & CEO
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

/* Small reusable feature card */
const Feature = ({ icon, title, text }) => (
  <div className="bg-[#D9FBF4] rounded-xl p-6 text-center">
    <div className="text-4xl text-blue-600 mx-auto mb-4">{icon}</div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-gray-700">{text}</p>
  </div>
);

export default AboutAjani;
