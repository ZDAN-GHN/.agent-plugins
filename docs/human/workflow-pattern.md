# AI Coding Workflow / Harness Pattern

```mermaid
flowchart TD
    %% Entry Points
    A[User Request / Incident] --> B{Task Type?}
    B -->|Change Delivery| C[Standard Task]
    B -->|Incident Repair| D[Incident Task]
    B -->|Low-Risk Single File| E[Lightweight Task]

    %% Lightweight Path
    E --> E1[Concise Note: target, acceptance, validation, risk, rollback]
    E1 --> E2[Write Change]
    E2 --> E3[Focused Diff/Manual Check]
    E3 --> E4[Delivery Record in same context]

    %% Standard Task - Full Loop
    C --> F[Create Task Record]
    F --> F1[Start Record: Target, Scope, Risk Tier, R/A Map, Planned V-ids]
    F1 --> G[Plan Phase]

    %% Planning
    G --> G1[Read Source, Compare R/A IDs]
    G1 --> G2[Coverage Audit: R→A→C/S→V→E→Review]
    G2 --> G3{All Links Present?}
    G3 -->|No| G4[Blocked: NEEDS EVIDENCE / REPLAN]
    G3 -->|Yes| G5[Write Plan: C-ids, S-ids, V-ids, Review, Rollback]
    G5 --> G6[Approved Plan Snapshot: SHA-256, Decision Ref, Scope, Tier]
    G6 --> G7[Record Approved Plan Identity]

    %% Checkpoint Loop
    G7 --> H[Checkpoint Dispatch]
    H --> H1{Drift Check}
    H1 -->|Plan Hash Mismatch| H2[BLOCKED: REPLAN]
    H1 -->|R/A Map Drift| H3[BLOCKED: NEEDS EVIDENCE]
    H1 -->|Tier/Scope/Contract Drift| H4[BLOCKED: REPLAN]
    H1 -->|Clean| I[Execute Checkpoint]

    %% Implementation
    I --> I1[Implement S-ids: Bounded Changes]
    I1 --> I2[Run Validation V-ids via Evidence Wrapper]
    I2 --> I2a[Evidence Wrapper: declared entries only, fixed cwd/timeout]
    I2a --> I2b[Structured JSON: source/status/exit/result/redaction]
    I2b --> I2c{All V-ids Pass?}
    I2c -->|No| I3[FAIL: Route to Implement/Debug]
    I2c -->|Yes| I4[Collect Evidence Envelopes E-ids]

    %% Debug Path
    I3 --> J[Debug Agent]
    J --> J1[Symptom, Reproduction, Trigger Conditions]
    J1 --> J2[Earliest Failure Boundary + Failure Class]
    J2 --> J3[Root Cause + Confidence + Falsification]
    J3 --> J4[Minimal Fix Direction]
    J4 --> J5{3rd Same Failure?}
    J5 -->|Yes| J6[Escalate with Boundary, Attempts, Options]
    J5 -->|No| I1

    %% Gate Routing
    I4 --> K[Gate Routing]
    K --> K1{Mode}
    K1 -->|Shadow| K2[Record Only, No Block]
    K1 -->|Approval| K3[Maintainer Decision Required]
    K1 -->|Blocking| K4[Failure Blocks Dispatch]
    K4 --> K5[Gate Failure Cannot Override]
    K5 --> K6[Only Maintainer Decision + Compensating Evidence]

    %% Hook Handling
    K6 --> L{Hook Issue?}
    L -->|Mis-block| L1[Manual Close + human/permission + Maintainer Decision]
    L -->|Leakage| L2[Immediate Block, Fix Sanitization, Revalidate]
    L -->|Drift| L3[Block Gate, Fix/Remove, Revalidate via Shadow]

    %% Review
    K --> M[Review]
    M --> M1[Standards / Spec / Both]
    M1 --> M2[P0/P1 Must Fix & Revalidate or Maintainer Decision]
    M2 --> M3[Review Conclusion: Clear / P0/P1 Fixed / P0/P1 Decision / P2/P3]

    %% Delivery
    M3 --> N[Delivery Record]
    N --> N1[Traceability Summary: R/A/C coverage]
    N1 --> N2[Actual Validation Table]
    N2 --> N3[Run Summary: Run ID, Failure Boundary, Failure Class, Gate, E-count]
    N3 --> N4[Feedback & Regression Samples]
    N4 --> N5[Trace Inference Disclaimer]

    %% Feedback Loop
    N5 --> O{Repeated Failure?}
    O -->|Yes| P[Regression Sample Promotion]
    P --> P1[Maintainer Approval]
    P1 --> P2[Store in docs/regression-samples/]
    P2 --> P3[Workflow Change Comparison]
    O -->|No| Q[Task Complete]

    %% Incident Repair
    D --> D1[Capture Symptom + Reproduction]
    D1 --> D2[Diagnose Root Cause + Confidence]
    D2 --> D3[Smallest Scoped Repair]
    D3 --> D4[Regression Validation]
    D4 --> D5[Review per Change Delivery]
    D5 --> D6{Reproducible?}
    D6 -->|Yes| D7[Fixed: Same Repro Fail→Pass + Root Cause Link]
    D6 -->|No| D8[Pending Observation / Mitigated / Needs Observability]

    %% Styling
    classDef gate fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef block fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef pass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    classDef decision fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px

    class K,K1,K2,K3,K4,K5,K6,L,L1,L2,L3 gate
    class H2,H3,H4,G4 block
    class E3,E4,I4,M3,N5,Q pass
    class A,B,C,D,E,F,F1,G,G1,G2,G5,G6,G7,H,H1,I,I1,I2,I2a,I2b,J,J1,J2,J3,J4,M,M1,M2,N,N1,N2,N3,N4 process
    class G3,I2c,J5,K1,L,O,D6 decision
```

## Key Artifacts & Their Locations

```
repo-root/
├── AGENTS.md                          # Entry point → task-loops.md
├── assets/closed-loop/
│   ├── task-loops.md                  # Core protocol (with Task Context Rules)
│   ├── protocols/
│   │   ├── task-record-template.md    # Start / Checkpoint / Delivery + Run Summary
│   │   ├── validation-execution.md    # Validation evidence rules per tier
│   │   ├── change-review.md           # Review Standards/Spec + P0-P3
│   │   └── regression-sample-template.md
│   └── scripts/
│       ├── check-plan-identity.mjs    # Plan hash + coverage validation
│       ├── evidence-wrapper.mjs       # Declared entries only, structured output
│       ├── workflow-probe.mjs         # Runtime fact probe
│       └── verify-*.mjs               # Doc contracts
├── docs/plans/
│   ├── <slug>.md                      # Approved plan (immutable intent)
│   └── <slug>-record.md               # Mutable progress + evidence
└── docs/regression-samples/
    └── <slug>-RS-<N>.md               # Promoted failures only
```

## Gate Enforcement Modes

| Mode | R1/R2 | R3/Security |
|------|-------|-------------|
| **Shadow** | Default for new gates (min 3 runs) | Exception only with compensating controls |
| **Approval** | After shadow validation | With approval path |
| **Blocking** | Validated gates | **Default** |

## Failure Class Taxonomy (9 Classes)

| Class | Trigger | Route |
|-------|---------|-------|
| `source/intake` | Missing/ambiguous requirement | NEEDS EVIDENCE → Explore |
| `plan/identity` | Hash mismatch, missing approval | BLOCKED → REPLAN |
| `plan/coverage` | R/A/C/S/V/E link missing | BLOCKED → NEEDS EVIDENCE/REPLAN |
| `dispatch/role` | Wrong agent, boundary violated | BLOCKED → Main Agent re-route |
| `agent/action` | Implementation defect at known boundary | FAIL → Implement (max 3) |
| `validation` | Flaky/cross-layer/env failure | FAIL → Debug |
| `review` | P0/P1 finding | BLOCKED → Repair/Decision |
| `human/permission` | Auth required, production access | BLOCKED → Maintainer Decision |
| `external/env` | Dependency/infra failure | BLOCKED → Env Owner / Tech Research |

## Risk-Proportional Gates

| Task Type | Required Gates | Conditional |
|-----------|---------------|-------------|
| Doc/No behavior | Scope/diff, manual check | Governance review |
| Logic R1 | Behavior, bounded review | TDD, independent review |
| R2 Cross-module | Behavior, regression, contract, review | Independent review, migration |
| UI | Behavior, visual (if comparable state) | Screenshot diff, human approval |
| Data/Migration | Consistency, compat, ordering, rollback | Maintainer approval, R3 security |
| Security/Privacy | SecurityAudit, explicit auth | Not autonomous, P0/P1 gate |
| Long-chain E2E | E2E, trace, failure localization | Adversarial review |