
# Implementation Plan: Tomra Food MLOPS Platform Test Automation Infrastructure

**Branch**: `001-create-the-automation` | **Date**: October 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-create-the-automation/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✓ Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✓ Project Type: Test automation suite (single project)
   → ✓ Structure Decision: Single project with test-focused layout
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → ✓ No violations - test-first approach aligns with constitution
   → ✓ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✓ All requirements clearly specified, no clarifications needed
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → ✓ No new violations after design
   → ✓ Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. ✓ STOP - Ready for /tasks command
```

## Summary
Primary requirement: Create comprehensive test automation infrastructure for Tomra Food MLOPS Platform that validates complete user workflows (image upload → labeling → training → deployment) with truth pairing validation of Azure backend services. Technical approach: Playwright + JavaScript ES Modules with mocked Azure ML for CI/CD smoke tests (≤10 min) and page object pattern for maintainability.

## Technical Context
**Language/Version**: JavaScript ES Modules, Node.js 20.x  
**Primary Dependencies**: Playwright (browser automation), Azure Storage SDK (blob verification), Azure ML SDK (job status)  
**Storage**: Azure Blob Storage (image files), Azure ML Registry (model artifacts)  
**Testing**: Playwright Test Framework, custom fixtures for auth/mocking  
**Target Platform**: CI/CD (GitHub Actions), local development environment  
**Project Type**: single - test automation suite  
**Performance Goals**: CI smoke tests complete in ≤10 minutes, truth pairing validation after each UI action  
**Constraints**: No secrets in repository, mock Azure ML for cost control, support multiple browsers (Chromium+Firefox)  
**Scale/Scope**: 3 core workflows (upload, training, registry), 5-day development timeline, demo-ready smoke suite

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Test-First Approach**: ✓ PASS - Plan follows TDD with failing tests before implementation  
**Simplicity**: ✓ PASS - Page object pattern with clear separation of concerns  
**Observability**: ✓ PASS - HTML reports, traces, and artifacts for debugging  
**No Over-Engineering**: ✓ PASS - Focused on essential automation without unnecessary complexity

## Project Structure

### Documentation (this feature)
```
specs/001-create-the-automation/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Test automation project structure
tests/
├── smoke/
│   ├── upload.smoke.spec.mjs
│   ├── training.mock.smoke.spec.mjs
│   └── registry.smoke.spec.mjs
├── fixtures/
│   └── test-fixtures.mjs
└── data/
    └── sample-images/

pages/
├── upload.page.mjs
├── training.page.mjs
└── registry.page.mjs

utils/
├── azure.mjs
├── waitFor.mjs
└── config.mjs

config/
├── env.local.mjs
├── env.t1.mjs
└── playwright.config.mjs

.github/
└── workflows/
    └── ci.yml

fixtures/
└── test-fixtures.mjs
```

**Structure Decision**: Single project layout optimized for test automation with clear separation between page objects, utilities, test data, and configuration. Follows Playwright best practices with ES modules for modern JavaScript development.

## Phase 0: Outline & Research
All technical decisions are clearly specified in the user requirements:

**Decisions Made**:
- **Browser Automation**: Playwright - industry standard for modern web testing
- **Language**: JavaScript ES Modules with Node.js 20.x - specified requirement
- **Testing Strategy**: Truth pairing (UI action + backend verification) - specified requirement
- **CI/CD**: GitHub Actions with time budget ≤10 minutes - specified requirement
- **Azure Integration**: HEAD requests for blob verification, mocked ML metrics - specified requirement

**Output**: research.md with technology stack validation and best practices

## Phase 1: Design & Contracts

### Data Model Entities
- **TestImageDataset**: Sample food images for upload testing
- **MockTrainingMetrics**: F1 score ≥ 0.92 simulation for training validation
- **TestModelArtifacts**: Sample model files for deployment testing
- **EnvironmentConfigs**: Test/staging environment settings
- **AuthenticationStubs**: Test user credentials and session management

### API Contracts
From functional requirements, the following verification endpoints are needed:
- **Blob Storage Verification**: HEAD requests to validate image uploads
- **Azure ML Job Status**: GET requests to check training job state and metrics
- **Model Registry**: GET requests to confirm model deployment

### Contract Tests
Each verification endpoint requires contract tests that fail initially:
- Blob storage HEAD request validation
- Azure ML job status response schema
- Model registry GET response validation

### Integration Test Scenarios
Based on acceptance scenarios from spec:
1. Upload flow with blob verification
2. Training flow with mocked metrics validation (F1 ≥ 0.92)
3. Registry/deployment flow with API confirmation
4. CI/CD smoke test execution under time budget
5. Environment-specific configuration switching

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate 5 milestone-based sprints (M1-M5) from user requirements
- Each deliverable file → creation task with owner (QA), estimate (hours), priority
- Truth pairing tasks require both UI and backend verification components

**Milestone Structure**:
- **M1**: Repository scaffold + CI foundation (package.json, configs, basic workflow)
- **M2**: Upload flow (page object + blob HEAD verification)
- **M3**: Training flow (page object + mocked AML metrics with F1 ≥ 0.92 gate)
- **M4**: Registry/Deploy flow (page object + API stub validation)
- **M5**: Polish (reporting, documentation, flake protection)

**Ordering Strategy**:
- Configuration files before page objects before tests
- Page objects before their corresponding test specs
- Utilities before tests that depend on them
- CI workflow after all test specs exist

**Estimated Output**: 25-30 numbered tasks across 5 milestones with hour estimates, dependencies, and clear Definition of Done criteria

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following TDD principles)  
**Phase 5**: Validation (CI passes, demo scenarios work, performance targets met)

## Complexity Tracking
*No constitutional violations identified - test automation follows standard patterns*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

# CONCRETE IMPLEMENTATION PLAN

## 🎯 Milestones & Timeline (5-Day Sprint)

### M1: Repository & CI Scaffold (Day 1)
**Goal**: Foundation ready for development
- Package.json with ESM configuration
- Playwright configuration 
- Environment templates
- Basic CI workflow

### M2: Upload Flow + Truth Pairing (Day 2)
**Goal**: Complete upload workflow with Azure verification
- Upload page object with getByTestId selectors
- Blob storage HEAD verification utility
- Upload smoke test with truth pairing

### M3: Training Flow + Mock Metrics (Day 3)
**Goal**: Training workflow with mocked Azure ML validation
- Training page object for job lifecycle
- Mock Azure ML metrics with F1 ≥ 0.92 gate
- Training smoke test with state transitions

### M4: Registry & Deployment Flow (Day 4)
**Goal**: Model registry and deployment validation
- Registry page object
- Model registry API verification
- Registry smoke test with deployment confirmation

### M5: Polish & Demo Readiness (Day 5)
**Goal**: Production-ready smoke suite
- HTML reporting and trace collection
- Documentation and quickstart guide
- Flake protection and stability improvements

## 📋 Work Breakdown Structure

### Epic 1: Foundation Infrastructure
| Task | Owner | Estimate | Priority | Dependencies | Labels |
|------|-------|----------|----------|--------------|--------|
| Create package.json with ESM + Playwright | QA | 2h | P0 | None | ci, config |
| Setup playwright.config.mjs with multi-browser | QA | 3h | P0 | package.json | ci, config |
| Create .env.example and environment configs | QA | 2h | P0 | None | security, config |
| Setup basic CI workflow structure | QA | 4h | P0 | playwright.config | ci |

### Epic 2: Upload Workflow + Truth Pairing
| Task | Owner | Estimate | Priority | Dependencies | Labels |
|------|-------|----------|----------|--------------|--------|
| Create upload.page.mjs with getByTestId | QA | 3h | P0 | playwright.config | ui+truth |
| Implement utils/azure.mjs blob HEAD utility | QA | 4h | P0 | env configs | ui+truth, data-governance |
| Create test fixtures with auth stubs | QA | 3h | P0 | None | security, ui+truth |
| Build upload.smoke.spec.mjs with blob verification | QA | 5h | P0 | upload.page, azure.mjs | ui+truth, observability |

### Epic 3: Training Workflow + Mock Metrics
| Task | Owner | Estimate | Priority | Dependencies | Labels |
|------|-------|----------|----------|--------------|--------|
| Create training.page.mjs for job states | QA | 4h | P0 | test-fixtures | ui+truth |
| Implement mock Azure ML metrics (F1 ≥ 0.92) | QA | 5h | P0 | None | ui+truth, data-governance |
| Create utils/waitFor.mjs polling helper | QA | 2h | P1 | None | observability |
| Build training.mock.smoke.spec.mjs | QA | 6h | P0 | training.page, mock metrics | ui+truth, observability |

### Epic 4: Registry & Deployment
| Task | Owner | Estimate | Priority | Dependencies | Labels |
|------|-------|----------|----------|--------------|--------|
| Create registry.page.mjs for model operations | QA | 3h | P0 | test-fixtures | ui+truth |
| Implement model registry API verification | QA | 4h | P0 | azure.mjs | ui+truth, data-governance |
| Build registry.smoke.spec.mjs | QA | 4h | P0 | registry.page, API utils | ui+truth, observability |

### Epic 5: Polish & Production Readiness
| Task | Owner | Estimate | Priority | Dependencies | Labels |
|------|-------|----------|----------|--------------|--------|
| Complete CI workflow with artifact collection | QA | 3h | P0 | All smoke tests | ci, observability |
| Create README.md with quickstart guide | QA | 2h | P1 | Working tests | documentation |
| Add HTML reporting and trace configuration | QA | 2h | P1 | CI workflow | observability |
| Implement flake protection and retry logic | QA | 3h | P1 | All tests | observability |

## 🔄 Dependency Graph (DAG)

```
package.json → playwright.config.mjs → CI workflow
     ↓              ↓                      ↓
env configs → azure.mjs → upload.page → upload.smoke.spec
     ↓              ↓         ↓             ↓
test-fixtures → training.page → training.smoke.spec → CI complete
     ↓              ↓              ↓             ↓
waitFor.mjs → registry.page → registry.smoke.spec → README.md
```

**Parallel Execution Opportunities**:
- Page objects can be developed in parallel after fixtures
- Smoke tests can be written in parallel after their page objects
- Documentation can be written alongside final testing

## 🌍 Environment & Data Plan

### Configuration Files
- **config/env.local.mjs**: Local development (mock Azure endpoints)
- **config/env.t1.mjs**: Test environment (staging Azure resources)
- **config/env.prod.mjs**: Production-like (real Azure with read-only access)

### Test Data Strategy
- **data/samples/**: Small food image samples (<1MB each)
- **fixtures/mock-responses/**: Canned Azure ML responses
- **Skip behavior**: Tests gracefully skip if sample data missing
- **Cleanup**: Automatic cleanup of test uploads after runs

### Sample Images
```javascript
// data/samples/README.md guidance
- tomato.jpg (classification sample)
- apple.jpg (classification sample)  
- mixed-salad.jpg (multi-object detection)
// Images should be <1MB, standard formats, representative of food domain
```

## 🚀 CI/CD Plan

### Job Matrix
```yaml
# .github/workflows/ci.yml structure
name: Tomra MLOPS Test Automation
on: [pull_request, push to main]

jobs:
  smoke-tests:
    strategy:
      matrix:
        browser: [chromium, firefox]
        os: [ubuntu-latest]
    steps:
      - Checkout + Node 20 setup
      - Cache Playwright browsers  
      - Install dependencies (pnpm)
      - Run smoke tests with timeout
      - Upload artifacts on failure
```

### Time Budget Allocation
- **Setup & Dependencies**: 2 minutes
- **Browser Installation**: 3 minutes  
- **Smoke Test Execution**: 4 minutes
- **Artifact Collection**: 1 minute
- **Total Budget**: 10 minutes maximum

### Failure Artifacts
- HTML test report with screenshots
- Playwright traces for failed tests
- Console logs and network requests
- Environment configuration (sanitized)

### Pass/Fail Gates
- All smoke tests must pass
- No test execution timeouts
- F1 score validation ≥ 0.92 in training mock
- Blob verification successful for uploads

## ⚠️ Risk Log & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Azure secrets exposed in repo | High | Low | .env.example template, gitignore enforcement |
| Flaky Canvas/file upload elements | Medium | High | Custom waitFor utilities, retry logic |
| Azure ML runtime costs in CI | High | Medium | Mock all AML operations for PR tests |
| Network race conditions | Medium | Medium | Polling helpers, generous timeouts |
| CI time budget exceeded | Medium | Medium | Parallel test execution, selective running |

### Concrete Mitigations
- **Secrets**: Use GitHub secrets for real Azure credentials, local .env for development
- **Flaky tests**: Implement quarantine policy - 3 consecutive failures = skip in PR
- **AML costs**: Strict mocking in CI, real integration only in nightly builds
- **Network races**: Exponential backoff in waitFor.mjs utility

## ✅ Acceptance Criteria

### Local Development
```bash
# These commands must pass locally
pnpm install && pnpm dlx playwright install
TEST_ENV=local pnpm exec playwright test -g @smoke --project=chromium
TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium
```

### CI/CD Requirements
```bash
# PR validation must complete successfully
TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium --project=firefox
# Execution time ≤ 10 minutes
# All tests passing status
```

### Metrics Thresholds
- **F1 Score Validation**: Mock must return ≥ 0.92 in training tests
- **Upload Verification**: Blob HEAD requests return 200 status
- **Model Registry**: GET requests return valid model metadata
- **CI Performance**: Total pipeline ≤ 10 minutes

### Report Locations
- **HTML Report**: `playwright-report/index.html` 
- **Traces**: `test-results/` directory
- **Logs**: Console output captured in CI artifacts
- **Coverage**: Not required for smoke tests

## 📝 Backlog & Stretch Goals

### Priority 2 (Post-Demo)
- **a11y smoke tests**: Basic accessibility validation on labeler UI
- **Dataset leakage lint**: Prevent test data from real datasets  
- **Canary health probe**: Synthetic monitoring of deployed models
- **Performance benchmarks**: Response time tracking for key workflows

### Documentation Hardening
- **Troubleshooting guide**: Common failures and resolution steps
- **Local development setup**: Detailed environment configuration
- **Azure permissions**: Minimum required permissions documentation
- **Test data management**: Guidelines for refreshing sample datasets

## 📊 At-a-Glance Checklist

### Sprint Planning (Jira/Linear Ready)
```
□ M1: Foundation (11h) - package.json, configs, basic CI
□ M2: Upload + Truth (15h) - page object, blob verify, smoke test  
□ M3: Training + Mocks (17h) - training page, ML mocks, smoke test
□ M4: Registry + Deploy (11h) - registry page, API verify, smoke test
□ M5: Polish + Demo (10h) - CI complete, docs, stability

Total Effort: 64 hours (5 days @ 12-13h/day for single QA engineer)
Critical Path: M1 → M2 → M3 → M4 → M5 (sequential dependencies)
Parallel Work: Page objects can be developed simultaneously after M1
```

### Definition of Done Template
```
□ Code follows ESM + getByTestId patterns
□ Truth pairing validation implemented  
□ CI test passes on Chromium + Firefox
□ No secrets committed to repository
□ HTML report generated with traces
□ Documentation updated
□ Smoke test tagged with @smoke
□ Time budget ≤ allocated estimate
```

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
