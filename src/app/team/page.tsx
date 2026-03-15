'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import { team as teamMembers } from '@/data/team';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12">
        <SectionHeader
          title="Meet Our Team"
          subtitle="Dedicated professionals committed to exceptional investment management"
        />
      </section>

      {/* Department Filter */}
      <section className="px-6 py-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {departments.map((dept) => (
              <motion.button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeDepartment === dept
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {dept}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-6">
            Showing {filteredMembers.length} of {teamMembers.length} team members
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDepartment}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400/50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                        <p className="text-amber-400 text-sm font-medium">{member.title}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-700 text-xs font-medium text-gray-300 rounded-full">
                        {member.department}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Culture Section */}
      <section className="px-6 py-20 md:px-12 bg-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Culture</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            We believe exceptional investment outcomes come from combining diverse talents, rigorous research, and a commitment to continuous improvement. Our team is united by a passion for innovation and a dedication to serving our clients with integrity.
          </p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-amber-400 mb-2">{teamMembers.length}</p>
              <p className="text-gray-300">Team Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400 mb-2">{departments.length - 1}</p>
              <p className="text-gray-300">Departments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400 mb-2">100%</p>
              <p className="text-gray-300">Commitment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
