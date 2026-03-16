'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Terms of Use' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'regulatory', label: 'Regulatory Disclosures' }
  ];

  const termsSection = (
    <div className="space-y-6">
      <p className="text-slate-600"><strong>Last Updated:</strong> March 15, 2026</p>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">1. Agreement to Terms</h4>
        <p className="text-slate-600">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">2. Use License</h4>
        <p className="text-slate-600 mb-3">Permission is granted to temporarily download one copy of the materials for personal, non-commercial viewing only.</p>
        <ul className="list-disc list-inside ml-4 space-y-2 text-slate-600">
          <li>Modify or copy the materials</li>
          <li>Use materials for commercial purposes</li>
          <li>Attempt to decompile or reverse engineer software</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">3. Disclaimer</h4>
        <p className="text-slate-600">The materials are provided on an 'as is' basis. Nymbus makes no warranties, expressed or implied.</p>
      </div>
    </div>
  );

  const privacySection = (
    <div className="space-y-6">
      <p className="text-slate-600"><strong>Last Updated:</strong> March 15, 2026</p>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">1. Information We Collect</h4>
        <p className="text-slate-600">We collect information you provide when completing forms including name, email, phone number, and company name.</p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">2. How We Use Your Information</h4>
        <ul className="list-disc list-inside ml-4 space-y-2 text-slate-600">
          <li>Respond to your inquiries</li>
          <li>Send promotional materials</li>
          <li>Analyze and improve our services</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">3. Data Security</h4>
        <p className="text-slate-600">We implement measures to protect personal information. However, no method is 100% secure.</p>
      </div>
    </div>
  );

  const regulatorySection = (
    <div className="space-y-6">
      <p className="text-slate-600"><strong>Last Updated:</strong> March 15, 2026</p>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Regulatory Status</h4>
        <p className="text-slate-600">Nymbus Capital is a registered investment manager and subject to regulation under the Investment Advisers Act.</p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Important Disclosures</h4>
        <ul className="list-disc list-inside ml-4 space-y-2 text-slate-600">
          <li>Past performance is not indicative of future results</li>
          <li>Investment strategies carry risk, including loss of principal</li>
        </ul>
      </div>
    </div>
  );

  const getContent = () => {
    switch (activeTab) {
      case 'terms':
        return termsSection;
      case 'privacy':
        return privacySection;
      case 'regulatory':
        return regulatorySection;
      default:
        return termsSection;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Legal"
              title="Legal Information"
              description="Terms of use, privacy policy, and regulatory disclosures"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex gap-4 mb-12 border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-3 font-medium transition-colors border-b-2",
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-slate-600 border-transparent hover:text-slate-700'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <Card className="p-8 border border-slate-200">
              {getContent()}
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;