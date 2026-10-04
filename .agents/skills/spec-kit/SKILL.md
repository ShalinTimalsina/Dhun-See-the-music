---
name: spec-kit
description: >-
  Toolkit to help you get started with Spec-Driven Development (SDD). Use this skill to apply SDD principles, create PRDs before coding, and generate code from specifications.
---

# Spec-Driven Development (SDD)

This skill enables the agent to follow the **Spec-Driven Development (SDD)** methodology as defined by [github/spec-kit](https://github.com/github/spec-kit).

## The Power Inversion

Specifications don't serve code—code serves specifications. The PRD (Product Requirements Document) isn't just a guide for implementation; it is the source of truth that generates implementation.

## Core Principles

1. **Specifications as the Lingua Franca**: The specification becomes the primary artifact. Code becomes its expression in a particular language and framework.
2. **Executable Specifications**: Specifications must be precise, complete, and unambiguous enough to generate working systems.
3. **Continuous Refinement**: Consistency validation happens continuously. AI should analyze specifications for ambiguity, contradictions, and gaps as an ongoing process.
4. **Research-Driven Context**: Gather critical context throughout the specification process, investigating technical options, performance implications, and organizational constraints.
5. **Bidirectional Feedback**: Production reality informs specification evolution. Metrics and operational learnings become inputs for specification refinement.
6. **Branching for Exploration**: Generate multiple implementation approaches from the same specification to explore different optimization targets.

## Instructions for the Agent

When you are asked to implement a new feature using this skill:

1. **Do not write code immediately.** Start by drafting a clear, unambiguous specification (PRD).
2. **Iterate** on the specification with the user to refine edge cases and acceptance criteria.
3. **Draft Implementation Plans** that explicitly map requirements to technical decisions.
4. **Write Code** only when the specification and implementation plans are stable and reviewed.

## Reference

- See the full methodology at [github/spec-kit](https://github.com/github/spec-kit).
