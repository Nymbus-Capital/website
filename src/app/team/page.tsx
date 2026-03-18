'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Users, Calendar, Briefcase, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: string;
  image: string;
  bio: string;
  education: string[];
  designations: string[];
  previousRoles: string[];
  yearJoined: number;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Marc Rivet',
    title: 'Chief Investment Officer',
    department: 'Leadership',
    image: 'MR',
    bio: 'Marc brings 20+ years of investment experience to Nymbus. Under his strategic vision, our firm has grown into a leader in systematic investing.',
    education: ['MBA from HEC Montreal', 'B.S. Mathematics from McGill University'],
    designations: ['CFA Charterholder'],
    previousRoles: ['Portfolio Manager at TechWealth', 'Quantitative Analyst at Goldman Sachs'],
    yearJoined: 2012,
  },
  {
    id: '2',
    name: 'Xavier Girard',
    title: 'Head of Research',
    department: 'Leadership',
    image: 'XG',
    bio: 'Xavier leads our quantitative research team and oversees model development and systematic strategy innovation.',
    education: ['Ph.D. in Mathematics from University of Montreal', 'B.Eng. in Engineering from ETS'],
    designations: ['CFA Charterholder'],
    previousRoles: ['Senior Researcher at Bloomberg', 'Quant Developer at Jane Street'],
    yearJoined: 2015,
  },
  {
    id: '3',
    name: 'Sarah Chen',
    title: 'Portfolio Manager',
    department: 'Investment Team',
    image: 'SC',
    bio: 'Sarah oversees our fixed income strategies and brings deep expertise in credit analysis and bond portfolio management.',
    education: ['MBA from INSEAD', 'B.S. Economics from University of Toronto'],
    designations: ['CFA Charterholder', 'FRM (Financial Risk Manager)'],
    previousRoles: ['Senior Bond Manager at Vanguard', 'Credit Analyst at Moody\'s'],
    yearJoined: 2018,
  },
  {
    id: '4',
    name: 'James Morrison',
    title: 'Senior Quantitative Analyst',
    department: 'Quantitative Research',
    image: 'JM',
    bio: 'James develops machine learning models for alpha generation and is a key contributor to our signal generation process.',
    education: ['M.S. Computer Science from MIT', 'B.S. Physics from Cambridge University'],
    designations: ['Machine Learning Specialist'],
    previousRoles: ['Data Scientist at Google', 'ML Engineer at DeepMind'],
    yearJoined: 2019,
  },
  {
    id: '5',
    name: 'Emily Rodriguez',
    title: 'Risk Manager',
    department: 'Operations',
    image: 'ER',
    bio: 'Emily manages portfolio risk, conducts stress testing, and ensures compliance with regulatory requirements.',
    education: ['MBA from London Business School', 'B.S. Mathematics from UC Berkeley'],
    designations: ['FRM (Financial Risk Manager)', 'CRR (Certified Regulatory Examiner)'],
    previousRoles: ['Risk Analyst at JP Morgan', 'Compliance Officer at Blackstone'],
    yearJoined: 2017,
  },
  {
    id: '6',
    name: 'Thomas Anderson',
    title: 'Board Member',
    department: 'Board',
    image: 'TA',
    bio: 'Thomas brings strategic guidance and extensive board experience from leading financial institutions.',
    education: ['MBA from Wharton', 'B.A. Economics from Princeton University'],
    designations: ['CFA Charterholder'],
    previousRoles: ['CEO of Global Investment Bank', 'CFO at Major Insurance Company'],
    yearJoined: 2014,
  },
];

function TeamMemberCard({ member, onView }: { member: TeamMember; onView: (member: TeamMember) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -8,
        boxShadow: '0 20px 40px rgba(66, 133, 244, 0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onView(member)}
      className="cursor-pointer"
    >
      <Card className="h-full overflow-hidden">
        <div className="p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
            {member.image}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
          <p className="text-blue-600 font-semibold text-sm mb-2">{member.title}</p>
          <p className="text-slate-600 text-sm mb-4">{member.bio.substring(0, 100)}...</p>
          <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
            View Profile →
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

function TeamMemberModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  if (!member) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{member.title}</h3>
            <p className="text-slate-600">{member.bio}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Education
              </p>
              <ul className="space-y-1">
                {member.education.map((edu, idx) => (
                  <li key={idx} className="text-sm text-slate-600">{edu}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Designations
              </p>
              <ul className="space-y-1">
                {member.designations.map((des, idx) => (
                  <li key={idx} className="text-sm text-slate-600">{des}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Previous Roles
            </p>
            <ul className="space-y-1">
              {member.previousRoles.map((role, idx) => (
                <li key={idx} className="text-sm text-slate-600">• {role}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-blue-600" />
            Joined in {member.yearJoined}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TimelineSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Story"
            title="Nymbus Timeline"
            description="From startup to industry leader in systematic investing."
          />
        </ScrollReveal>

        <div className="mt-16 space-y-8 max-w-3xl mx-auto">
          {[
            { year: 2012, event: 'Nymbus Capital founded by Marc Rivet' },
            { year: 2015, event: 'Xavier Girard joins as Head of Research' },
            { year: 2018, event: 'Launch of Sustainable Enhanced Bonds Fund' },
            { year: 2021, event: 'Assets under management exceed $1 billion' },
            { year: 2024, event: 'Expand quantitative research team and capabilities' },
          ].map((item, idx) => (
            <ScrollReveal key={item.year} delay={idx * 100}>
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full" />
                  {idx < 4 && <div className="w-1 h-16 bg-blue-200" />}
                </div>
                <div className="pt-2">
                  <p className="font-bold text-blue-600">{item.year}</p>
                  <p className="text-slate-700">{item.event}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    { title: 'Excellence', description: 'We pursue the highest standards in everything we do.' },
    { title: 'Integrity', description: 'Honesty and ethical conduct guide all our decisions.' },
    { title: 'Innovation', description: 'We continuously push boundaries in quantitative finance.' },
    { title: 'Collaboration', description: 'Our team thrives through open communication and teamwork.' },
    { title: 'Accountability', description: 'We take responsibility for our results and actions.' },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Culture"
            title="Core Values"
            description="The principles that define how we work and interact with our stakeholders."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">
          {values.map((value, idx) => (
            <ScrollReveal key={value.title} delay={idx * 80}>
              <Card>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
          {[
            { label: 'Team Members', value: '14' },
            { label: 'Assets Managed', value: '$1.5B' },
            { label: 'Founded', value: '2012' },
            { label: 'Active Mandates', value: '10+' },
          ].map((stat) => (
            <ScrollReveal key={stat.label}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const departments = Array.from(new Set(teamMembers.map((m) => m.department)));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Team</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Experienced professionals dedicated to systematic investing and quantitative excellence.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {departments.map((dept) => (
            <div key={dept} className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">{dept}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers
                  .filter((m) => m.department === dept)
                  .map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onView={setSelectedMember}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Timeline Section */}
      <TimelineSection />

      {/* Values Section */}
      <ValuesSection />

      {/* Modal */}
      <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}