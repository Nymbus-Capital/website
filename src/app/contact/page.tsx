'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

function PremiumInput({
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <motion.label
        animate={{
          y: value || isFocused ? -24 : 0,
          scale: value || isFocused ? 0.85 : 1,
        }}
        className="absolute left-0 top-4 text-slate-600 font-medium pointer-events-none origin-left transition-colors duration-200"
        style={{ color: isFocused ? '#2563eb' : '#475569' }}
      >
        {label}
      </motion.label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-300 focus:border-blue-600 outline-none transition-colors resize-none h-28"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-300 focus:border-blue-600 outline-none transition-colors"
        />
      )}
    </div>
  );
}

function WorldMap() {
  return (
    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#dbeafe', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#mapGradient)" />
      <g fill="#93c5fd" stroke="#bfdbfe" strokeWidth="0.5">
        <path d="M50,80 L80,70 L90,90 L70,100 Z" />
        <circle cx="250" cy="120" r="15" />
        <rect x="100" y="160" width="40" height="30" />
        <polygon points="300,200 330,190 340,210 320,225" />
      </g>
      <circle cx="180" cy="140" r="4" fill="#2563eb" />
      <circle cx="180" cy="140" r="8" fill="#2563eb" opacity="0.3" />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', company: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Montreal Office',
      details: '1000 Sherbrooke St. West\nMontreal, QC H3A 3G4\nCanada',
    },
    {
      icon: Phone,
      title: 'Direct Lines',
      details: 'Marc Rivet: (514) 555-0123\nXavier Girard: (514) 555-0124',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday\n9:00 AM - 5:00 PM EST',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Have questions about our investment strategies? We'd love to hear from you.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <ScrollReveal key={info.title} delay={idx * 100}>
                  <Card>
                    <div className="p-8">
                      <Icon className="w-8 h-8 text-blue-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{info.title}</h3>
                      <p className="text-slate-600 whitespace-pre-line text-sm">{info.details}</p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form */}
            <ScrollReveal>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <PremiumInput
                    label="Full Name"
                    value={formData.name}
                    onChange={(name) => setFormData({ ...formData, name })}
                  />
                  <PremiumInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(email) => setFormData({ ...formData, email })}
                  />
                  <PremiumInput
                    label="Company"
                    value={formData.company}
                    onChange={(company) => setFormData({ ...formData, company })}
                  />
                  <PremiumInput
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone })}
                  />
                  <PremiumInput
                    label="Message"
                    value={formData.message}
                    onChange={(message) => setFormData({ ...formData, message })}
                    textarea
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </motion.button>
                </form>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold"
                  >
                    Thank you! We'll get back to you soon.
                  </motion.div>
                )}
              </div>
            </ScrollReveal>

            {/* Map */}
            <ScrollReveal>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Visit Us</h2>
                <Card className="h-96">
                  <WorldMap />
                </Card>
                <p className="text-slate-600 mt-4 text-sm">
                  Our Montreal headquarters is centrally located in the heart of the financial district.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}