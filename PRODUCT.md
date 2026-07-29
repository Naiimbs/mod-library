# Product

## Register

product

## Users

Developers and designers inside Saudi government entities who build services on the DGA
(Digital Government Authority) design system. They arrive mid-task: looking up a token name,
copying a utility class, checking a component variant against Figma. Bilingual context:
interfaces they ship must work in Arabic (RTL) and English (LTR).

## Product Purpose

A self-hosted documentation site for the DGA design system: a vanilla HTML/CSS/JS component
library plus the official DGATheme token set (colors, spacing, radius, typography, utility
classes). Success = a developer finds and copies the right token or component markup in
seconds, and what the docs show is exactly what the loaded CSS resolves (values are read
live via getComputedStyle, never hardcoded).

## Brand Personality

Official, precise, calm. Government-grade trust carried by the Saudi green (`--sa-600`
#1B8354) used for selection and action only, on quiet gray-neutral surfaces. Reference
quality bar: Tailwind CSS docs (color scales, copy-to-clipboard ergonomics) and the DGA
official website (restraint, clarity, bilingual correctness).

## Anti-references

- Marketing-page decoration on docs surfaces: gradients as ornament, hero metrics, glass cards.
- Dense unlabeled swatch dumps where you can't tell which token you're looking at.
- Docs that drift from the CSS (hardcoded values in documentation).
- Broken RTL: mirrored code samples, clipped panels.

## Design Principles

1. Copy is the primary action: every token, class, and value should be one click from the clipboard.
2. Show the real thing: previews render the actual class/variable from the loaded stylesheet.
3. The accent marks state, never decorates: Saudi green for active, selected, and feedback only.
4. Density with hierarchy: scan a full color scale in one row; read details on demand.
5. Both directions are first-class: LTR code, RTL-safe layout.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text ≥4.5:1; keyboard-reachable copy actions; visible focus states;
`prefers-reduced-motion` alternatives for all animation; RTL parity across pages.
