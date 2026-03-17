'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import GlobeCanvas from '@/components/GlobeCanvas';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 3000);
  };

  useEffect(() => {
    // Animate the map on load
    if (mapContainerRef.current) {
      gsap.from(mapContainerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, []);

  // Floating label input component
  const FloatingInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    required = false,
    placeholder = ''
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
  }) => {
    const isFilled = value.length > 0;
    const isFocused = focusedField === name;

    return (
      <div className="relative pb-2">
        <label
          htmlFor={name}
          className={`absolute left-0 transition-all duration-200 origin-left pointer-events-none ${
            isFilled || isFocused
              ? 'text-xs text-blue-600 -translate-y-6 scale-90'
              : 'text-slate-600 translate-y-3'
          }`}
        >
          {label}
        </label>
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          required={required}
          placeholder={placeholder}
          className={`w-full px-0 py-3 bg-transparent border-b-2 transition-colors duration-200 focus:outline-none ${
            isFocused || isFilled
              ? 'border-blue-600'
              : 'border-slate-300 hover:border-slate-400'
          } text-slate-900 placeholder-slate-400`}
        />
      </div>
    );
  };

  const FloatingTextarea = ({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder = ''
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
    placeholder?: string;
  }) => {
    const isFilled = value.length > 0;
    const isFocused = focusedField === name;

    return (
      <div className="relative pb-2">
        <label
          htmlFor={name}
          className={`absolute left-0 transition-all duration-200 origin-left pointer-events-none ${
            isFilled || isFocused
              ? 'text-xs text-blue-600 -translate-y-6 scale-90'
              : 'text-slate-600 translate-y-3'
          }`}
        >
          {label}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          required={required}
          placeholder={placeholder}
          rows={6}
          className={`w-full px-0 py-3 bg-transparent border-b-2 transition-colors duration-200 focus:outline-none resize-none ${
            isFocused || isFilled
              ? 'border-blue-600'
              : 'border-slate-300 hover:border-slate-400'
          } text-slate-900 placeholder-slate-400`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SVG World Map with Montreal Location */}
      <div ref={mapContainerRef} className="px-6 py-16 md:px-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
              <p className="text-slate-600 text-center max-w-2xl mx-auto">
                Have questions about our investment strategies or solutions? We'd love to hear from you.
              </p>
            </div>
          </ScrollReveal>

          {/* 3D Globe Canvas */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="flex justify-center mb-12">
              <GlobeCanvas />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <ScrollReveal direction="up" delay={0.1} className="lg:col-span-2">
              <Card className="p-8 backdrop-blur-sm bg-white/95 border border-slate-200/60 shadow-lg">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <FloatingInput
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <FloatingInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <FloatingInput
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <FloatingTextarea
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {submitted && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-sm font-medium">Thank you for your message. We'll be in touch soon!</p>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                    Send Message
                  </Button>
                </form>
              </Card>
            </ScrollReveal>

            {/* Contact Info Sidebar with Frosted Glass Effect */}
            <ScrollReveal direction="up" delay={0.15} className="space-y-6">
              {/* Google Maps Embed */}
              <Card className="overflow-hidden border border-slate-200/60 shadow-lg">
                <iframe
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.6289769638746!2d-73.58293!3d45.50294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a4295555555%3A0x5555555555555555!2s1002%20Sherbrooke%20Ouest%2C%20Montreal%2C%20QC!5e0!3m2!1sen!2sca!4v1234567890"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>

              {/* Contact Info Card with Frosted Glass */}
              <Card className="p-6 backdrop-blur-md bg-white/95 border border-slate-200/60 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Address</h3>
                      <p className="text-slate-600 text-sm">1002 Sherbrooke Ouest</p>
                      <p className="text-slate-600 text-sm">Montreal, Quebec H3A 2R7</p>
                      <p className="text-slate-600 text-sm">Canada</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6 flex items-start gap-4">
                    <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Phone</h3>
                      <p className="text-slate-600 text-sm mb-1">514-985-1138</p>
                      <p className="text-slate-600 text-sm">1-833-227-2656</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6 flex items-start gap-4">
                    <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Email</h3>
                      <p className="text-slate-600 text-sm">info@nymbus.ca</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6 flex items-start gap-4">
                    <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Business Hours</h3>
                      <p className="text-slate-600 text-sm mb-1">Monday - Friday</p>
                      <p className="text-slate-600 text-sm">9:00 AM - 5:00 PM EST</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Key Contacts Card */}
              <Card className="p-6 backdrop-blur-md bg-white/95 border border-slate-200/60 shadow-lg">
                <h3 className="font-semibold text-slate-900 mb-4">Key Contacts</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">Marc Rivet</p>
                    <p className="text-xs text-slate-600">514-360-4255</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-600">Xavier Girard</p>
                    <p className="text-xs text-slate-600">514-360-4259</p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
