'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export default function TeamPage() {
  const t = useTranslations('team');

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: t('roles.founder'),
      image: '/images/team/sarah.jpg',
      bio: t('bios.sarah'),
      social: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen',
      },
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: t('roles.cto'),
      image: '/images/team/michael.jpg',
      bio: t('bios.michael'),
      social: {
        linkedin: 'https://linkedin.com/in/mrodriguez',
        github: 'https://github.com/mrodriguez',
      },
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: t('roles.head_design'),
      image: '/images/team/emily.jpg',
      bio: t('bios.emily'),
      social: {
        linkedin: 'https://linkedin.com/in/emilywatson',
        twitter: 'https://twitter.com/emilywatson',
      },
    },
    {
      id: '4',
      name: 'James Park',
      role: t('roles.lead_engineer'),
      image: '/images/team/james.jpg',
      bio: t('bios.james'),
      social: {
        linkedin: 'https://linkedin.com/in/jpark',
        github: 'https://github.com/jpark',
      },
    },
  ];

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            {t('subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('cta')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="py-20 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg mb-4 bg-slate-800 aspect-square">
                {member.image && (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={() => {
                      console.warn(`Failed to load image: ${member.image}`);
                    }}
                  />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-blue-400 text-sm font-semibold mb-3">{member.role}</p>
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">{member.bio}</p>
              
              {member.social && (
                <div className="flex gap-3">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.437-.103.25-.129.599-.129.948v5.42h-3.554s.047-8.733 0-9.646h3.554v1.364c.429-.663 1.196-1.608 2.907-1.608 2.122 0 3.716 1.388 3.716 4.368v5.522zM5.337 9.433c-1.144 0-1.915-.759-1.915-1.709 0-.968.771-1.708 1.96-1.708 1.188 0 1.914.74 1.939 1.708 0 .95-.751 1.709-1.984 1.709zm1.946 11.019H3.39V9.786h3.893v10.666zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                      </svg>
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 002.856-3.915 3.969 3.969 0 01-1.161 1.409c.15.013.3.023.45.023a7.118 7.118 0 003.747-1.027v-.71a7.118 7.118 0 00-6.283 3.492 3.939 3.939 0 01-6.725 3.636 10.009 10.009 0 01-7.69-3.992 3.94 3.94 0 001.218 5.259 3.92 3.92 0 01-1.805-.497v.05a3.93 3.93 0 003.15 3.854 3.936 3.936 0 01-1.772.067 3.939 3.939 0 003.674 2.73A7.898 7.898 0 010 19.54a10.07 10.07 0 005.455 1.6 10.006 10.006 0 0010-10v-.456a7.118 7.118 0 001.743-1.823z" />
                      </svg>
                    </a>
                  )}
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-12">{t('values.title')}</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {['innovation', 'collaboration', 'excellence'].map((value) => (
              <motion.div
                key={value}
                variants={itemVariants}
                className="p-6 rounded-lg bg-slate-700/50"
              >
                <h3 className="text-xl font-bold text-blue-400 mb-3">
                  {t(`values.${value}`)}
                </h3>
                <p className="text-slate-300">
                  {t(`values.${value}_description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}