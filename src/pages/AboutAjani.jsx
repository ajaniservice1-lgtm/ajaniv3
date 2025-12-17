import React, { useEffect } from "react";
import Ajani from "../assets/Logos/IMG_9395.jpeg";
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

      <main className="min-h-screen bg-slate-100 px-4 py-10">
        {/* Hero Section */}
        <section className="mx-auto mb-8 max-w-4xl rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-12 text-center text-white shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">About Ajani</h1>
          <p className="mt-2 text-sm text-slate-300">Founder &amp; CEO</p>
        </section>

        {/* Content Card */}
        <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Ladele Ajao
          </h2>

          <p className="mb-4 text-sm leading-7 text-slate-700">
            <span className="font-medium">Ladele Ajao</span> is the Founder and
            CEO of Ajani, a smart local discovery and booking platform designed
            to make it easier for people to find, compare, and book trusted
            local services across Ibadan and Oyo State.
          </p>

          <p className="mb-4 text-sm leading-7 text-slate-700">
            Ajani was created to solve a simple but widespread problem: local
            services are often hard to discover, information is scattered or
            outdated, and booking is unnecessarily stressful. By bringing
            hotels, short-lets, restaurants, event venues, and local service
            providers into one structured platform, Ajani helps users make
            confident decisions while supporting local businesses with better
            visibility and demand.
          </p>

          <p className="mb-4 text-sm leading-7 text-slate-700">
            With a background in technology, systems, and process improvement,
            Ladele focuses on building practical, scalable solutions that fit
            local realities. Ajani is being developed with flexibility in mind —
            allowing users to pay online or at the point of service, while
            enabling service providers to onboard gradually without friction.
          </p>

          <p className="mb-6 text-sm leading-7 text-slate-700">
            Ajani is an independent venture founded and developed outside of
            Ladele’s full-time professional role, with a long-term vision of
            becoming a trusted digital guide for everyday local living across
            Oyo State and beyond.
          </p>

          {/* Contact Info */}
          <div className="border-t border-slate-200 pt-4 text-sm text-slate-700">
            <p className="mb-2">
              <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:lajao@ajani.ai"
                className="text-blue-600 hover:underline"
              >
                lajao@ajani.ai
              </a>
            </p>

            <p>
              <span className="font-medium">Phone:</span>{" "}
              <a
                href="tel:+2348022662256"
                className="text-blue-600 hover:underline"
              >
                +234 802 266 2256
              </a>
            </p>
          </div>

          {/* Logo */}
          <img
            src={Ajani}
            alt="Ajani Logo"
            className="mt-6 h-auto w-24 md:w-48"
          />
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutAjani;
