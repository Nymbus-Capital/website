'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import BackgroundBeams from '@/components/BackgroundBeams';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <BackgroundBeams />
      
      <div className="relative z-10 px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Get in Touch</h1>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-16">
            Have questions about our investment strategies or solutions? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="Tell us about your investment needs..."
                  />
                </div>

                <motion.div
                  initial={false}
                  animate={submitted ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-green-400">Thank you for your message. We'll be in touch soon!</p>
                  </div>
                </motion.div>

                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Address</h3>
                    <p className="text-gray-300 text-sm">1002 Sherbrooke Ouest</p>
                    <p className="text-gray-300 text-sm">Montreal, Quebec H3A 2R7</p>
                    <p className="text-gray-300 text-sm">Canada</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6 border-t border-slate-700 pt-6">
                  <Phone className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Phone</h3>
                    <p className="text-gray-300 text-sm mb-1">514-985-1138</p>
                    <p className="text-gray-300 text-sm">1-833-227-2656</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6 border-t border-slate-700 pt-6">
                  <Mail className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Email</h3>
                    <p className="text-gray-300 text-sm">info@nymbus.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-slate-700 pt-6">
                  <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Business Hours</h3>
                    <p className="text-gray-300 text-sm mb-1">Monday - Friday</p>
                    <p className="text-gray-300 text-sm">9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="font-semibold text-white mb-4">Key Contacts</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-400">Marc Rivet</p>
                    <p className="text-xs text-gray-400">514-360-4255</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-400">Xavier Girard</p>
                    <p className="text-xs text-gray-400">514-360-4259</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;