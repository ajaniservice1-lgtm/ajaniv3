import React, { useEffect } from "react";
import AjaniLogo from "../assets/Logos/IMG_9395.jpeg";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutAjani = () => {
  // ✅ Always scroll to top on page entry
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 py-8">
        {/* Hero Banner */}
        <section className="mx-auto mb-12 max-w-6xl">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl px-8 py-12 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-4">Built for Locals.</h1>
            <h2 className="text-3xl font-semibold mb-4">Designed for Trust.</h2>
            <h3 className="text-2xl font-medium mb-8">Powered by Ajani.</h3>

            <p className="text-lg max-w-3xl">
              Ajani helps people across Oyo State discover, compare, and book
              trusted local services, from hotels and short-lets to restaurants,
              event centers, and everyday services.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Explore Service Section */}
            <section className="bg-gray-50 rounded-xl p-6 border">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Explore Service
              </h2>
              <div className="bg-blue-100 text-blue-900 rounded-lg p-4 font-semibold">
                Listing Your Business
              </div>
            </section>

            {/* Who We Are Section */}
            <section className="bg-gray-50 rounded-xl p-6 border">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Who We Are
              </h2>

              <p className="mb-4 text-gray-700 leading-relaxed">
                Ajani is a local discovery and booking platform built to
                simplify how people find reliable services around them.
              </p>

              <p className="mb-4 text-gray-700 leading-relaxed">
                We noticed a common problem: people rely on word-of-mouth,
                scattered social media posts, or outdated listings when
                searching for hotels, restaurants, event halls, and local
                service providers.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Ajani brings everything into one trusted place — verified
                listings, clear information, and easy booking — all designed
                with local realities in mind.
              </p>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* What Makes Ajani Different Section */}
            <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                What Makes Ajani Different
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Local-First</h3>
                  <p className="text-gray-700 text-sm">
                    Built specifically for Oyo State.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-blue-900 mb-2">
                    Verified Listings
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Real businesses, real locations.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-blue-900 mb-2">
                    Multiple Categories
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Hotels, short-lets, restaurants, event centers, and local
                    services.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-blue-900 mb-2">
                    Flexible Booking
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Pay online or pay at the venue.
                  </p>
                </div>
              </div>
            </section>

            {/* Founder Section */}
            <section className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">Ladele Ajao</h3>
                <p className="text-gray-600 font-medium">Founder & CEO</p>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                Ajani was created out of a personal need — the frustration of
                trying to find reliable services without endless phone calls or
                uncertainty. With a background in technology and a strong
                connection to Oyo State, Ajani is built to put trust, clarity,
                and local businesses first.
              </p>
            </section>

            {/* Logo Section */}
            <div className="flex justify-center pt-6">
              <img
                src={AjaniLogo}
                alt="Ajani Logo"
                className="h-24 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer Links Section */}
        <section className="mx-auto max-w-6xl mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About Links */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">About</h3>
              <ul className="space-y-2 text-gray-600">
                <li>About Ajani</li>
                <li>How It Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            {/* Categories & Support Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Categories</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Hotel</li>
                  <li>Restaurant</li>
                  <li>Events</li>
                  <li>Vendor</li>
                  <li>School</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4">Support</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Contact Us</li>
                  <li>Help Centre</li>
                  <li>Vendor Registration</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutAjani;
