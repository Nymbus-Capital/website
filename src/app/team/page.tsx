'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { team, departmentLabels, TeamMember } from '@/data/team';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import { cn } from '@/lib/utils';
import { Users, Award, GraduationCap, Building2, X, Briefcase } from 'lucide-react';

export default function TeamPage() {
  const [activeDept, setActiveDept] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const departments = ['All', ...departmentLabels];
  const sortOrder = ['Leadership', 'Quantitative Research', 'Investment Team', 'Operations', 'Board'];
  const filtered = activeDept === 'All'
    ? [...team].sort((a, b) => sortOrder.indexOf(a.department) - sortOrder.indexOf(b.department))
    : team.filter((m) => m.department === activeDept);

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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            >
              {filtered.map((member, i) => (
                <ScrollReveal key={member.name} delay={i * 60}>
                  <Card
                    className="border border-slate-200 overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-24 h-24 rounded-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div
                              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.initials}
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                        </div>
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
                          {member.summary && <p className="text-sm text-slate-500 italic mt-1">{member.summary}</p>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {selectedMember.photo ? (
                    <img src={selectedMember.photo} alt={selectedMember.name} className="w-32 h-32 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto" style={{ backgroundColor: selectedMember.color }}>
                      {selectedMember.initials}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-blue-500 rounded-full border-3 border-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedMember.name}</h2>
                <p className="text-slate-500 mt-1">{selectedMember.title}</p>
                {selectedMember.designations && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {selectedMember.designations.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{d}</span>
                    ))}
                  </div>
                )}
                {selectedMember.summary && <p className="text-sm text-slate-500 italic mt-3">{selectedMember.summary}</p>}
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{selectedMember.bio}</p>
                {selectedMember.education && selectedMember.education.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Education</p>
                    {selectedMember.education.map((e) => <p key={e} className="text-sm text-slate-600">{e}</p>)}
                  </div>
                )}
                {selectedMember.previousRoles && selectedMember.previousRoles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Previous Roles</p>
                    {selectedMember.previousRoles.map((r) => <p key={r} className="text-sm text-slate-600">{r}</p>)}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
