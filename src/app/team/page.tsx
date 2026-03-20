'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { teamMembers, departmentLabels, departmentLabelsFr } from '@/data/team';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function TeamPage() {
  const { t, locale } = useTranslation();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const departmentMap = locale === 'fr' ? departmentLabelsFr : departmentLabels;
  const filteredMembers = selectedDepartment
    ? teamMembers.filter(m => m.department === selectedDepartment)
    : teamMembers;

  const metrics = [
    {
      value: teamMembers.length,
      label: t('team.metrics.members'),
      labelFr: 'Membres de l\'équipe'
    },
    {
      value: 18,
      label: t('team.metrics.experience'),
      labelFr: 'Années moyennes d\'expérience'
    },
    {
      value: 12,
      label: t('team.metrics.cfa'),
      labelFr: 'Charterholders CFA'
    },
    {
      value: 14,
      label: t('team.metrics.advancedDegrees'),
      labelFr: 'Diplômes avancés'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('team.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Une équipe de professionnels expérimentés dédiée à l\'excellence en gestion d\'investissements.'
              : t('team.subtitle')}
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-2">
                  <AnimatedCounter to={metric.value} />
                  {metric.value >= 10 && '+'}
                </div>
                <p className="text-slate-300 text-sm uppercase tracking-wide">
                  {locale === 'fr' ? metric.labelFr : metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            <button
              onClick={() => setSelectedDepartment(null)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedDepartment === null
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {locale === 'fr' ? 'Tous' : 'All'}
            </button>
            {Object.entries(departmentMap).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedDepartment(key)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedDepartment === key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className="bg-slate-700/50 rounded-lg p-6 cursor-pointer hover:bg-slate-600/50 transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 mx-auto border-2 border-emerald-500/50">
                  <span className="text-2xl font-bold text-emerald-400">{member.initials}</span>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-1">{member.name}</h3>
                <p className="text-emerald-400 text-center text-sm font-semibold mb-3">
                  {locale === 'fr' && member.titleFr ? member.titleFr : member.title}
                </p>
                <p className="text-slate-300 text-sm text-center">
                  {locale === 'fr' && member.summaryFr ? member.summaryFr : member.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Member Details */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {teamMembers.find(m => m.id === selectedMember) && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {teamMembers.find(m => m.id === selectedMember)?.name}
                    </h2>
                    <p className="text-emerald-400 font-semibold">
                      {locale === 'fr'
                        ? teamMembers.find(m => m.id === selectedMember)?.titleFr
                        : teamMembers.find(m => m.id === selectedMember)?.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-slate-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-300 mb-4">
                  {locale === 'fr'
                    ? teamMembers.find(m => m.id === selectedMember)?.bioFr
                    : teamMembers.find(m => m.id === selectedMember)?.bio}
                </p>
                <div className="border-t border-slate-600 pt-4">
                  <p className="text-slate-400">
                    <strong>{locale === 'fr' ? 'Éducation' : 'Education'}:</strong>{' '}
                    {teamMembers.find(m => m.id === selectedMember)?.education.join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}