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
import { team as teamData, TeamMember as TeamMemberData } from '@/data/team';

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  id: string;
  name: string;
  title: string;
  titleFr?: string;
  department: string;
  bio: string;
  education: string[];
  designations: string[];
  previousRoles: string[];
  yearJoined?: number;
  photo?: string;
  initials: string;
  color: string;
}

const transformTeamData = (members: TeamMemberData[]): TeamMember[] => {
  return members.map((member, idx) => ({
    id: String(idx),
    name: member.name,
    title: member.title,
    titleFr: member.titleFr,
    department: member.department,
    bio: member.bio,
    education: member.education || [],
    designations: member.designations || [],
    previousRoles: member.previousRoles || [],
    yearJoined: member.yearJoined,
    photo: member.photo,
    initials: member.initials,
    color: member.color,
  }));
};

const teamMembers: TeamMember[] = transformTeamData(teamData);

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
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 overflow-hidden flex-shrink-0">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={cn(
                'w-full h-full flex items-center justify-center text-white font-bold text-lg',
                member.photo ? 'hidden' : '',
              )}
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
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
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    img.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center text-white font-bold text-2xl',
                  member.photo ? 'hidden' : '',
                )}
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{member.title}</h3>
              <p className="text-blue-600 text-sm font-medium mb-4">{member.department}</p>
              <p className="text-slate-600">{member.bio}</p>
            </div>
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

          {member.yearJoined && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              Joined in {member.yearJoined}
            </div>
          )}
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

function TeamNarrativeSection() {
  const stats = [
    { label: '7+ Advanced degrees', description: 'in mathematics, physics & engineering' },
    { label: '3 CFA Charterholders', description: '' },
    { label: '50+ Years combined', description: 'institutional experience' },
    { label: '4 Programming languages', description: 'in daily production' },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, idx) => (
                <ScrollReveal key={stat.label} delay={idx * 80}>
                  <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <p className="text-lg font-bold text-slate-900 mb-1">{stat.label}</p>
                    {stat.description && (
                      <p className="text-sm text-slate-600">{stat.description}</p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="max-w-3xl">
              <p className="text-lg text-slate-700 leading-relaxed">
                Our team brings together practitioners from quantitative finance, applied mathematics, and software engineering alongside seasoned institutional portfolio managers. This combination of rigorous scientific methodology and deep market expertise drives every investment decision we make.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const departmentOrder = ['Board', 'Leadership', 'Investment Team', 'Quantitative Research', 'Operations'];
  const departments = departmentOrder.filter((dept) =>
    teamMembers.some((m) => m.department === dept)
  );

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

      {/* Team Narrative Section */}
      <TeamNarrativeSection />

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