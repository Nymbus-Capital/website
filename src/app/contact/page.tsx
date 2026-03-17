'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Mail, Phone, MapPin, Clock, CheckCircle, ArrowRight, Send, Building2, User, AtSign, MessageSquare, PhoneCall } from 'lucide-react';
import WorldMap from '@/components/WorldMap';

const contactInfo = [
  { icon: MapPin, label: 'Office', lines: ['1002 Sherbrooke Ouest', 'Montreal, QC H3A 2R7', 'Canada'] },
  { icon: Phone, label: 'Phone', lines: ['514-985-1138', '1-833-227-2656'] },
  { icon: Mail, label: 'Email', lines: ['info@nymbus.ca'] },
  { icon: Clock, label: 'Hours', lines: ['Monday – Friday', '9:00 AM – 5:00 PM EST'] },
];

const keyContacts = [
  { name: 'Marc Rivet', role: 'Partner, Head of Distribution', phone: '514-360-4255', email: 'mrivet@nymbus.ca' },
  { name: 'Xavier Girard', role: 'Partner, Client Relations', phone: '514-360-4259', email: 'xgirard@nymbus.ca' },
];

type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  icon: typeof User;
  required: boolean;
  half?: boolean;
};

const formFields: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', icon: User, required: true, half: true },
  { name: 'email', label: 'Email Address', type: 'email', icon: AtSign, required: true, half: true },
  { name: 'company', label: 'Company / Organization', type: 'text', icon: Building2, required: false, half: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', icon: PhoneCall, required: false, half: true },
  { name: 'message', label: 'Your Message', type: 'textarea', icon: MessageSquare, required: true },
];

function PremiumInput({
  field,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
}: {
  field: FormField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const isFilled = value.length > 0;
  const isActive = focused || isFilled;
  const Icon = field.icon;

  const baseClasses = `
    w-full bg-white rounded-xl border-2 transition-all duration-300 outline-none
    ${focused ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]' : 'border-slate-200 hover:border-slate-300'}
  `;

  if (field.type === 'textarea') {
    return (
      <div className="relative group">
        <div className={`absolute left-4 transition-all duration-200 pointer-events-none flex items-center gap-2 ${isActive ? 'top-2 text-xs' : 'top-4 text-sm'}`}>
          <Icon className={`w-3.5 h-3.5 transition-colors ${focused ? 'text-blue-500' : 'text-slate-400'}`} />
          <span className={`font-medium transition-colors ${focused ? 'text-blue-500' : 'text-slate-400'}`}>
            {field.label}{field.required && ' *'}
          </span>
        </div>
        <textarea
          name={field.name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={field.required}
          rows={5}
          className={`${baseClasses} pt-8 pb-4 px-4 resize-none text-slate-900 text-sm`}
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`absolute left-4 transition-all duration-200 pointer-events-none flex items-center gap-2 ${isActive ? 'top-1.5 text-xs' : 'top-1/2 -translate-y-1/2 text-sm'}`}>
        <Icon className={`w-3.5 h-3.5 transition-colors ${focused ? 'text-blue-500' : 'text-slate-400'}`} />
        <span className={`font-medium transition-colors ${focused ? 'text-blue-500' : 'text-slate-400'}`}>
          {field.label}{field.required && ' *'}
        </span>
      </div>
      <input
        type={field.type}
        name={field.name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={field.required}
        className={`${baseClasses} h-14 pt-5 pb-1 px-4 text-slate-900 text-sm`}
      />
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 4000);
  };

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero with World Map */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <div ref={heroRef} className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3"
            >
              Contact Us
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4"
            >
              Let&apos;s Connect
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-500 max-w-xl mx-auto"
            >
              Based in Montreal, serving institutional investors across the globe with quantitative precision.
            </motion.p>
          </div>

          {/* World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <WorldMap />
          </motion.div>
        </div>
      </section>

      {/* Main Content: Form + Info */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Form – 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Send us a message</h2>
                <p className="text-sm text-slate-500">We typically respond within one business day.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Paired fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formFields.filter(f => f.half).map((field) => (
                    <PremiumInput
                      key={field.name}
                      field={field}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      focused={focusedField === field.name}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                    />
                  ))}
                </div>

                {/* Full-width fields */}
                {formFields.filter(f => !f.half).map((field) => (
                  <PremiumInput
                    key={field.name}
                    field={field}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    focused={focusedField === field.name}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                  />
                ))}

                {/* Submit */}
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-emerald-700 text-sm font-medium">Message sent successfully. We&apos;ll be in touch shortly.</p>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="submit"
                      type="submit"
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      className="w-full relative group bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/15 flex items-center justify-center gap-2"
                    >
                      <span>Send Message</span>
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

          {/* Sidebar – 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/30 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Contact Information</h3>
              <div className="space-y-5">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                      {item.lines.map((line, i) => (
                        <p key={i} className="text-sm text-slate-700">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Contacts */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/30 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Key Contacts</h3>
              <div className="space-y-4">
                {keyContacts.map((contact) => (
                  <div key={contact.name} className="group p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors duration-200">
                    <p className="font-semibold text-slate-900 text-sm">{contact.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{contact.role}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                        <Phone className="w-3 h-3" /> {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/30 overflow-hidden">
              <iframe
                width="100%"
                height="220"
                style={{ border: 0 }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.6289769638746!2d-73.58293!3d45.50294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a4295555555%3A0x5555555555555555!2s1002%20Sherbrooke%20Ouest%2C%20Montreal%2C%20QC!5e0!3m2!1sen!2sca!4v1234567890"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}