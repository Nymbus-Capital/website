# Nymbus Capital Website

Modern, animated website for Nymbus Capital — Canada's AI-centric fixed income manager.

## Overview

Next.js 15 site featuring high-performance animations, data visualizations, and responsive design showcasing Nymbus's bond strategies and investment approach.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion + GSAP
- **Visualization**: D3.js + Chart.js
- **Components**: Aceternity UI-inspired (Background Beams, Reactive Grid, Typewriter, Moving Border)
- **Deployment**: GitHub Pages (static export)

## Design System

**Color Palette**:
- **Background**: #F8FAFC (recessed), #FAFAFA (canvas), #FFFFFF (elevated)
- **Accent**: #4285F4 (blue)
- **Text**: Neutral grays

**Typography**:
- **Font**: Poppins (headers, body)
- **Scale**: 12px baseline, 1.25x ratio

**Animation**:
- **Intensity**: 10/10 (heavy use of motion)
- **Duration**: 300-800ms for primary animations
- **Easing**: cubic-bezier for smooth transitions

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page
│   │   ├── strategies/      # Strategy pages
│   │   ├── solutions/       # Solutions pages
│   │   └── api/             # API routes (if any)
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── animations/      # Custom animation components
│   │   └── ui/              # Aceternity UI components
│   ├── lib/                 # Utility functions
│   └── styles/              # Global Tailwind styles
├── public/                  # Static assets
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── package.json
└── postcss.config.mjs       # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ (tested with 20+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Access at **http://localhost:3000**.

### Build & Export

```bash
npm run build
```

Static export goes to `./out/` directory (configured in `next.config.ts`).

### Deployment

Automatically deployed to GitHub Pages via GitHub Actions on push to `main`.

**Manual deployment**:
```bash
npm run build
# Contents of ./out/ are deployed to GitHub Pages
```

## Pages

- **Home** (`/`) – Landing page with hero, value proposition, CTA
- **Strategies** (`/strategies`) – Investment strategy overview
  - **Core Bond** (`/core-bond`) – Core bond strategy details
  - **Multi-Strategy** (`/multi-strategy`) – Multi-asset strategy
  - **Global Minimum Volatility** (`/global-minimum-volatility`) – Volatility-optimized portfolio
  - **Sustainable Enhanced Bonds** (`/sustainable-enhanced-bonds`) – ESG-focused strategy
  - **Sustainable Enhanced Short-Term Bonds** (`/sustainable-enhanced-short-term-bonds`) – Short-duration ESG strategy
- **Solutions** (`/solutions`) – Use cases and client solutions
- **Sustainability** (`/sustainability`) – ESG and impact commitment
- **Team** (`/team`) – Leadership and team bios
- **Contact** (`/contact`) – Contact form and information
- **Legal** (`/legal`) – Terms, privacy, disclaimers

## Key Components

### Animations
- **Background Beams**: Animated gradient backgrounds with beam effects
- **Reactive Grid**: Interactive grid responding to mouse movement
- **Typewriter**: Text reveal animation
- **Moving Border**: Gradient border animation
- **Fade In/Out**: Scroll-triggered animations with Framer Motion

### Data Visualizations
- **D3.js**: Custom chart implementations for performance data
- **Chart.js**: Pie, bar, and line charts for strategy metrics

## Development Workflow

1. **Feature branches**: Create branches from `main` for new features
2. **Local testing**: Run `npm run dev` and test at http://localhost:3000
3. **Commit and push**: Changes auto-deploy via GitHub Actions on merge to `main`
4. **Production**: View at https://nymbus-capital.com

## Performance Optimization

- **Image Optimization**: Next.js `<Image>` component for automatic optimization
- **Code Splitting**: Automatic by Next.js App Router
- **CSS-in-JS**: Tailwind for zero-runtime CSS
- **Lazy Loading**: Framer Motion for viewport-triggered animations
- **Static Export**: Pre-built HTML files minimize runtime overhead

## Accessibility

- **Semantic HTML**: Proper heading hierarchy, ARIA labels
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Color Contrast**: WCAG AA compliance for text/background
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Environment Variables

**`.env.local`** (local development):
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics (if used)
```

**Production** (GitHub Pages): Environment variables not needed (static site)

## Troubleshooting

### Build Fails
- Clear `.next` and `node_modules`: `rm -rf .next node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Animations Stutter
- Enable GPU acceleration: Ensure CSS transform and opacity are used
- Check performance: Use Chrome DevTools Performance tab

### Images Don't Load
- Verify `public/` directory structure
- Check Next.js `<Image>` imports and paths

## Integration Notes

### CLI Usage

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Export static site:**
```bash
npm run build  # Outputs to ./out/
```

**Type checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

### MCP / AI Agent Context

**Purpose**: Public-facing marketing website showcasing Nymbus Capital's investment strategies and brand.

**Tech Stack**:
- Frontend: Next.js 15, TypeScript, React 19
- Styling: Tailwind CSS v4 (utility-first CSS)
- Animation: Framer Motion (React), GSAP (JavaScript)
- Visualization: D3.js (custom charts), Chart.js (standard charts)
- Deployment: Next.js static export to GitHub Pages

**Key Pages**:
- Home: Hero, value prop, CTA, strategies overview
- Strategies: Detailed strategy pages with performance data
- Solutions: Use case descriptions and client benefits
- Team: Leadership profiles and bios
- Contact: Form and company information

**Build Output**:
- Static HTML files in `./out/`
- Deployed to GitHub Pages on push to `main`
- Zero-runtime JavaScript (except animations)

**Performance Targets**:
- Lighthouse score: 90+
- First Contentful Paint: <1.5s
- Cumulative Layout Shift: <0.1
- Time to Interactive: <2.5s

**Styling Approach**:
- Tailwind CSS for utility-first styling
- No global CSS variables (use Tailwind for consistency)
- Responsive design (mobile-first)
- Dark mode support (if implemented)

**Animation Performance**:
- GPU-accelerated transforms (translate, scale, rotate)
- Avoid animating expensive properties (width, height, left, top)
- Use `will-change` sparingly for performance
- Disable animations for `prefers-reduced-motion`
