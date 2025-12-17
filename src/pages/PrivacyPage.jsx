import React, { useEffect } from "react";
import Meta from "../components/Meta";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Meta
        title="Privacy Policy | Ajani Directory"
        description="Learn how Ajani Directory collects, stores, and protects your personal data in compliance with NDPR."
        url="https://ajani.ai/privacypage"
        image="https://res.cloudinary.com/debpabo0a/image/upload/v1762946675/tomxwgwluyjdoa2fivhc.jpg"
      />

      <Header />

      {/* Hero Section — EXACT SAME AS ABOUT & TERMS */}
      <section className="mx-auto mb-8 max-w-4xl rounded-xl bg-[#6cff] px-6 py-12 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-[#00065A] mt-5">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#00065A]">
          Effective Date: October 2025
        </p>
      </section>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 font-rubik">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Content */}
          <div className="p-6 md:p-8 prose prose-blue max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-balance">
                <strong>Ajani</strong> (“we,” “our,” or “us”) is a smart digital
                assistant <strong>(BN:8846874)</strong> that helps users
                discover services, businesses, and information. We are committed
                to safeguarding the privacy of all users in compliance with the{" "}
                <strong>Nigeria Data Protection Regulation (NDPR 2019)</strong>{" "}
                and other applicable data protection laws.
              </p>
              <p className="text-gray-700 mt-3 leading-relaxed">
                This Privacy Policy explains how Ajani collects, uses, stores,
                and shares your personal information, and outlines your rights
                as a data subject under NDPR.
              </p>
            </div>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mt-8">
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Personal Information:</strong> Name, phone number,
                  email, business details (if you list a service), and contact
                  preferences.
                </li>
                <li>
                  <strong>Interaction Data:</strong> Chats, queries, and
                  searches with Ajani.
                </li>
                <li>
                  <strong>Device Data:</strong> IP address, browser type,
                  operating system, and device identifiers.
                </li>
                <li>
                  <strong>Location Data:</strong> If you grant permission, Ajani
                  may access your location to recommend nearby services.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                2. Lawful Basis for Processing (NDPR)
              </h2>
              <p className="text-gray-700">
                We process personal data only when there is a lawful basis,
                which may include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Consent:</strong> When you give Ajani permission.
                </li>
                <li>
                  <strong>Contractual Necessity:</strong> To provide services.
                </li>
                <li>
                  <strong>Legal Obligation:</strong> Required by law.
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> Security and
                  improvement.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Personalized recommendations.</li>
                <li>Business listings and management.</li>
                <li>Improve AI accuracy.</li>
                <li>Service communications.</li>
                <li>Legal compliance.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                4. Sharing of Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>With businesses you contact.</li>
                <li>With service providers.</li>
                <li>With authorities when required.</li>
                <li>With affiliates during restructuring.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                5. Cross-Border Data Transfers
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Adequate-protection countries.</li>
                <li>Your explicit consent.</li>
                <li>Binding legal agreements.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                6. Data Retention
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Only as long as necessary.</li>
                <li>Anonymized interaction data.</li>
                <li>Deletion upon request.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                7. Security of Data
              </h2>
              <p className="text-gray-700">
                Ajani applies technical and organizational safeguards and will
                notify NDPC within 72 hours of significant breaches.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                8. Your Rights Under NDPR
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Access</li>
                <li>Rectification</li>
                <li>Erasure</li>
                <li>Data Portability</li>
                <li>Consent Withdrawal</li>
                <li>Objection</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                9. Children’s Privacy
              </h2>
              <p className="text-gray-700">
                Ajani does not knowingly collect data from children under 13.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                10. Changes to this Privacy Policy
              </h2>
              <p className="text-gray-700">
                Updates will be posted with a new effective date.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8">
                11. Contact Us
              </h2>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-gray-900">
                  Ajani Data Protection Officer (DPO)
                </p>
                <p>Email: info@ajani.com</p>
                <p>Phone: 08022662256</p>
                <p>Address: 7, Oluyoro Street, Bodija, Ibadan, Nigeria</p>
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

      <Footer />
    </>
  );
};

export default PrivacyPage;
