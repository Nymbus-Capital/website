'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { team, teamByDepartment, TeamMember } from '@/data/team';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const departments = [
  'Leadership',
  'Investment Team',
  'Quantitative Research',
  'Operations',
] as const;

const departmentDescriptions: Record<string, string> = {
  Leadership: 'Strategic vision and business leadership',
  'Investment Team': 'Portfolio management and investment execution',
  'Quantitative Research': 'Research, modeling, and systematic development',
  Operations: 'Operations, compliance, and client relations',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="h-full p-6 flex flex-col">
        {/* Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#4285F4] text-xs font-semibold rounded-full border border-blue-100">
            {member.department}
          </span>
        </div>

        {/* Name & Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
        <p className="text-[#4285F4] font-semibold text-sm mb-4">{member.title}</p>

        {/* Bio */}
        <p className="text-slate-600 text-sm leading-relaxed flex-grow">{member.bio}</p>
      </Card>
    </motion.div>
  );
}

export default function TeamPage() {
  const [activeDept, setActiveDept] = useState<typeof departments[number]>('Leadership');
  const deptTeam = teamByDepartment(activeDept);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              title="Our Team"
              description="14 professionals driving systematic alpha"
            />
            <p className="text-lg text-slate-600 mt-6 max-w-2xl">
              We combine world-class investment talent, cutting-edge quantitative research, and
              rigorous operational discipline to deliver consistent, systematic returns.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {departments.map((dept) => (
                <motion.button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base',
                    activeDept === dept
                      ? 'bg-[#4285F4] text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#4285F4] hover:text-[#4285F4]'
                  )}
                >
                  {dept}
                </motion.button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Department Description */}
          <ScrollReveal direction="up">
            <div className="mb-12">
              <p className="text-slate-600 text-lg italic">
                {departmentDescriptions[activeDept]}
              </p>
            </div>
          </ScrollReveal>

          {/* Grid with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDept}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {deptTeam.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Team Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 pt-12 border-t border-slate-200"
          >
            <p className="text-center text-slate-600">
              <span className="font-bold text-2xl text-slate-900">{team.length}</span> team
              members across {departments.length} departments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="OUR CULTURE"
              title="Collaboration, Rigor, and Excellence"
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Scientific Rigor',
                  desc: 'Evidence-based decision making and systematic approach to investment management.',
                },
                {
                  title: 'Collaborative Culture',
                  desc: 'Cross-functional teams working together to solve complex investment challenges.',
                },
                {
                  title: 'Continuous Learning',
                  desc: 'Ongoing research, development, and knowledge sharing across the organization.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}