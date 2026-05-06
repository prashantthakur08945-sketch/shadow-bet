# gemini.md - The Project Constitution

## Data Schemas

### User Schema (users)
```json
{
  "id": "UUID (PK)",
  "phone": "VARCHAR(15)",
  "email": "VARCHAR(255)",
  "username": "VARCHAR(30)",
  "avatar_url": "TEXT",
  "plan": "ENUM(free, shadow_plus)",
  "wallet_balance": "INTEGER (paise)",
  "invite_code": "VARCHAR(10)",
  "invited_by": "UUID (FK users)",
  "created_at": "TIMESTAMPTZ"
}
```

### Shadow Schema (shadows)
```json
{
  "id": "UUID (PK)",
  "user_id": "UUID (FK users)",
  "name": "VARCHAR(50)",
  "archetype": "VARCHAR(50)",
  "career": "TEXT",
  "personality": "JSONB",
  "aesthetic": "TEXT",
  "backstory": "TEXT",
  "xp": "INTEGER",
  "evolution_stage": "INTEGER (1-5)",
  "card_image_url": "TEXT",
  "updated_at": "TIMESTAMPTZ"
}
```

### Dare Schema (dares)
```json
{
  "id": "UUID (PK)",
  "creator_id": "UUID (FK users)",
  "target_id": "UUID (FK users)",
  "niche_id": "UUID (FK niches)",
  "title": "VARCHAR(200)",
  "category": "ENUM(social, creative, unhinged, physical)",
  "pot_amount": "INTEGER (paise)",
  "status": "ENUM(active, accepted, completed, failed, expired)",
  "proof_url": "TEXT",
  "votes_complete": "INTEGER",
  "votes_fail": "INTEGER",
  "expires_at": "TIMESTAMPTZ",
  "deadline_at": "TIMESTAMPTZ",
  "created_at": "TIMESTAMPTZ"
}
```

## Behavioral Rules
1. **Data-First Rule**: Define schema before building tools.
2. **Deterministic Logic**: Layer 3 tools must be deterministic Python scripts for API interactions and data processing.
3. **Self-Healing**: Follow the Repair Loop on failure.
4. **Environment Isolation**: Use `.tmp/` for intermediate files.
5. **Aesthetic Law**: Near-black backgrounds (`#0D0D0D`), electric purple accents (`#6C2BD9`), Space Grotesk typography.
6. **Safety First**: AI moderation on all user-generated dare content and Shadow roasts.
7. **Stakes Visibility**: Pot amounts and timers must be bold and live.

## Architectural Invariants
- 3-Layer Architecture (Architecture, Navigation, Tools).
- LLMs handle reasoning; Python scripts handle execution.
- `.env` for secrets.

## Maintenance Log
*None yet.*
