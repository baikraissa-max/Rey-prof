import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Github, Sparkles, FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const featuredProject = projects.find((p) => p.featured) || projects[0];
  const otherProjects = projects.filter((p) => p.id !== featuredProject?.id);

  return (
    <section id="projects" className="py-12 px-4 max-w-2xl mx-auto">
      {/* Editorial Section Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold font-heading">
          03 // Selected Works
        </span>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      {/* 1. High-Impact Editorial Spotlight for Featured Project */}
      {featuredProject && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl liquid-glass overflow-hidden mb-6 group border border-white/[0.12] hover:border-white/[0.22] transition-all duration-300"
        >
          {/* Subtle Project Image with Dark Liquid Gradient Mask */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={featuredProject.imageUrl}
              alt={featuredProject.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            {/* Deep fluid glass gradient scrim */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(14, 16, 23, 0.2) 0%, rgba(10, 11, 16, 0.8) 60%, #08090d 100%)'
              }}
            />

            {/* Featured Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-[11px] font-medium tracking-wide text-neutral-200">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Featured Highlight
              </span>
            </div>

            {featuredProject.year && (
              <div className="absolute top-4 right-4 z-10">
                <span className="text-xs font-mono text-neutral-400 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  {featuredProject.year}
                </span>
              </div>
            )}
          </div>

          {/* Editorial Content Below Scrim */}
          <div className="p-6 sm:p-8 -mt-12 relative z-10">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-300/90 mb-1">
              {featuredProject.category}
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 font-heading">
              {featuredProject.title}
            </h3>

            {featuredProject.tagline && (
              <p className="text-sm font-medium text-neutral-300 mb-3">
                {featuredProject.tagline}
              </p>
            )}

            <p className="text-sm text-neutral-400 leading-relaxed font-normal mb-6 max-w-xl">
              {featuredProject.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={featuredProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass text-xs font-medium text-white border border-white/15 hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {featuredProject.githubUrl && (
                <a
                  href={featuredProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Secondary Editorial List (Asymmetric & Distinct, NOT identical cards) */}
      <div className="space-y-4">
        {otherProjects.map((project, idx) => (
          <motion.div
            key={project.id || idx}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.08 }}
            className="group relative rounded-2xl liquid-glass p-5 sm:p-6 transition-all duration-300 border border-white/[0.08] hover:border-white/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {project.category}
                  </span>
                  {project.year && (
                    <span className="text-[11px] font-mono text-neutral-500">
                      • {project.year}
                    </span>
                  )}
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-neutral-100 font-heading">
                  {project.title}
                </h4>

                {project.tagline && (
                  <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-0.5 mb-2">
                    {project.tagline}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                  {project.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center liquid-glass text-neutral-300 hover:text-white border border-white/10 hover:border-white/25 transition-all hover:scale-105 active:scale-95"
                  title="Open Project"
                  aria-label={`Open ${project.title}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    title="View Source"
                    aria-label={`View source of ${project.title}`}
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
