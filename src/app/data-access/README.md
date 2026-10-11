# Data access

## Rule

```text
UI (features / shared)
  → ports (interfaces only)
  → mock (implements ports, simulates latency/errors)
```

- Components and facades must depend on `ports` interfaces only.
- Raw mock datasets live ONLY in `mock-data/`. Nothing outside
  `data-access/mock/` may import from `mock-data/`.
- Replacing the mock backend with a real API means adding a new
  implementation of the `ports` interfaces. UI stays untouched.

## Folders

- `models.ts` — shared domain types.
- `ports/` — gateway interfaces (one per domain).
- `mock/` — mock gateway implementations.
- `mock-data/` — the only place holding mock datasets.
