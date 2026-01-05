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

      {/* Hero Section — Same as Privacy Page */}
      <section className="mx-auto mb-8 max-w-4xl rounded-xl bg-[#6cff] px-6 py-12 md:mt-25 mt-20 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-[#00065A] mt-5">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[#00065A]">
          Last Updated: December 16, 2025
        </p>
      </section>

      {/* Content Section - Matching Privacy Page styling */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 font-manrope">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Content */}
          <div className="p-6 md:p-8 prose prose-blue max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Welcome to <strong>Ajani.ai</strong> ("Ajani", "we", "our", or
                "us"). These Terms of Service ("Terms") govern your access to and
                use of our website, mobile application, WhatsApp chatbot
                interface, and services (collectively, the "Platform").
              </p>

              <p className="text-gray-700 mt-3 leading-relaxed">
                By accessing or using Ajani.ai, you agree to be bound by these
                Terms. If you do not agree to these Terms, you may not access or
                use the Platform.
              </p>
            </div>

            <section className="space-y-8">
              {/* Section 1 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By creating an account, chatting with the Ajani digital
                  assistant, or accessing our directory, you confirm that you are
                  at least 18 years of age (or the age of legal majority in your
                  jurisdiction) and have the authority to enter into this
                  agreement.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  2. Description of Services
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Discover local businesses, vendors, and service providers.</li>
                  <li>Access real-time price insights for commodities and services.</li>
                  <li>Interact with an AI-powered chat interface.</li>
                  <li>Allow business owners to list and promote their services.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  3. Accuracy of Information &amp; AI Disclaimer
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  4. User Accounts
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>You are responsible for securing your login credentials.</li>
                  <li>You agree to provide accurate registration information.</li>
                  <li>We may suspend accounts that violate these Terms.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  5. Business Owners and Vendors
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Businesses must pass verification checks.</li>
                  <li>
                    Submitted content may be displayed for marketing and listings.
                  </li>
                  <li>Illegal or prohibited services are not allowed.</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  6. Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ajani.ai acts only as a directory. Transactions are strictly
                  between users and vendors, and Ajani.ai is not liable for
                  disputes.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  7. Prohibited Use
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Illegal activities or misuse of the Platform.</li>
                  <li>Reverse engineering or data scraping.</li>
                  <li>Harassment, abuse, or malicious content.</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  8. Privacy and Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your use of Ajani.ai is governed by our Privacy Policy and
                  complies with the Nigeria Data Protection Regulation (NDPR).
                </p>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  9. Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All platform content and branding are the property of Ajani.ai
                  and protected by applicable laws.
                </p>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  10. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ajani.ai shall not be liable for indirect or consequential
                  damages. Liability shall not exceed fees paid in the last 12
                  months.
                </p>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  11. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify Ajani.ai against claims arising from
                  misuse of the Platform.
                </p>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  12. Modifications to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms at any time. Continued use means
                  acceptance of changes.
                </p>
              </div>

              {/* Section 13 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  13. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by the laws of the Federal Republic of
                  Nigeria, with jurisdiction in Ibadan.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Contact Us
                </h2>
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-gray-700">
                    Email:{" "}
                    <a
                      href="mailto:info@ajani.ai"
                      className="font-medium text-[#06EAFC] hover:text-[#00065A] transition-colors"
                    >
                      info@ajani.ai
                    </a>
                  </p>
                  <p className="text-gray-700 mt-1">
                    Website:{" "}
                    <a
                      href="https://www.ajani.ai"
                      className="font-medium text-[#06EAFC] hover:text-[#00065A] transition-colors"
                    >
                      www.ajani.ai
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Ajani. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Site Footer */}
      <Footer />
    </>
  );
};

export default TermsPage;