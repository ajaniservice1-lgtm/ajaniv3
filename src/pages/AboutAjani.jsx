import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FounderImg from "../assets/Logos/IMG_9395.jpeg";
import WhoWeAreImg from "../assets/Logos/images.jpg";
import {
  FaMapMarkedAlt,
  FaCheckCircle,
  FaThLarge,
  FaCalendarCheck,
} from "react-icons/fa";

const AboutAjani = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <Header />

      <main className="bg-white font-['Manrope']">
        {/* HERO */}
        <section className="bg-[#D9FBF4] py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Text — first on mobile */}
            <div className="order-1 lg:order-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Built for Locals.
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">
                Designed for Trust.
              </h2>
              <h3 className="text-3xl lg:text-4xl font-bold mt-2">
                Powered by Ajani.
              </h3>

              <p className="mt-4 lg:mt-6 max-w-xl text-gray-700 text-base lg:text-lg">
                Ajani helps people across Oyo State discover, compare, and book
                trusted local services, from hotels and short-lets to
                restaurants, event centers, and everyday services.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 lg:mt-8">
                <button className="bg-blue-600 text-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-lg font-semibold text-sm lg:text-base">
                  Explore Service
                </button>
                <button className="bg-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-lg font-semibold border text-sm lg:text-base">
                  Listing Your Business
                </button>
              </div>
            </div>

            {/* Image — second on mobile */}
            <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
              <img
                src={FounderImg}
                alt="Ajani Founder"
                className="rounded-xl w-full max-w-sm lg:max-w-md lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Text — first on mobile */}
          <div className="order-1 lg:order-1">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
              Who We Are
            </h2>
            <p className="text-gray-700 text-sm lg:text-base mb-3 lg:mb-4">
              Ajani is a local discovery and booking platform built to simplify
              how people find reliable services around them.
            </p>
            <p className="text-gray-700 text-sm lg:text-base mb-3 lg:mb-4">
              We noticed a common problem: people rely on word-of-mouth,
              scattered social media posts, or outdated listings when searching
              for hotels, restaurants, event halls, and local service providers.
            </p>
            <p className="text-gray-700 text-sm lg:text-base">
              Ajani brings everything into one trusted place — verified
              listings, clear information, and easy booking — all designed with
              local realities in mind.
            </p>
          </div>

          {/* Image — second on mobile */}
          <div className="order-2 lg:order-2">
            <img
              src={WhoWeAreImg}
              alt="Who We Are"
              className="rounded-xl w-full lg:h-[450px] object-cover"
            />
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-[#EEF4FF] rounded-xl p-6 lg:p-8">
            <h3 className="font-bold text-lg lg:text-xl mb-3">Our Mission</h3>
            <p className="text-gray-700 text-sm lg:text-base">
              To make discovering and booking trusted local services simple,
              transparent, and stress-free for everyone across Oyo State.
            </p>
          </div>

          <div className="bg-[#EEF4FF] rounded-xl p-6 lg:p-8">
            <h3 className="font-bold text-lg lg:text-xl mb-3">Our Vision</h3>
            <p className="text-gray-700 text-sm lg:text-base">
              To become the most trusted local services platform in South-West
              Nigeria, connecting people to quality businesses and helping local
              vendors grow digitally.
            </p>
          </div>
        </section>

        {/* WHAT MAKES AJANI DIFFERENT */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-20">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 lg:mb-10">
            What Makes Ajani Different
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-[#D9FBF4] rounded-xl p-5 lg:p-6 text-center">
              <FaMapMarkedAlt className="mx-auto text-2xl lg:text-3xl mb-3 lg:mb-4" />
              <h4 className="font-bold text-sm lg:text-base">Local-First</h4>
              <p className="text-xs lg:text-sm text-gray-700 mt-1">
                Built specifically for Oyo State.
              </p>
            </div>

            <div className="bg-[#D9FBF4] rounded-xl p-5 lg:p-6 text-center">
              <FaCheckCircle className="mx-auto text-2xl lg:text-3xl mb-3 lg:mb-4" />
              <h4 className="font-bold text-sm lg:text-base">
                Verified Listings
              </h4>
              <p className="text-xs lg:text-sm text-gray-700 mt-1">
                Real businesses, real locations.
              </p>
            </div>

            <div className="bg-[#D9FBF4] rounded-xl p-5 lg:p-6 text-center">
              <FaThLarge className="mx-auto text-2xl lg:text-3xl mb-3 lg:mb-4" />
              <h4 className="font-bold text-sm lg:text-base">
                Multiple Categories
              </h4>
              <p className="text-xs lg:text-sm text-gray-700 mt-1">
                Hotels, short-lets, restaurants & services.
              </p>
            </div>

            <div className="bg-[#D9FBF4] rounded-xl p-5 lg:p-6 text-center">
              <FaCalendarCheck className="mx-auto text-2xl lg:text-3xl mb-3 lg:mb-4" />
              <h4 className="font-bold text-sm lg:text-base">
                Flexible Booking
              </h4>
              <p className="text-xs lg:text-sm text-gray-700 mt-1">
                Pay online or at the venue.
              </p>
            </div>
          </div>
        </section>

        {/* FOUNDER CARD */}
        <section className="max-w-6xl mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
          <div className="bg-[#D9FBF4] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-5 lg:gap-6 items-center">
            <img
              src={FounderImg}
              alt="Ladele Ajao"
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover"
            />

            <div className="text-center md:text-left">
              <h3 className="font-bold text-base lg:text-lg">Ladele Ajao</h3>
              <p className="text-xs lg:text-sm font-semibold mb-2 lg:mb-3">
                Founder & CEO
              </p>
              <p className="text-gray-700 text-sm lg:text-base max-w-3xl">
                Ajani was created out of a personal need — the frustration of
                trying to find reliable services without endless phone calls or
                uncertainty. With a background in technology and a strong
                connection to Oyo State, Ajani is built to put trust, clarity,
                and local businesses first.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutAjani;
