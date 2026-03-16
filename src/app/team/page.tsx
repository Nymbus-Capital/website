'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { team as teamMembers } from '@/data/team';
import { cn } from '@/lib/utils';

const departments = [
  'All',
  'Leadership',
  'Investment Team',
  'Quantitative Research',
  'Operations'
];

const TeamPage = () => {
  const [activeDepartment, setActiveDepartment] = useState<string>('All');

  const filteredMembers = activeDepartment === 'All'
    ? teamMembers
    : teamMembers.filter(member => member.department === activeDepartment);

  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Team"
              title="Meet Our Team"
              description="Dedicated professionals committed to exceptional investment management"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-8 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all duration-200",
                  activeDepartment === dept
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                )}
              >
                {dept}
              </button>
            ))}
          </div>
          <p className="text-center text-slate-600 text-sm">
            Showing {filteredMembers.length} of {teamMembers.length} team members
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member, index) => (
              <ScrollReveal key={member.name} direction="up" delay={0.05 * (index + 1)}>
                <Card className="p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{member.title}</p>
                    </div>
                    <span className="ml-3 px-3 py-1 bg-slate-100 text-xs font-medium text-slate-700 rounded-full whitespace-nowrap">
                      {member.department}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal direction="up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Culture</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-12">
                We believe exceptional investment outcomes come from combining diverse talents, rigorous research, and a commitment to continuous improvement. Our team is united by a passion for innovation and a dedication to serving our clients with integrity.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div className="grid grid-cols-3 gap-8">
              <Card className="p-6 border border-slate-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">{teamMembers.length}</p>
                <p className="text-slate-600 text-sm">Team Members</p>
              </Card>
              <Card className="p-6 border border-slate-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">{departments.length - 1}</p>
                <p className="text-slate-600 text-sm">Departments</p>
              </Card>
              <Card className="p-6 border border-slate-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">100%</p>
                <p className="text-slate-600 text-sm">Commitment</p>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;