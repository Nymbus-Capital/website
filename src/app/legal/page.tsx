'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Use' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'regulatory', label: 'Regulatory Disclosures' }
  ];

  const termsContent = `
    <h3 class="text-xl font-semibold text-white mb-4">Terms of Use</h3>
    <div class="space-y-4 text-gray-300">
      <p><strong>Last Updated:</strong> March 15, 2026</p>
      
      <div>
        <h4 class="font-semibold text-white mb-2">1. Agreement to Terms</h4>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">2. Use License</h4>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Nymbus's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
        <ul class="list-disc list-inside ml-2 mt-2 space-y-1">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose or for any public display</li>
          <li>Attempt to decompile or reverse engineer any software contained on the site</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">3. Disclaimer</h4>
        <p>The materials on Nymbus's website are provided on an 'as is' basis. Nymbus makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">4. Limitations</h4>
        <p>In no event shall Nymbus or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Nymbus's website.</p>
      </div>
    </div>
  `;

  const privacyContent = `
    <h3 class="text-xl font-semibold text-white mb-4">Privacy Policy</h3>
    <div class="space-y-4 text-gray-300">
      <p><strong>Last Updated:</strong> March 15, 2026</p>
      
      <div>
        <h4 class="font-semibold text-white mb-2">1. Information We Collect</h4>
        <p>We collect information you provide directly, such as when you complete a contact form or request information about our services. This may include your name, email address, phone number, company name, and any other information you choose to provide.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">2. How We Use Your Information</h4>
        <p>We use the information we collect to:</p>
        <ul class="list-disc list-inside ml-2 mt-2 space-y-1">
          <li>Respond to your inquiries and provide customer support</li>
          <li>Send you promotional materials and updates about our services</li>
          <li>Analyze and improve our website and services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">3. Data Security</h4>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">4. Your Rights</h4>
        <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us using the information provided on our Contact page.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">5. Contact Us</h4>
        <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@nymbus.com" class="text-amber-400 hover:text-amber-300">privacy@nymbus.com</a>.</p>
      </div>
    </div>
  `;

  const regulatoryContent = `
    <h3 class="text-xl font-semibold text-white mb-4">Regulatory Disclosures</h3>
    <div class="space-y-4 text-gray-300">
      <p><strong>Last Updated:</strong> March 15, 2026</p>
      
      <div>
        <h4 class="font-semibold text-white mb-2">Regulatory Status</h4>
        <p>Nymbus Capital is a registered investment manager with the Securities and Exchange Commission (SEC) and is subject to regulation under the Investment Advisers Act of 1940.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">Compliance Officer</h4>
        <p>For compliance inquiries, please contact our Compliance Officer at <a href="mailto:compliance@nymbus.com" class="text-amber-400 hover:text-amber-300">compliance@nymbus.com</a>.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">Important Disclosures</h4>
        <ul class="list-disc list-inside ml-2 space-y-1">
          <li>Past performance is not indicative of future results</li>
          <li>All investment strategies carry risk, including possible loss of principal</li>
          <li>Investment returns and principal value will fluctuate, so an investor's shares, when redeemed, may be worth more or less than their original cost</li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">Form ADV</h4>
        <p>Our Form ADV is available on the SEC's EDGAR database at <a href="https://www.sec.gov/cgi-bin/browse-edgar" class="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">sec.gov</a>.</p>
      </div>

      <div>
        <h4 class="font-semibold text-white mb-2">Custody and Control of Assets</h4>
        <p>All client assets are held with qualified custodians. Nymbus does not maintain custody of client funds or securities.</p>
      </div>
    </div>
  `;

  const getContent = () => {
    switch (activeTab) {
      case 'terms':
        return termsContent;
      case 'privacy':
        return privacyContent;
      case 'regulatory':
        return regulatoryContent;
      default:
        return termsContent;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12">
        <SectionHeader
          title="Legal Information"
          subtitle="Terms of use, privacy policy, and regulatory disclosures"
        />
      </section>

      {/* Content Section */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-12 border-b border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-amber-400'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-slate-800/50 rounded-lg p-8 border border-slate-700"
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
