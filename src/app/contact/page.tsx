'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

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
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
              <p className="text-slate-600 text-center max-w-2xl mx-auto">
                Have questions about our investment strategies or solutions? We'd love to hear from you.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <ScrollReveal direction="up" delay={0.1} className="lg:col-span-2">
              <Card className="p-8 border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-colors"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-colors"
                      placeholder="Tell us about your investment needs..."
                    />
                  </div>

                  {submitted && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-sm">Thank you for your message. We'll be in touch soon!</p>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15} className="space-y-6">
              <Card className="p-6 border border-slate-200">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Address</h3>
                    <p className="text-slate-600 text-sm">1002 Sherbrooke Ouest</p>
                    <p className="text-slate-600 text-sm">Montreal, Quebec H3A 2R7</p>
                    <p className="text-slate-600 text-sm">Canada</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6 border-t border-slate-200 pt-6">
                  <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Phone</h3>
                    <p className="text-slate-600 text-sm mb-1">514-985-1138</p>
                    <p className="text-slate-600 text-sm">1-833-227-2656</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6 border-t border-slate-200 pt-6">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Email</h3>
                    <p className="text-slate-600 text-sm">info@nymbus.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-slate-200 pt-6">
                  <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Business Hours</h3>
                    <p className="text-slate-600 text-sm mb-1">Monday - Friday</p>
                    <p className="text-slate-600 text-sm">9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Key Contacts</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Marc Rivet</p>
                    <p className="text-xs text-slate-600">514-360-4255</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Xavier Girard</p>
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