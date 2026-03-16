'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { team, departmentLabels, TeamMember } from '@/data/team';
import { timeline, values } from '@/data/timeline';
import { cn } from '@/lib/utils';
import { Lightbulb, Zap, Shield, Heart, Users, ChevronRight, GraduationCap, Briefcase, Award, X } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  users: Users,
};

const categoryColors: Record<string, string> = {
  founding: '#0066FF',
  growth: '#059669',
  esg: '#7c3aed',
  milestone: '#dc2626',
  innovation: '#d97706',
};

function Avatar({ initials, color, size = 'md' }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-16 h-16 text-lg', lg: 'w-24 h-24 text-2xl' };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function TeamMemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-6 mb-6">
          <Avatar initials={member.initials} color={member.color} size="lg" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
            <p className="text-blue-600 font-medium">{member.title}</p>
            {member.titleFr && (
              <p className="text-slate-400 text-sm italic mt-1">{member.titleFr}</p>
            )}
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-6">{member.bio}</p>

        <div className="space-y-4">
          {member.education && member.education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900 text-sm">Education</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.education.map((edu) => (
                  <span key={edu} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {edu}
                  </span>
                ))}
              </div>
            </div>
          )}

          {member.designations && member.designations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900 text-sm">Designations</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.designations.map((des) => (
                  <span key={des} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                    {des}
                  </span>
                ))}
              </div>
            </div>
          )}

          {member.previousRoles && member.previousRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900 text-sm">Previous Experience</h4>
              </div>
              <div className="space-y-1">
                {member.previousRoles.map((role) => (
                  <p key={role} className="text-slate-600 text-sm flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-1 text-slate-400 flex-shrink-0" />
                    {role}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [activeDepartment, setActiveDepartment] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const allDepts = ['All', ...departmentLabels];
  const filteredMembers = activeDepartment === 'All'
    ? team
    : team.filter(member => member.department === activeDepartment);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 py-20 md:py-28 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Our People"
              title="The Team Behind the Science"
              description="Nymbus Capital's team combines decades of institutional investment experience with cutting-edge quantitative expertise. Our diverse backgrounds in physics, mathematics, finance, and technology drive our systematic approach to investing."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Department Filter */}
      <section className="px-6 py-6 md:px-12 bg-slate-50 border-y border-slate-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {allDepts.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeDepartment === dept
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                )}
              >
                {dept}
                <span className="ml-2 text-xs opacity-60">
                  {dept === 'All' ? team.length : team.filter(m => m.department === dept).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <ScrollReveal key={member.name} delay={Math.min(index * 80, 400)}>
                <Card
                  className="p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar initials={member.initials} color={member.color} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">{member.title}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{member.bio}</p>
                  {(member.designations || member.education) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {member.designations?.map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">{d}</span>
                      ))}
                      {member.education?.slice(0, 1).map((e) => (
                        <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{e}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View full profile <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="px-6 py-20 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Our Journey"
              title="A Decade of Innovation"
              description="From algorithmic R&D to managing over $1.5 billion in assets, our journey reflects a relentless commitment to quantitative excellence."
            />
          </ScrollReveal>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 md:transform md:-translate-x-px" />

            {timeline.map((milestone, index) => (
              <ScrollReveal key={milestone.year} delay={index * 100}>
                <div className={cn(
                  "relative flex items-start gap-6 mb-12",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}>
                  <div className={cn(
                    "hidden md:block md:w-1/2",
                    index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                  )}>
                    <div className="text-5xl font-bold text-slate-200">{milestone.year}</div>
                  </div>

                  <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-4 border-white shadow-md"
                      style={{ backgroundColor: categoryColors[milestone.category] }}
                    />
                  </div>

                  <div className={cn(
                    "ml-14 md:ml-0 md:w-1/2",
                    index % 2 === 0 ? "md:pl-12" : "md:pr-12"
                  )}>
                    <div className="md:hidden text-3xl font-bold text-slate-200 mb-2">{milestone.year}</div>
                    <Card className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{milestone.description}</p>
                    </Card>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <SectionHeader
              eyebrow="Our Values"
              title="What Drives Us"
              description="Our culture is built on five core principles that guide every decision and interaction."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Shield;
              return (
                <ScrollReveal key={value.title} delay={index * 100}>
                  <Card className="p-6 text-center border border-slate-200 hover:border-blue-200 transition-colors h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{value.description}</p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="px-6 py-20 md:px-12 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-4">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Design high-performing investment solutions at the intersection of talent and modern technology.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Nymbus Capital stands at the crossroads of technology, data science, and finance. Our systematic and quantitative philosophy enables us to deliver institutional-quality investment outcomes with the agility of a focused boutique.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$1.5B+', label: 'Assets Under Management' },
              { value: '300+', label: 'Institutional Clients' },
              { value: '14', label: 'Investment Professionals' },
              { value: '2013', label: 'Year Founded' },
            ].map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 100}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Member Modal */}
      {selectedMember && (
        <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}
