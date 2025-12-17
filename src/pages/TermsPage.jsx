import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TermsPage = () => {
  // ✅ Always start page from top on entry
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <>
      {/* Site Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0B1220] to-[#111827]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-gray-300">Last Updated: December 16, 2025</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="space-y-8 rounded-xl border border-gray-100 bg-white p-6 leading-relaxed text-gray-700 shadow-sm md:p-10">
            <p>
              Welcome to <strong>Ajani.ai</strong> ("Ajani", "we", "our", or
              "us"). These Terms of Service ("Terms") govern your access to and
              use of our website, mobile application, WhatsApp chatbot
              interface, and services (collectively, the "Platform").
            </p>

            <p>
              By accessing or using Ajani.ai, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Platform.
            </p>

            {/* Section 1 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, chatting with the Ajani digital
                assistant, or accessing our directory, you confirm that you are
                at least 18 years of age (or the age of legal majority in your
                jurisdiction) and have the authority to enter into this
                agreement.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                2. Description of Services
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Discover local businesses, vendors, and service providers.
                </li>
                <li>
                  Access real-time price insights for commodities and services.
                </li>
                <li>Interact with an AI-powered chat interface.</li>
                <li>
                  Allow business owners to list and promote their services.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                3. Accuracy of Information &amp; AI Disclaimer
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>No Guarantee of Accuracy:</strong> AI-generated or
                  third-party data may be outdated or inaccurate.
                </li>
                <li>
                  <strong>"As-Is" Information:</strong> Prices are estimates and
                  may vary at point of sale.
                </li>
                <li>
                  <strong>AI Hallucinations:</strong> Verify important details
                  directly with vendors.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                4. User Accounts
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  You are responsible for securing your login credentials.
                </li>
                <li>You agree to provide accurate registration information.</li>
                <li>We may suspend accounts that violate these Terms.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                5. Business Owners and Vendors
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Businesses must pass verification checks.</li>
                <li>
                  Submitted content may be displayed for marketing and listings.
                </li>
                <li>Illegal or prohibited services are not allowed.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                6. Third-Party Services
              </h2>
              <p>
                Ajani.ai acts only as a directory. Transactions are strictly
                between users and vendors, and Ajani.ai is not liable for
                disputes.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                7. Prohibited Use
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Illegal activities or misuse of the Platform.</li>
                <li>Reverse engineering or data scraping.</li>
                <li>Harassment, abuse, or malicious content.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                8. Privacy and Data Protection
              </h2>
              <p>
                Your use of Ajani.ai is governed by our Privacy Policy and
                complies with the Nigeria Data Protection Regulation (NDPR).
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                9. Intellectual Property
              </h2>
              <p>
                All platform content and branding are the property of Ajani.ai
                and protected by applicable laws.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                10. Limitation of Liability
              </h2>
              <p>
                Ajani.ai shall not be liable for indirect or consequential
                damages. Liability shall not exceed fees paid in the last 12
                months.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                11. Indemnification
              </h2>
              <p>
                You agree to indemnify Ajani.ai against claims arising from
                misuse of the Platform.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                12. Modifications to Terms
              </h2>
              <p>
                We may update these Terms at any time. Continued use means
                acceptance of changes.
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                13. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of the Federal Republic of
                Nigeria, with jurisdiction in Ibadan.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Contact Us
              </h2>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@ajani.ai"
                  className="font-medium text-[#06EAFC]"
                >
                  info@ajani.ai
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://www.ajani.ai"
                  className="font-medium text-[#06EAFC]"
                >
                  www.ajani.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <Footer />
    </>
  );
};

export default TermsPage;
