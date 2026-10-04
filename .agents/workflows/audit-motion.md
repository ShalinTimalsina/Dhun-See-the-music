---
name: audit-motion
description: Audit animations against the music platform motion rules — instrument-responsive motion only, no scattered animations.
---

# Workflow: Audit Motion

1. **Read the motion rules** in `.agents/rules/motion.md`
2. **Inventory all animations** in the target page/component:
   - List every `motion.*` component, CSS animation, and transition
   - For each: what user action triggers it? What does it communicate?
3. **Check: is every animation instrument-responsive?**
   - ✅ Note lights up on play → valid
   - ✅ Shape slides on capo change → valid
   - ✅ Circle of fifths rotates on key change → valid
   - ✅ Cross-fade between highlighted note sets on selection change → valid
   - ❌ Scattered entrance animation on page load → remove
   - ❌ Hover transition on informational card → remove
   - ❌ Infinite loop on static content → remove
4. **Check allowed properties:**
   - Only `transform` and `opacity` animated?
   - No `width`, `height`, `top`, `left` animations?
5. **Check easings:**
   - Entrances use `ease-out`?
   - Exits use `ease-in`?
   - No `ease-in-out` or `linear` on UI elements?
   - Spring physics on instrument interactions?
6. **Check reduced motion:**
   - `useReducedMotion()` present in every animated client component?
   - Under reduced motion: transforms instant, opacity ≤ 150ms?
7. **Check hover gating:**
   - Hover effects behind `@media (hover: hover)`?
   - Touch devices get `:active` feedback instead?
8. **Implement fixes** for any violations
9. **Re-test** with `prefers-reduced-motion: reduce` enabled
