'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, X, ExternalLink, Award, BookOpen, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils';
import { team, TeamMember, departmentLabels } from '@/data/team';
import { timeline, values } from '@/data/timeline';
import AnimatedCounter from '@/components/animations/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

type Department = "Leadership" | "Quantitative Research" | "Investment Team" | "Operations" | "Board" | "All";

const departmentOrder: Department[] = ["All", "Leadership", "Quantitative Research", "Investment Team", "Operations", "Board"];

const getDepartmentLabel = (dept: Department): string => {
  if (dept === "All") return "All";
  return dept;
};

const filterTeamByDepartment = (dept: Department): TeamMember[] => {
  if (dept === "All") return team;
  return team.filter(member => member.department === dept);
};

interface TeamModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

function TeamMemberModal({ member, isOpen, onClose }: TeamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>
              <p className="text-lg text-blue-600 font-semibold">{member.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">About</h4>
            <p className="text-slate-600 leading-relaxed">{member.bio}</p>
          </div>

          {member.education && member.education.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Education
              </h4>
              <div className="space-y-2">
                {member.education.map((edu, idx) => (
                  <p key={idx} className="text-slate-600">{edu}</p>
                ))}
              </div>
            </div>
          )}

          {member.designations && member.designations.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Designations
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.designations.map((des, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {des}
                  </span>
                ))}
              </div>
            </div>
          )}

          {member.previousRoles && member.previousRoles.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Previous Roles
              </h4>
              <ul className="space-y-2">
                {member.previousRoles.map((role, idx) => (
                  <li key={idx} className="text-slate-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {member.yearJoined && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">Joined Nymbus in {member.yearJoined}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamMemberCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        x: 8,
        boxShadow: `0 20px 40px rgba(66, 133, 244, 0.15)`,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        x: 0,
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
    <Card
      onClick={onClick}
      className="cursor-pointer overflow-hidden group"
    >
      <div className="border-l-4" style={{ borderColor: member.color }}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
              <p className="text-blue-600 font-semibold text-sm">{member.title}</p>
            </div>
          </div>

          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full mb-3">
            {member.department}
          </span>

          <p className="text-slate-600 text-sm line-clamp-2 mb-4">{member.bio}</p>

          {(member.education || member.designations) && (
            <div className="space-y-2 mb-4">
              {member.education && (
                <div className="flex flex-wrap gap-1">
                  {member.education.slice(0, 2).map((edu, idx) => (
                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {edu.split(',')[0]}
                    </span>
                  ))}
                </div>
              )}
              {member.designations && (
                <div className="flex flex-wrap gap-1">
                  {member.designations.map((des, idx) => (
                    <span key={idx} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-semibold">
                      {des}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View profile →
          </button>
        </div>
      </div>
    </Card>
  );
}

function TimelineSection() {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(lineRef.current, {
      attr: { y2: lineRef.current.getAttribute('y2') || '0' },
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        markers: false,
      },
    });
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Journey"
            title="Building Excellence Since 2013"
            description="From our founding through strategic growth, we've consistently delivered institutional-quality systematic investing."
          />
        </ScrollReveal>

        <div className="timeline-container mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
            <svg className="absolute left-1/2 top-0 h-full w-0.5 transform -translate-x-1/2 hidden md:block" style={{ background: 'linear-gradient(to bottom, #4285f4, #93c5fd)' }}>
              <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" stroke="#4285f4" strokeWidth="2" />
            </svg>

            {timeline.map((milestone, index) => (
              <ScrollReveal key={milestone.year} delay={index * 100}>
                <div className={cn("md:col-span-1", index % 2 === 1 && "md:translate-y-8")}>
                  <Card className="border-l-4 border-blue-600">
                    <div className="p-6">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600">{milestone.description}</p>
                    </div>
                  </Card>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Core Values"
            title="What Drives Us"
            description="Our values guide every decision we make and shape how we serve our clients."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-16">
          {values.map((value, index) => (
            <ScrollReveal key={value.title} delay={index * 100}>
              <Card className="text-center h-full">
                <div className="p-6 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-6 h-6 text-blue-600">★</div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{value.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
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
    <section className="py-20 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <ScrollReveal>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                $1<AnimatedCounter target={1} prefix="" suffix="B" />
              </div>
              <p className="text-blue-100">Assets Under Management</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter target={11} />
              </div>
              <p className="text-blue-100">Team Members</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                2013
              </div>
              <p className="text-blue-100">Year Founded</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                10+
              </div>
              <p className="text-blue-100">Institutional Mandates</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default function TeamPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>("All");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const filteredTeam = filterTeamByDepartment(selectedDepartment);

  useEffect(() => {
    if (!filterRef.current) return;

    gsap.from(filterRef.current.querySelectorAll('button'), {
      opacity: 0,
      y: -10,
      duration: 0.4,
      stagger: 0.05,
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Our Team
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                World-class investors, researchers, and operators dedicated to systematic excellence.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Department Filter - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2" ref={filterRef}>
            {departmentOrder.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm",
                  selectedDepartment === dept
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {getDepartmentLabel(dept)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeam.map((member, index) => (
              <ScrollReveal key={member.name} delay={index * 50}>
                <TeamMemberCard
                  member={member}
                  onClick={() => setSelectedMember(member)}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection />

      {/* Values Section */}
      <ValuesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Modal */}
      <TeamMemberModal
        member={selectedMember!}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}