'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { team, departmentLabels, TeamMember } from '@/data/team';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { cn } from '@/lib/utils';
import { Users, Award, GraduationCap, Building2, X, ChevronDown, Briefcase } from 'lucide-react';

export default function TeamPage() {
  const [activeDept, setActiveDept] = useState<string>('All');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const departments = ['All', ...departmentLabels];
  const filtered = activeDept === 'All' ? team : team.filter((m) => m.department === activeDept);

  const totalExperience = team.reduce((acc, m) => acc + (m.yearJoined ? new Date().getFullYear() - m.yearJoined : 10), 0);
  const cfaHolders = team.filter((m) => m.designations?.some((d) => d.includes('CFA'))).length;
  const advancedDegrees = team.filter((m) => m.designations?.some((d) => d.includes('PhD') || d.includes('MSc') || d.includes('MBA')) || m.education?.some((e) => e.includes('PhD') || e.includes('M.Sc') || e.includes('MBA'))).length;

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Our Team</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">The People Behind the Science</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              A multidisciplinary team of investment professionals, quantitative researchers, and operations experts united by a passion for systematic investing.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Metrics */}
      <section className="bg-slate-50 border-b border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-slate-900"><AnimatedCounter target={team.length} /></p>
              <p className="text-sm text-slate-500 mt-1">Team Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900"><AnimatedCounter target={totalExperience} suffix="+" /></p>
              <p className="text-sm text-slate-500 mt-1">Combined Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900"><AnimatedCounter target={cfaHolders} /></p>
              <p className="text-sm text-slate-500 mt-1">CFA Charterholders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900"><AnimatedCounter target={advancedDegrees} /></p>
              <p className="text-sm text-slate-500 mt-1">Advanced Degrees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto no-scrollbar">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  activeDept === dept ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDept}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((member, i) => (
                <ScrollReveal key={member.name} delay={i * 60}>
                  <Card
                    className="border border-slate-200 overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                    onClick={() => setExpandedMember(expandedMember === member.name ? null : member.name)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 transition-transform group-hover:scale-105" />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900">{member.name}</h3>
                          <p className="text-sm text-slate-500">{member.title}</p>
                          {member.designations && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {member.designations.map((d) => (
                                <span key={d} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', expandedMember === member.name && 'rotate-180')} />
                      </div>

                      <AnimatePresence>
                        {expandedMember === member.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-slate-100">
                              <p className="text-sm text-slate-600 leading-relaxed mb-4">{member.bio}</p>
                              {member.education && member.education.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Education</p>
                                  {member.education.map((e) => (
                                    <p key={e} className="text-sm text-slate-600">{e}</p>
                                  ))}
                                </div>
                              )}
                              {member.previousRoles && member.previousRoles.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Previous Roles</p>
                                  {member.previousRoles.map((r) => (
                                    <p key={r} className="text-sm text-slate-600">{r}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}