/**
 * Data Abstraction Layer
 *
 * This module provides async fetcher functions for all dynamic content.
 * Currently returns static data from local TypeScript files.
 *
 * WORDPRESS MIGRATION:
 * When ready to connect to a headless WordPress backend, replace the
 * implementations below with fetch() calls to the WordPress REST API.
 *
 * Example:
 *   // Before (static):
 *   export async function getTeamMembers() { return team; }
 *
 *   // After (WordPress):
 *   export async function getTeamMembers() {
 *     const res = await fetch('https://cms.nymbus.ca/wp-json/wp/v2/team-members?per_page=100');
 *     const data = await res.json();
 *     return data.map(mapWPTeamMember);
 *   }
 *
 * The component interfaces (TeamMember, Fund, NewsItem, etc.) remain
 * unchanged — only the data source swaps.
 *
 * HOSTING NOTE:
 * To support ISR (Incremental Static Regeneration) with WordPress webhooks,
 * switch from `output: "export"` in next.config.ts to server-side hosting
 * (Vercel, AWS, etc.) and add `revalidate` to each fetch function.
 */

import { team, departmentLabels, type TeamMember, type Department } from '@/data/team';
import { funds, fundBySlug, fundsByAssetClass, type Fund } from '@/data/funds';

// ============================================================
// NEWS / MILESTONES
// ============================================================

export interface NewsItem {
  date: string;
  title: string;
  category: string;
  description: string;
  image: string;
  article: string;
  link: string;
}

/**
 * Fetch all news items.
 * WordPress migration: GET /wp-json/wp/v2/posts?categories=news&_embed
 */
export async function getNewsItems(): Promise<NewsItem[]> {
  // Static data — replace with WordPress REST API call
  const { newsItems } = await import('@/data/news');
  return newsItems;
}

// ============================================================
// TEAM MEMBERS
// ============================================================

export type { TeamMember, Department };

/**
 * Fetch all team members.
 * WordPress migration: GET /wp-json/wp/v2/team-members?per_page=100&_embed
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  return team;
}

/**
 * Fetch team members filtered by department (including additionalDepartments).
 * WordPress migration: GET /wp-json/wp/v2/team-members?department=investment-team
 */
export async function getTeamByDepartment(dept: Department): Promise<TeamMember[]> {
  return team.filter(
    (m) => m.department === dept || m.additionalDepartments?.includes(dept)
  );
}

/**
 * Get available department labels.
 * WordPress migration: GET /wp-json/wp/v2/departments
 */
export async function getDepartmentLabels(): Promise<readonly string[]> {
  return departmentLabels;
}

// ============================================================
// FUNDS / STRATEGIES
// ============================================================

export type { Fund };

/**
 * Fetch all funds.
 * WordPress migration: GET /wp-json/wp/v2/funds?per_page=100&_embed
 */
export async function getFunds(): Promise<Fund[]> {
  return funds;
}

/**
 * Fetch a single fund by slug.
 * WordPress migration: GET /wp-json/wp/v2/funds?slug=sustainable-enhanced-bonds
 */
export async function getFundBySlug(slug: string): Promise<Fund | undefined> {
  return fundBySlug(slug);
}

/**
 * Fetch funds filtered by asset class.
 * WordPress migration: GET /wp-json/wp/v2/funds?asset_class=fixed-income
 */
export async function getFundsByAssetClass(assetClass: Fund['assetClass']): Promise<Fund[]> {
  return fundsByAssetClass(assetClass);
}

// ============================================================
// SITE STATS (homepage counters)
// ============================================================

export interface SiteStats {
  aum: { value: number; prefix: string; suffix: string; label: string };
  strategies: { value: number; prefix: string; suffix: string; label: string };
  professionals: { value: number; prefix: string; suffix: string; label: string };
  trackRecord: { value: number; prefix: string; suffix: string; label: string };
}

/**
 * Fetch homepage statistics.
 * WordPress migration: GET /wp-json/nymbus/v1/site-stats (custom endpoint)
 */
export async function getSiteStats(): Promise<SiteStats> {
  return {
    aum: { value: 1.5, prefix: '$', suffix: 'B+', label: 'Assets Under Management' },
    strategies: { value: 5, prefix: '', suffix: '', label: 'Investment Strategies' },
    professionals: { value: 9, prefix: '', suffix: '', label: 'Investment Professionals' },
    trackRecord: { value: 10, prefix: '', suffix: '+', label: 'Years of Track Record' },
  };
}

// ============================================================
// CLIENT LOGOS
// ============================================================

export interface ClientLogo {
  name: string;
  url: string;
}

/**
 * Fetch client/partner logos.
 * WordPress migration: GET /wp-json/wp/v2/media?media_category=client-logos
 */
export async function getClientLogos(): Promise<ClientLogo[]> {
  return [
    { name: 'FMOQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fmoq.png' },
    { name: 'PGEQ', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-pgeq-fr.png' },
    { name: 'Fondaction', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-fondaction.png' },
    { name: 'GardaWorld', url: 'https://www.nymbus.ca/wp-content/uploads/2024/01/logo-gardaworld.png' },
  ];
}

// ============================================================
// WORDPRESS ADAPTER HELPERS (for future use)
// ============================================================

/**
 * Maps a WordPress REST API team member response to our TeamMember interface.
 * Uncomment and use when connecting to WordPress.
 */
// function mapWPTeamMember(wp: any): TeamMember {
//   return {
//     name: wp.title.rendered,
//     title: wp.acf.job_title,
//     titleFr: wp.acf.job_title_fr,
//     department: wp.acf.department,
//     additionalDepartments: wp.acf.additional_departments || [],
//     bio: wp.acf.biography,
//     summary: wp.acf.one_liner,
//     education: wp.acf.education || [],
//     designations: wp.acf.designations || [],
//     previousRoles: wp.acf.previous_roles || [],
//     yearJoined: wp.acf.year_joined,
//     initials: wp.acf.initials,
//     color: wp.acf.color || '#1a365d',
//     photo: wp._embedded?.['wp:featuredmedia']?.[0]?.source_url,
//   };
// }

/**
 * Maps a WordPress REST API post to our NewsItem interface.
 * Uncomment and use when connecting to WordPress.
 */
// function mapWPNewsItem(wp: any): NewsItem {
//   return {
//     date: new Date(wp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
//     title: wp.title.rendered,
//     category: wp._embedded?.['wp:term']?.[0]?.[0]?.name || 'News',
//     description: wp.excerpt.rendered.replace(/<[^>]+>/g, ''),
//     image: wp._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
//     article: wp.content.rendered.replace(/<[^>]+>/g, ''),
//     link: wp.link,
//   };
// }