# Goal
Separate the new denormalized shoot model from the existing normalized models and fix the schema/type issues found in review.

# Non-goals
Do not migrate data, change reads/writes to use the denormalized collection, or alter existing normalized model behavior.

# Constraints
Keep the current app contract intact while making the new model easy to inspect independently.

# Acceptance criteria
- Existing normalized models remain in `src/models/mongoose.ts`.
- Denormalized interfaces and Mongoose schema live under `src/models/denormalized/`.
- Participant identity validation rejects both invalid states: neither identity and both identities.
- Denormalized schema preserves fields needed for migration from existing `ShootParticipant` data.
- TypeScript passes.

# Approach
Create a denormalized model folder, move new interfaces and schema there, re-export denormalized types from the existing model barrel, and keep old Mongoose exports focused on current collections.

# Files / areas affected
- `src/models/index.ts`
- `src/models/mongoose.ts`
- `src/models/denormalized/index.ts`
- `src/models/denormalized/mongoose.ts`

# Verification plan
Run TypeScript compilation, a focused existing model-dependent function test, and a `tsx` runtime check for the new denormalized Mongoose model.

# Test plan
Type checking verifies imports and schema typings. Existing function tests verify the old normalized model exports still resolve for current behavior. The `tsx` runtime check validates the new schema with real Mongoose because the current Jest setup globally mocks Mongoose.

# Monitoring plan
No runtime monitoring changes; this is schema preparation only.

# Risks / open questions
The denormalized collection is not yet exercised by application reads/writes, so runtime migration behavior remains future work.

# Status
Complete.
