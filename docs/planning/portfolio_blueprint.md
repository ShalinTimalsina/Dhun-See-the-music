# Premium Project Blueprint & Master Prompt

This document breaks down the working principles, rules, workflows, and skills that power **Shalin's Portfolio**, and provides a master prompt to replicate this level of quality in a new project.

## 1. How the Portfolio Architecture Works

Your portfolio isn't just a codebase; it's an **Agentic Environment**. It works by wrapping the AI in a strict set of rules, skills, and workflows so it never defaults to "cheap AI" code or design.

### The Core Principles

- **The Concept**: A site that feels like infrastructure—precise, quiet, reliable, beautifully engineered.
- **The Tech Stack**: Next.js 15 App Router (RSC, API routes), TypeScript (strict), Tailwind CSS 4, shadcn/ui + Radix, Motion (Framer Motion), PostgreSQL + Drizzle ORM.
- **Project Governance (`AGENTS.md`)**: Acts as the constitution. It defines the folder map, coding conventions (Server Components by default, zero `any` types), and banned practices (no `dangerouslySetInnerHTML`, no animating width/height).

### How Skills Work

Skills (like `high-end-visual-design`, `emil-design-eng`, `animate`) are specialized AI prompt modifiers. When you ask the AI to do a task, it dynamically loads these skills to gain deep expertise.

- **Design Taste**: Skills like `design-taste-frontend` prevent the AI from generating generic "slop" by forcing it to use rich aesthetics, dynamic interactions, and proper typography.
- **Motion**: The `animate` and `emil-design-eng` skills teach the AI the physics of premium motion (springs, gestures, hardware-accelerated properties).

### How Workflows Work

Workflows are step-by-step runbooks for the AI to follow to ensure consistent quality.

- **/new-section**: Generates imagery, designs the section, implements it, and audits it against the rules.
- **/audit-design & /audit-motion**: Enforces a self-correction loop where the AI reviews its own work against your `DESIGN.md` and `MOTION.md` rules before showing it to you.
- **/pre-deploy**: A checklist (lint, typecheck, Lighthouse, Axe) the AI runs before the feature is considered done.

### The Guidelines (Rules)

Your environment has strict rules loaded globally to enforce standard constraints:

- **Design (`rules/design.md`)**: Dark-first, ONE accent color, no banned generic fonts, "double-bezel" nested cards, Phosphor Light icons only.
- **Motion (`rules/motion.md`)**: Animate ONLY `transform` and `opacity`. Use `--ease-out` for entrances. `ease-in-out` is banned on UI elements.
- **Accessibility (`rules/a11y.md`)**: WCAG 2.2 AA, visible focus rings, 44x44px min touch targets, zero axe-core violations.
- **Content (`rules/content.md`)**: Honest tiers (Daily/Working/Learning), no buzzwords ("passionate about"), active voice.

---

## 2. The Master Prompt for Your New Project

Copy and paste the prompt below into a new AI conversation (or system prompt) when you are ready to build your next project. It bundles all of your Shalin Portfolio DNA into one set of instructions.

```text
You are an elite Frontend Design Engineer and Architect. We are building a new premium web application. You must follow these strict guidelines to ensure the project feels expensive, precise, and flawlessly engineered.

### 1. Technology Stack
- **Core**: Next.js 15 App Router, TypeScript (Strict).
- **Styling**: Tailwind CSS 4.
- **Components**: shadcn/ui + Radix primitives.
- **Motion**: Motion (formerly Framer Motion).
- **Data**: PostgreSQL + Drizzle ORM, Zod for validation.

### 2. Coding Conventions
- **Components**: One component per file. Named exports matching the filename. Server Components by default; use `"use client"` only when hooks/events are needed.
- **Imports**: Absolute imports via `@/` alias. No barrel exports (`index.ts` re-exports).
- **Types**: NO `any` or `as unknown as T`. Fix the type.
- **Security**: NEVER use `dangerouslySetInnerHTML`, `eval()`, or `new Function()`.

### 3. High-End Visual Design Rules
- **Aesthetic**: Dark-first. Light mode is not an afterthought, but dark mode must look stunning.
- **Color**: ONE primary accent color. No secondary accents. Avoid generic colors; use tailored HSL values.
- **Typography**: NEVER use Inter, Roboto, Arial, or Open Sans. Use modern, premium fonts (e.g., Outfit, Geist).
- **Architecture**: Use nested "double-bezel" card architectures for depth.
- **Icons**: Use fine-line icons (e.g., Phosphor Light). No thick-stroked defaults.
- **Slop Ban**: Do not use generic, cheap-AI landing page patterns. Ensure high contrast, sparse typography, and intentional white space.

### 4. Motion & Animation Rules (Emil Kowalski style)
- **Properties**: Animate ONLY `transform` and `opacity`. NEVER animate `width`, `height`, `top`, or `left`.
- **Easings**: Default to `ease-out` for entrances and `ease-in` for exits. `ease-in-out` and `linear` are BANNED for UI elements.
- **Performance**: Reduced motion support must ship with the animation.
- **Moments**: One memorable hero animation moment; everything else should be a fast, snappy fade-up.

### 5. Accessibility & Content
- **A11y**: WCAG 2.2 AA compliance. Every interactive element must have a visible focus ring and a 44x44px min touch target.
- **Copy**: Active voice, first-person, concise. No buzzwords (e.g., "passionate about", "results-driven"). CTAs must be specific.

### 6. Workflow (Definition of Done)
Before delivering any feature, you must ensure:
1. It passes TypeScript compilation and ESLint.
2. It has zero accessibility violations.
3. It is fully responsive (360px to 1920px).
4. Both dark and light themes are tested.
5. All animations run at 60fps and respect reduced motion.

When I ask you to build a feature or page, plan it out first, design it mentally according to these rules, and then write the complete code. Let's begin. What would you like to build first?
```

---

## 3. The Agentic Environment Setup (How to Port It)

To perfectly replicate this environment in a new project, you don't need to manually download each skill individually. Because they are localized in your workspace, you can instantly port the entire "brain" (Skills, Workflows, and Rules) by copying the folder.

### Porting the Environment (The Command)

Run this in your terminal to initialize your new project with this exact agentic environment. This copies all your custom behaviors into the new folder so any Antigravity-based AI will immediately recognize them:

```bash
# Navigate to the folder where you want your new project
cd \path\to\your\new\project

# Copy the entire .agents directory from the portfolio (Windows PowerShell)
Copy-Item -Recurse -Force "e:\Portfolio Shalin\.agents" .

# Copy the AGENTS.md governance file
Copy-Item "e:\Portfolio Shalin\AGENTS.md" .
```

---

## 4. The Complete Inventory

Here is the exhaustive list of everything that makes up your agentic system. You can paste this list to your AI so it knows exactly what tools it has at its disposal in the new project.

### 🧠 Skills (Agent Personas & Capabilities)

These dictate _how_ the AI thinks, designs, and builds.

- **`design-taste-frontend`**: Anti-slop frontend skill for premium aesthetics.
- **`high-end-visual-design`**: Enforces exact fonts, spacing, shadows, and card structures that feel expensive.
- **`emil-design-eng`**: UI polish and animation philosophy (Emil Kowalski style).
- **`animate`**: Builds animations from scratch with proper physics and easings.
- **`apple-design`**: Apple's approach to interface design and fluid, physical motion.
- **`image-to-code` & `imagegen-frontend-web`**: Generates high-end design references and accurately converts them to code.
- **`minimalist-ui` & `industrial-brutalist-ui`**: Specific aesthetic modes.
- **`page-mascot`**: Logic for cursor-tracking mascots and sprite atlases.
- **`mobile-native`**: Fixes the 100vh bug, tap highlights, and makes web apps feel like native mobile apps.
- **`brandkit`**: Premium brand-kit and visual identity generation.
- **`seo` (and sub-skills)**: A comprehensive suite for Core Web Vitals, Schema, local SEO, content briefs, and search optimization.

### 🔄 Workflows (Standard Operating Procedures)

These dictate the _process_ the AI must follow.

- **`/new-section`**: E2E process for adding a section (Generate image -> Design -> Implement -> Audit).
- **`/audit-design`**: Cross-references the current page against `DESIGN.md` and the banned AI-patterns list.
- **`/audit-motion`**: Cross-references the page's animations against `MOTION.md`.
- **`/audit-a11y`**: Comprehensive accessibility check (WCAG 2.2 AA).
- **`/pre-deploy`**: Final checks before shipping (Lint, Typecheck, Lighthouse, Axe).
- **`/new-blog-feature` & `/new-terminal-command`**: Specific workflows for core features.

### 📜 Strict Rules & Regulations

These are the hard constraints that the AI cannot violate.

- **`AGENTS.md`**: The project constitution. Strict TypeScript, Server Components by default, absolute imports.
- **`design.md`**: Dark-first, single accent color, no Inter/Roboto, Phosphor Light icons only.
- **`motion.md`**: Animate ONLY transform/opacity. `--ease-out` for enter, `--ease-in` for exit. Linear/ease-in-out are banned.
- **`a11y.md`**: WCAG 2.2 AA, visible focus rings, 44x44px touch targets.
- **`content.md`**: Honest skill tiers (Daily/Working/Learning), active voice, no corporate buzzwords.
- **`security.md`**: No `dangerouslySetInnerHTML`, `eval()`, or unescaped user input.
- **`definition-of-done.md`**: The final gate. Code must pass lint, typecheck, build, Lighthouse >=95, and zero Axe violations before completion.
