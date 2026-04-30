# Competition Check-In And Two-Round Scoring

## Goal
Add a competition flow where a signed-in admin creates an event, unauthenticated participants check in from a public link, score their own morning and afternoon rounds, and final results become public after finish.

## Non-goals
- Bow classes, divisions, handicaps, exports, multi-admin permissions, or QR rendering.
- Changing the existing regular shoot scoring/history flow.

## Constraints
- Public participants must not need app accounts.
- Public score writes must be scoped to the participant's own token.
- Existing authenticated routes must remain protected.

## Acceptance Criteria
- Admin can create a competition and open a dashboard.
- Public users can check in with a unique display name.
- Checked-in users can score morning and afternoon 18-target rounds.
- Admin can view participant counts, progress, totals, finish/reopen, and correct scores.
- Public results are hidden until the competition is finished.

## Approach
- Add competition, participant, and score Mongo models.
- Add admin and public API routes with token-cookie scoped public access.
- Add admin and public pages/components using the existing score values and station navigation concepts.
- Exempt public competition pages from proxy auth while leaving existing routes protected.

## Files / Areas Affected
- Models and helper functions under `src/models`, `src/functions`, and `src/helpers`.
- API routes under `src/app/api/competitions` and `src/app/api/competition`.
- UI routes under `src/app/competitions` and `src/app/competition`.
- Proxy route access rules and setup-page navigation.

## Verification Plan
- Run focused tests for new helper/function/API behavior.
- Run existing tests for shoot auth/scoring regression.
- Run lint/build or targeted TypeScript check if feasible.

## Test Plan
- Happy path: create competition, check in, score both rounds, finish, view results.
- Sad path: duplicate check-in, invalid score/station/round, missing participant token, results before finish.
- Regression: regular shoot API remains auth-gated and creator-scoped.

## Monitoring Plan
- No runtime monitoring changes for v1.

## Risks / Open Questions
- This stores one browser token per participant; changing devices requires checking in again unless a manual admin correction is used.

## Status
- Implemented and verified.
