# AdvisoryOS — AI-Powered Planning. Adviser-Led Decisions.

An AI co-pilot for SEBI-registered Investment Advisers (RIAs). AdvisoryOS helps an adviser scale research, goal planning, and portfolio construction across diverse client personas while maintaining strict fiduciary accountability and human sign-off on all client-facing advice.

---

## 1. Product Architecture

AdvisoryOS is architected around the fiduciary principle: **AI suggests, but the registered adviser decides and legally signs.**

- **Reactive State & Persistence**: `AdvisoryContext.tsx` manages reactive state with `localStorage` fallback and instant reset capabilities.
- **Deterministic Math & Rules Engine**: Pure calculation modules decoupled from the UI:
  - `src/utils/financialMath.ts`: Inflation compounding, monthly annuity due SIP formulas, retirement capitalization, dynamic glidepaths, and 10-year portfolio backtests.
  - `src/utils/suitabilityRules.ts`: Independent Risk Capacity vs Risk Tolerance scoring under SEBI RIA Regulation 17, conflict detection, and deterministic guardrail evaluations.
- **Strict Approval & Versioning Lifecycle**:
  `Draft` → `Needs Review` → `Changes Requested` → `Approved` → `Shared`
  - Invalidation Rule: Any edit to client financial parameters, goals, or allocations after approval immediately creates a new draft version (e.g. `v1.0` → `v1.1`) and invalidates the previous approval.
  - Watermark Lockdown: Client export and sharing is strictly blocked until formal adviser sign-off.
- **Source-Grounded Research**: Seeded AMFI/AMC repository linking fund facts to Scheme Information Document (SID) pages. Unsupported questions return *"I could not verify this from the available documents"*.

---

## 2. Calculation Assumptions & Formulas

### A. Inflation-Adjusted Target Corpus
$$FV = PV \times (1 + i)^n$$
- $PV$: Present-day cost
- $i$: Assumed annual inflation rate (default 6% for general goals, customizable)
- $n$: Investment horizon in years

### B. Required Monthly SIP (Annuity Due with Monthly Compounding)
$$SIP = \frac{NetCorpusNeeded}{\left[ \frac{(1 + r_m)^m - 1}{r_m} \right] \times (1 + r_m)}$$
- $r_m = \frac{r}{12}$ (Monthly rate)
- $m = n \times 12$ (Total monthly periods)
- $NetCorpusNeeded = \max(0, FV - PV_0 \times (1 + r)^n)$

### C. Retirement Capitalization Annuity
$$Corpus = \text{AnnualWithdrawal} \times \left[ \frac{1 - (1 + r_{\text{real}})^{-N}}{r_{\text{real}}} \right]$$
- $r_{\text{real}} = \frac{1 + r_{\text{post}}}{1 + \text{infl}_{\text{post}}} - 1$
- Adjusted for monthly pension cash flows: $\text{AnnualWithdrawal} = \max(0, \text{MonthlyExpense} - \text{Pension}) \times 12$

### D. Dynamic Glidepath
Beginning 3 years prior to target goal year, the portfolio automatically begins de-risking equity into high-quality debt and liquid cash buffers to prevent capital erosion right before liquidity is required.

---

## 3. Data Provenance & Disclosures

1. **Direct Plans Only**: Shortlisted funds are 100% Direct Plans (`TER: 0.12% – 0.64%`). No distributor commission kickbacks.
2. **Synthetic Historical Backtests**: 2016–2025 backtests are watermarked: *"Synthetic demo backtest—not actual fund performance. Past performance does not guarantee future returns."* Metrics (CAGR, annualised volatility, maximum drawdown) are calculated directly from the underlying asset class weights.
3. **SEBI Disclosures (Regulation 18)**: Fee-only advisory, conflict of interest statements ("No conflicts declared"), and adviser identity are transparently disclosed.

---

## 4. Test Suite Instructions

To run the unit tests:

```bash
# Run financial mathematics engine tests
npx --yes tsx --test src/utils/financialMath.test.ts

# Run suitability rules & guardrails engine tests
npx --yes tsx --test src/utils/suitabilityRules.test.ts
```

All 13 unit tests execute in milliseconds using Node's native test runner (`node:test` and `node:assert/strict`).

---

## 5. 12-Step Guided Walkthrough

Click **"Run 12-Step Demo"** in the top navigation or overview hero to step through:

1. **Select Persona**: Review the 6 diverse personas (Fresh Grad, Couple, Business Owner, Doctor, Retiree, Aggressive Trader).
2. **Review Profile Inputs**: Inspect transparent capacity and tolerance parameters.
3. **Capacity vs Tolerance Separation**: Observe independent scoring and regulatory policy ("lower of the two sets maximum risk band").
4. **Goal Planner**: Simulate inflation, required SIP, and retirement annuity drawdowns.
5. **Portfolio Lab**: Explore direct funds and 100% allocation validation.
6. **10-Year Backtest**: Verify synthetic disclosure and calculated CAGR/drawdown.
7. **Research Copilot**: Query SIDs and inspect exact document-page citations.
8. **Compliance Guardrails**: Test refusal of guaranteed return prompts (SEBI Code of Conduct).
9. **Approval Centre**: Inspect watermarked `DRAFT—NOT FOR CLIENT DISTRIBUTION` dossier.
10. **Digital Sign-Off**: Check RIA fiduciary declaration and sign with digital stamp.
11. **Approved Client Presentation**: Unlock official printable presentation deliverable.
12. **Audit Trail**: Inspect immutable chronological timeline.
