## Goal
Move shoot UI code to use `Shoot`, `ShootParticipant`, and `ShootScore` domain classes consistently after API/query data is fetched.

## Non-goals
Refactor persistence schemas, redesign scoring UI, or change API response payloads.

## Constraints
React Query cache should remain plain JSON-like data so optimistic updates stay simple. Domain classes must be safe to import from client components.

## Acceptance criteria
Shoot, participant, and score objects used by shoot/summary/history components are class instances. Plain API objects are converted at fetch/page boundaries. Existing targeted tests and typecheck pass.

## Approach
Define raw DTO-compatible model types and domain classes in the denormalized model module. Convert fetched data to `Shoot` instances in `ShootPage`, summary server page, and history query hook. Update components/tests that now require class instances.

## Files / Areas Affected
`src/models/denormalized/index.ts`, shoot/summary/history components, query hooks, and tests around those components.

## Verification Plan
Run TypeScript to catch class/raw boundary mistakes. Run targeted component and hook tests that exercise participant labels, shoot loading, summary rendering, and history cards.

## Test Plan
Before-change evidence: TypeScript currently fails and `ParticipantSelector` crashes when passed plain participants. After-change evidence: targeted tests and typecheck should pass with class instances.

## Monitoring Plan
No runtime monitoring needed for this local refactor.

## Risks / Open Questions
Date values arrive from JSON as strings, so constructors must normalize them. Existing server functions should continue to use raw interfaces rather than class instances.

## Status
Complete. Typecheck, full Jest suite, and lint pass.
