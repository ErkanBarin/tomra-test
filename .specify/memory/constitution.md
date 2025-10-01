<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: N/A (new file)
Added sections: All (new constitution for TOMRA Food MLOps)
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending
  - .specify/templates/spec-template.md ⚠ pending
  - .specify/templates/tasks-template.md ⚠ pending
Deferred TODOs: None
-->

# TOMRA Food MLOps Platform – Test Automation Constitution

- **Project Name:** TOMRA Food MLOps Test Automation  
- **Constitution Version:** 1.0.0  
- **Ratification Date:** 2025-10-01  
- **Last Amended:** 2025-10-01  
- **Owners:** QA Lead (You), Eng Manager (MLOps), Product Owner (MLOps Platform)  
- **Tech Stack:** Playwright + JavaScript (ES Modules), Node 20.x, GitHub Actions, Azure (Blob, AML, AAD)

---

## 1) Problem Statement

TOMRA Food’s cloud MLOps platform (Azure-hosted) allows internal/external users to:
1) Upload images → 2) Label/annotate → 3) Define datasets → 4) Train models → 5) Register & promote models → 6) Deploy to machines → 7) Monitor/collect feedback.

We must build a reliable, observable, and fast automation suite that validates these flows end-to-end, pairs **UI verification** with **Azure/API truth checks**, and provides **release gates** for model + platform changes.

---

## 2) Goals & Success Criteria

- **Goal-1 (E2E):** Cover the canonical flow *upload → label → dataset → train → promote → deploy → monitor* with stable, <10-min PR smoke.  
- **Goal-2 (Truth):** Pair every critical UI assertion with a **backend/Azure verification** (Blob HEAD, AML job status/metrics, Registry GET).  
- **Goal-3 (Quality Gates):** Enforce numeric thresholds prior to promotion/deploy.  
- **Goal-4 (Speed):** PR checks ≤10 minutes (smoke), Nightly full E2E ≤60 minutes including at least one real AML run.  
- **Goal-5 (Signal):** CI artifacts (HTML report, PW traces, AML metrics.json) retained 14 days; failure messages must be diagnosable in <5 minutes.

**Success Metrics**
- PR pass rate ≥ 95%.  
- Flake rate ≤ 2% over rolling 7 days.  
- Mean time to triage (MTTT) < 30 minutes for red pipelines.

---

## 3) Non-Goals (v1)

- Long-running performance benchmarking of model training throughput.  
- Hardware HIL (hardware-in-loop) bench automation; we simulate deployments.  
- Security pen-tests (tracked separately).  
- Full a11y audit of complex labeling canvas (we’ll do core a11y smoke only).

---

## 4) Guiding Principles

1. **Truth > UI:** Always corroborate UI “green” with backend state (Blob/AML/Registry).  
2. **Determinism:** Deterministic seeds/splits; no arbitrary sleeps; idempotent helpers.  
3. **Pyramid First:** Fast API checks for setup/teardown; UI reserved for user-critical flows.  
4. **Fast Feedback:** Smoke on PR, deep runs nightly; parallelize, shard, and cache.  
5. **Observability-by-Default:** Traces, logs, metrics, inputs/outputs attached on failure.  
6. **Security by Design:** Secrets via env/OIDC; no creds or PII in code or logs.  
7. **Maintainability:** POM + fixtures; small, readable tests; consistent naming & tags.  
8. **Safety Gates:** Numeric thresholds for metrics; canary → promote → rollback path tested.

---

## 5) Personas in Scope

- **Data Annotator:** uploads & labels images.  
- **ML Engineer:** defines datasets, starts training, reviews metrics, promotes models.  
- **Ops/Line Manager:** deploys models to machine groups, monitors canary health.  
- **External Customer:** restricted access; can upload/label within org boundary.

---

## 6) Environments & URLs

| ENV   | Base URL (example)                 | Azure Sub/WS (logical)          |
|-------|------------------------------------|---------------------------------|
| local | `http://localhost:5173`            | local mocks                     |
| t1    | `https://mlops.t1.tomra.example`   | `SUB_T1 / RG_T1 / AML_WS_T1`    |
| t2    | `https://mlops.t2.tomra.example`   | `SUB_T2 / RG_T2 / AML_WS_T2`    |

**Secrets/Access:** OIDC → Service Principal in CI; tokens injected as env vars.

---

## 7) Quality Gates (Numeric)

**Upload**
- 200 OK on backend; Blob HEAD returns `Content-Length > 0`, `ETag` present.  
- Duplicate handling visible in UI and consistent in storage (server-side dedupe id if applicable).  

**Labeling**
- Canvas tools: bbox, polygon, class change, undo/redo verified.  
- a11y smoke: no “critical/serious” AXE violations on the labeler shell.  

**Dataset**
- Deterministic stratified split; snapshot version immutable.  
- Leakage check: 0 files shared across train/val/test within a snapshot.  

**Training (AML)**
- AML job `status = Succeeded`.  
- Metrics gates: `F1 >= 0.92`, `precision >= 0.90`, per-class recall ≥ 0.88.  
- UI metrics ≈ AML metrics (±0.01 tolerance).  

**Registry/Promotion**
- Candidate must beat or meet baseline; stage transitions recorded with actor + timestamp.  

**Deploy/Canary**
- Canary mapping written (e.g., 10%); health probe “Healthy” within 2 minutes.  
- Rollback returns mapping to previous stable within 1 minute.  

**Monitoring**
- Drift tile shows latest window; feedback creates a retrain ticket/event.

---

## 8) Data Governance

- **Golden Datasets:** versioned under `/data/golden/<name>/<version>` with `labels.json` + `metrics-baseline.json`.  
- **Synthetic Samples:** occlusions, lighting extremes, foreign objects; documented provenance.  
- **PII:** none in images/labels; filenames do not encode personal data.  
- **Retention:** test-generated blobs auto-deleted after 7 days in T1/T2 (lifecycle rule).  
- **Naming:** `org/dataset/YYYY-MM-DD/<uuid-or-hash>.<ext>`.

---

## 9) Test Architecture (Playwright, JS, ES Modules)

**Node:** 20.x  
**Language:** JavaScript (ESM `"type": "module"`)  
**Structure:**
- /tests
- /smoke
- /e2e
- /labeling
- /datasets
- /training
- /deploy
- /monitor
- /pages
- /fixtures
- /utils
- /config
**Patterns**
- Page Objects for Upload, Labeler, Datasets, Training, Registry, Deploy, Monitor.  
- Fixtures: `auth`, `api`, `azure`, `dashboard`, `goldenSamples`.  
- Tagging: `@smoke`, `@critical`, `@a11y`, `@deploy`, `@train`.

**Playwright Config**
- Projects: Chromium, Firefox, WebKit (+ one mobile).  
- Traces/screenshots/video: retain on failure.  
- Retries: 1 on CI, 0 locally.  
- Grep by tags; workers tuned to CI runners.

---

## 10) Pairing UI with Backend/Azure (Truth Pattern)

Each critical step:  
1. **UI action** (upload, train, promote).  
2. **Capture correlation ID** (uploadId, blobKey, jobId, model:version).  
3. **Backend/Azure verification** (Blob HEAD, AML GET job, Registry GET).  
4. **Assert** UI state ≈ backend truth.

---

## 11) CI/CD Policy

- **PR (≤10 min):** run `@smoke` on Chromium+Firefox; AML mocked; upload/label/dataset snapshot.  
- **Nightly (≤60 min):** full E2E on T1 with one real AML job; artifacts uploaded.  
- **Secrets:** OIDC->SPN; `.env.example` only in repo.  
- **Artifacts Retention:** 14 days.

---

## 12) Branching, Reviews, and Ownership

- **Branches:** `main` (protected), feature branches via PR.  
- **CODEOWNERS:** QA + MLOps lead for `/tests`, `/fixtures`, `/utils`, `/pages`.  
- **PR Template:** checklist (tags, artifacts links, new seeds, docs updated).

---

## 13) Flake & Defect Policy

- Flake detector weekly: rerun specs x3; if unstable → tag `@quarantine` + open ticket.  
- Defects must include env, build SHA, correlation IDs, steps, expected vs actual, artifacts.

---

## 14) Change Management & Versioning Rules

- **Constitution Versioning:**  
  - MAJOR: incompatible governance changes.  
  - MINOR: new principles/sections.  
  - PATCH: clarifications/typo fixes.  

- **Test Data Versions:** Golden datasets semantically versioned alongside taxonomy.

---

## 15) Risks & Mitigations

- **Secret Leakage:** use backend proxy or OIDC; never commit secrets.  
- **Long AML Runs:** mock in PR, real nightly.  
- **Canvas Flakiness:** use pixel-tolerant visual checks; throttle inputs.  
- **Race Conditions:** use polling helpers; avoid `waitForTimeout`.

---

## 16) Accessibility & Perf-Lite

- **a11y:** `@axe-core/playwright` smoke on shell pages.  
- **Perf-lite:** capture page load timing; alert if >3s P95 in T1.

---

## 17) Glossary

- **Blob:** Object in Azure Blob Storage (uploaded image).  
- **AML:** Azure Machine Learning job.  
- **Registry:** Model registry with versioning/stages.  
- **Canary:** Partial rollout to subset.  
- **SAS URL:** Signed URL to access blob.

---

## 18) Appendix – Required Env Vars

- `TEST_ENV = local|t1|t2`  
- `API_BASE`  
- `PLATFORM_TOKEN`  
- `AZ_REGION`, `AZ_SUB`, `AZ_RG`, `AML_WS` (nightly only)  
- `TEST_USER_EMAIL`, `TEST_USER_PASS` (staging account)  

---

## 19) Example Commands

```bash
pnpm install && pnpm dlx playwright install
TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium
pnpm exec playwright show-report

---

## 20) Example Playwright Config (ESM excerpt)
// playwright.config.mjs
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
const ENV = process.env.TEST_ENV || 't1';
const envCfg = await import(`./config/env.${ENV}.mjs`).then(m => m.default);

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: envCfg.baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } }
  ],
  workers: process.env.CI ? 4 : undefined
});

---

## 21) First Ten Tests to Implement
	1.	Upload JPEG → UI complete + Blob HEAD ok.
	2.	Label bbox + class hotkey + undo/redo.
	3.	Dataset create + stratified split + snapshot.
	4.	Start training (mock AML) → UI queued → succeeded.
	5.	Registry shows last candidate.
	6.	Promote candidate → stage=Production via Registry GET.
	7.	Canary deploy → health probe Healthy in ≤120s.
	8.	Drift tile visible after abnormal batch.
	9.	a11y smoke on labeler shell.
	10.	Upload duplicate → dedupe msg consistent with backend.
