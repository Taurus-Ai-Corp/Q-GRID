# Q-GRID Canadian Pilot Program Framework

**Status**: Ready for Implementation
**Last Updated**: November 29, 2025
**Target Launch**: Week 2-4, 2025

---

## Executive Summary

Q-GRID is launching a three-phase pilot program to establish quantum-ready payment infrastructure across Canadian markets. Phase 1 focuses on Indigenous communities and remote/northern regions, leveraging the Bank of Canada's CBDC gap to position Q-GRID as the quantum-ready alternative the government chose not to build.

**Key Metrics**:
- Phase 1 (6 months): 10,000 Indigenous users, $300K+ CAD grant funding
- Phase 2 (6 months): 50,000 remote/northern users, 3-5 credit union partnerships
- Phase 3 (6 months): OSFI Fintech Sandbox approval, mainstream banking traction

**Total Year 1 Target**: 60,000+ users, $8M CAD revenue (conservative: $3M-$5M)

---

## Phase 1: Indigenous Communities Pilot (Months 0-6)

### Strategic Rationale

**Market Opportunity**:
- 1.7 million Indigenous Canadians across 634 First Nations reserves
- 40%+ reserves lack reliable broadband internet connectivity
- Traditional KYC costs: $150-$300 per person (95% cost reduction opportunity)
- Estimated 200,000 Indigenous users (Year 1-2 potential)

**Why Indigenous First?**:
1. **Data Sovereignty**: Indigenous communities control their financial infrastructure
2. **Regulatory Advantage**: Indigenous-governed financial institutions have different regulatory pathways
3. **Product-Market Fit**: Offline capability solves genuine pain point (no internet)
4. **Partnership Foundation**: FNBC partnership accelerates all future expansion
5. **Social Impact**: Aligns with Q-GRID's quantum-ready + inclusion mission

### Pilot Design

#### Partner Selection Criteria

**Primary Partner: First Nations Bank of Canada (FNBC)**
- Only Canadian bank with 90%+ Indigenous client base
- Full-service commercial bank (assets: $1.2B+)
- Located in Saskatoon (easy access to reserve communities)
- Contacts: https://www.fnbc.ca/

**Why FNBC**:
- ✅ Existing regulatory licenses (bypasses MSB registration for Year 1-2)
- ✅ 200+ Indigenous clients across multiple provinces
- ✅ Interest in innovation (fintech partnerships aligned with strategy)
- ✅ Revenue alignment (60% Q-GRID, 40% FNBC split for initial pilot)

**Secondary Partners** (3-5 Reserve Communities):
- Criteria:
  - Population: 500-1,000 community members
  - Leadership: Progressive chief/council open to financial innovation
  - Internet: Limited/unreliable broadband (demonstrates offline value)
  - Geography: West/Central Canada (proximity to FNBC, market focus)

**Candidate Communities** (by province):
- **Saskatchewan**: Prince Albert, Pelican Lake, Meadow Lake Cree Nation
- **Alberta**: Dene Tha' First Nation, Athabasca Chipewyan First Nation
- **Manitoba**: Opaskwayak Cree Nation, Long Plain First Nation

**Community Selection Process** (Month 1-2):
1. FNBC identifies 5-10 candidate reserves
2. Initial consultation with Chiefs/Councils (cultural respect + buy-in)
3. Needs assessment (internet connectivity, payment infrastructure, pain points)
4. Final selection of 3 communities for pilot launch
5. Community co-design sessions (ensure Q-GRID reflects Indigenous priorities)

#### Pilot Parameters

**User Onboarding**:
- Target: 10,000 total users across 3 reserves (3,300-3,500 per community)
- Rollout: Phased community-by-community over 6 months
  - Month 2: Community 1 - 1,000 users
  - Month 3: Community 2 - 2,000 users
  - Month 4: Community 3 - 3,000 users
  - Month 5-6: Scale to 10,000 users (organic growth + word-of-mouth)

**Technology Stack**:
- Frontend: Q-GRID mobile app (Android/iOS) - existing
- Backend: Hedera distributed ledger (10,000+ TPS capacity)
- Offline: Bluetooth mesh, NFC, QR, SMS (USSD fallback for non-smartphones)
- KYC: Zero-knowledge proofs (Aadhaar-equivalent for Canada, respecting sovereignty)

**Use Cases Enabled**:

1. **Peer-to-Peer Payments** (Primary)
   - Send money to anyone in community via phone number/QR code
   - Offline capability: Create transaction on phone, sync when internet available
   - 95% offline transaction success target

2. **Merchant Payments** (Community Businesses)
   - Local artisans, stores, tourism operators
   - $1.50 CAD minimum transaction (true micropayment)
   - Real-time settlement through FNBC account

3. **Government Benefits** (Phase 1b - Month 5+)
   - Federal/provincial benefits distribution (if partnership allows)
   - Band council payments to members
   - Economic stimulus direct to Indigenous communities

4. **Cross-Border Payments** (Month 4+)
   - Canada-US tribal commerce
   - International remittances (high-fee corridor pain point)

**Success Metrics** (Month 6 Exit Criteria):

| Metric | Target | Status |
|--------|--------|--------|
| Active users | 10,000 | TBD |
| Offline transaction success rate | 95%+ | TBD |
| Transaction latency (offline) | <200ms | TBD |
| Settlement latency (online) | <5 seconds | TBD |
| KYC cost per user | $5 CAD | TBD |
| User retention (30-day) | 75%+ | TBD |
| Monthly active transactions | 100K+ | TBD |
| Community satisfaction score | 4.0/5.0+ | TBD |
| Offline sync success | 99%+ | TBD |
| Fraud/incident rate | <0.1% | TBD |

#### Financial Model (Phase 1)

**Costs**:
- FNBC partnership team: $50K (liaison, support, marketing)
- Community liaisons: $30K (3 reserves × $10K each)
- Technical support staff: $40K (1 FTE support engineer)
- AWS Canadian infrastructure: $15K (data residency, PIPEDA compliance)
- Marketing/community education: $25K (materials, events, signage)
- Contingency (10%): $16K

**Total Phase 1 Cost**: $176K CAD

**Funding Sources** (Year 1):
- IRAP Accelerated Review: $50K (apply Week 1)
- Indigenous Innovation Initiative: $150K-$250K (apply Week 2)
- **Total Expected**: $200K-$300K CAD (covers 113-170% of costs)
- Surplus: Buffer for scale-up or community development initiatives

**Revenue** (Conservative Phase 1):
- KYC fees: 10,000 users × $5 = $50K
- Transaction fees (0.1% avg): 100K transactions × $50 avg × 0.1% = $5K
- FNBC partnership share: $50K (grant allocation)

**Phase 1 Total Revenue**: $105K CAD (offset by grant funding)

---

## Phase 2: Remote/Northern Canada Expansion (Months 6-12)

### Market Opportunity

**Geographic Scope**:
- Yukon: 42,000 population
- Northwest Territories: 45,000 population
- Nunavut: 39,000 population
- Northern BC, AB, ON, QC, MB: ~103,000 combined

**Total TAM**: 229,000 population, 200,000 addressable users

**Pain Points** (Unique to North):
1. **Internet Outages**: Weather-related disruptions (weeks at a time)
2. **High Payment Costs**: 2-3x fees for card processing in remote areas
3. **Tourism Seasonality**: Unpredictable cash flow in tourism communities
4. **Cross-Border Commerce**: Alaska/Canada border communities need easy USD/CAD exchange

### Pilot Expansion Strategy

**Credit Union Partners** (vs big banks):
- Why credit unions: Innovation-focused, community-owned, faster approvals
- Candidates:
  - **Duca Credit Union** (Ontario) - 200K+ members, remote interest
  - **Vancity** (BC) - $20B+ assets, Indigenous partnerships
  - **Meridian Credit Union** (Ontario/Manitoba) - 200K+ members

**Marketing Channels**:
- Regional fintech events (Northern Business Summit, Yukon Chamber of Commerce)
- Tourism operator associations (accommodations, adventure companies)
- Regional government partnerships (territorial/provincial)

**Go-Live Timeline**:
- Month 6: Select 2-3 credit union partners (MOU signed)
- Month 7-8: Technical integration + pilot community identification
- Month 9: Launch in 3-5 northern communities
- Month 10-12: Scale to 50,000+ users

**Target User Growth**:
- Month 6 launch: 5,000 users
- Month 9 peak: 20,000 users
- Month 12 end: 50,000 users

---

## Phase 3: Banking Sandbox & Mainstream Launch (Months 12-18)

### OSFI Fintech Regulatory Sandbox

**Overview**:
- OSFI (Office of the Superintendent of Financial Institutions) provides controlled testing environment
- Parameters: 10,000 users per institution, $10K CAD max transaction, 6-12 month pilot
- Exit: Successful metrics → Full Money Services Business (MSB) license

**Application Timeline**:
- Month 10-12: Prepare sandbox application (parallel to Phase 2)
- Month 12: Submit to OSFI
- Month 13-14: OSFI review + approval (2 months typical)
- Month 15: Sandbox launch
- Month 18: Sandbox exit criteria evaluation

**Target Banking Partners** (for sandbox):
1. **First Nations Bank of Canada** (primary from Phase 1)
2. **3-5 Credit Unions** (from Phase 2)
3. **1-2 Neo-Banks** (Koho, Wealthsimple for speed-to-market)

### Mainstream Launch (Months 15-18)

**Market Entry Strategy**:

1. **Enterprise SaaS Model**:
   - Target: 50-100 financial institutions
   - Price: $10K-$50K/month per institution
   - Value: Quantum-ready infrastructure, 99.73% fraud detection

2. **B2B2C through FNBC/Credit Unions**:
   - Leverage Phase 1-2 partnerships for distribution
   - White-label Q-GRID to FNBC customers
   - Revenue share: 60% Q-GRID, 40% partner

3. **Direct Merchant (B2C)**:
   - Merchants integrated via Shopify, WooCommerce
   - Payment processing: 0.75% + $0.10 per transaction
   - Monthly fee: $25 CAD (unlimited transactions)

**Year 1 Revenue Target**: $8M CAD (conservative: $3M-$5M)

---

## Success Criteria & Milestones

### Phase 1 (Indigenous Communities) - Months 0-6

**Timeline Milestones**:
- ✅ Week 1-2: FNBC MOU signed
- ✅ Week 3-4: IRAP grant application submitted
- ✅ Week 5-6: 3 reserve communities selected
- ✅ Week 7-8: Community co-design sessions complete
- ✅ Month 2: Community 1 launch (1,000 users)
- ✅ Month 3: Community 2 launch (2,000 users)
- ✅ Month 4: Community 3 launch (3,000 users)
- ✅ Month 5-6: Scale to 10,000 users

**Success Metrics**:
- 10,000+ active users (vs 3,300 target)
- 95%+ offline transaction success rate
- <200ms transaction latency (offline/online)
- 75%+ 30-day retention
- <0.1% fraud rate
- 4.0+/5.0 community satisfaction score
- $300K+ CAD grant funding secured

### Phase 2 (Remote/Northern) - Months 6-12

**Timeline Milestones**:
- ✅ Month 6: Credit union partnerships signed (2-3 partners)
- ✅ Month 7-8: Technical integration complete
- ✅ Month 9: Launch in 3-5 northern communities (5,000 users)
- ✅ Month 10: 20,000 users across north
- ✅ Month 12: 50,000 users, mainstream readiness

**Success Metrics**:
- 50,000+ active users in Phase 2
- 3-5 credit union partnerships
- 95%+ offline success rate maintained
- Expansion revenue: $2M-$3M CAD
- OSFI sandbox pre-approval signals (positive feedback)

### Phase 3 (Banking Sandbox) - Months 12-18

**Timeline Milestones**:
- ✅ Month 10-12: OSFI sandbox application prepared
- ✅ Month 12: Submit to OSFI
- ✅ Month 13-14: OSFI approval received
- ✅ Month 15: Sandbox launch with FNBC, credit unions, neo-banks
- ✅ Month 18: Sandbox exit + mainstream ready

**Success Metrics**:
- OSFI sandbox approval granted
- 10,000+ users in sandbox (per institution)
- All regulatory/compliance requirements met
- Quantum-ready infrastructure validated
- Enterprise SaaS MRR: $100K+ CAD
- Mainstream financial institutions expressing interest (3-5 LOIs)

---

## Governance & Decision-Making

### Pilot Steering Committee

**Membership** (7-9 people):
- Q-GRID CEO (chair)
- FNBC Partnership Lead
- Indigenous Community Representative (rotating)
- Chief Technology Officer (Q-GRID)
- Chief Compliance Officer (Q-GRID)
- Regional Finance Director (FNBC)
- Community Liaison Manager

**Cadence**: Bi-weekly meetings (first 2 months), then monthly

**Responsibilities**:
- Approve major pivots (product, marketing, technical)
- Monitor success metrics
- Escalate blockers/risks
- Community feedback integration
- Budget/resource allocation

### Community Advisory Board (Phase 1-specific)

**Membership** (6-8 Indigenous leaders):
- Chief from each pilot community (3)
- Indigenous fintech expert (external advisor)
- NACCA representative (Indigenous Financial Institutions)
- Elder/cultural advisor (community protocols respect)

**Cadence**: Monthly meetings (virtual/in-person hybrid)

**Responsibilities**:
- Ensure cultural appropriateness
- Advise on community needs
- Feedback on product/marketing
- Bridge between Q-GRID and communities

---

## Risk Management

### Key Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| FNBC partnership falls through | Phase 1 completely blocked | Low (FNBC interested) | Early MOU signature, escalate to CEO level |
| Community adoption slower than 10K target | Revenue/growth impact | Medium | Pre-pilot interviews, co-design, community incentives |
| Internet infrastructure failures | Offline sync issues | Low (offline-first design) | 6-month testing + redundancy |
| Regulatory approval delays (FINTRAC/OSFI) | Phase 2-3 delayed | Medium | Proactive engagement, sandbox pathway |
| Data privacy incidents | Reputational/legal | Low (PIPEDA compliant, encryption) | Regular audits, incident response plan |
| Competition enters market | Margin compression | Medium | Speed to market, Indigenous focus differentiation |

---

## Resource Allocation

### Phase 1 Team (6 months)

**Headcount**:
- Product Lead: 1 FTE (leads FNBC relationship, product decisions)
- Community Manager: 1 FTE (in-field liaison with 3 reserve communities)
- Technical Support: 1 FTE (deployment, troubleshooting, 24/5 coverage)
- Compliance Officer: 0.5 FTE (regulatory/privacy coordination)
- Designer (part-time): 0.3 FTE (community materials, app UX refinements)

**Total Phase 1 FTE**: 3.8 FTE equivalent

**Budget** (detailed above):
- Personnel: $95K (3.8 FTE × $25K average for 6 months)
- Infrastructure: $15K (AWS Canadian region)
- Marketing/Community: $25K
- Partner support (FNBC): $50K
- Contingency: $16K
- **Total**: $201K CAD (covered by grants $200K-$300K)

---

## Success Story Vision

**6-Month Outcome** (March 2026):

*"Q-GRID has deployed Quantum-ready payment infrastructure to 10,000 Indigenous Canadians across three reserve communities. Indigenous artisans selling crafts no longer wait 3-7 days for payments to clear. Remote reserve stores accept payments through QR codes that work offline. The technology that protects the entire Canadian financial system by 2030 is already protecting Indigenous communities today.

FNBC has committed to scaling Q-GRID to 50,000 Indigenous users. Three credit unions in Northern Canada are queued up to launch. And OSFI is evaluating Q-GRID's quantum-ready architecture as a model for the entire Canadian banking system."*

---

## Appendices

### A. FNBC Contact Strategy

**Key Contacts**:
- President/CEO: Mike Schwean (mike.schwean@fnbc.ca)
- Director of Innovation: TBD (via FNBC website)
- Board Member (Technology): TBD

**Pitch Points**:
1. Revenue: 60% share of Q-GRID pilot revenue/grants
2. Differentiation: Only Indigenous-serving bank with quantum-ready infrastructure
3. Market expansion: Technology platform to scale beyond current reach
4. Regulatory: Pre-built compliance framework
5. Community impact: Strengthens FNBC's Indigenous leadership position

### B. Indigenous Community Engagement Framework

**Cultural Protocols**:
- All meetings begin with acknowledgment of Traditional territories
- Decision-making follows consensus-based (not speed-based) approach
- Community leadership owns all public communications
- Revenue sharing explicitly discussed (not extractive relationship)
- Data sovereignty: Communities control all data (can opt-out anytime)

**Language & Translation**:
- Materials translated to local Indigenous languages (if >100 speakers in community)
- Meetings offer real-time interpretation
- Q-GRID team completes Indigenous cultural competency training

### C. Grant Application Checklist

- [ ] Week 1: IRAP Accelerated Review application (detailed budget, R&D objectives)
- [ ] Week 2: Indigenous Innovation Initiative application (community letters of support)
- [ ] Week 3: Provincial innovation grant research (ON/BC programs)
- [ ] Month 2: National Quantum Strategy planning (3-year project outline)

---

## Document Control

**Version**: 1.0 (Final - Ready for Implementation)
**Author**: Q-GRID Executive Team
**Approval**: Board of Directors
**Last Updated**: November 29, 2025
**Next Review**: December 15, 2025 (post-FNBC meeting)

---

## Next Actions

1. **This Week (Week 1)**:
   - Schedule FNBC CEO meeting (aim for Dec 5-9)
   - Begin IRAP Accelerated Review application
   - Identify Indigenous advisors for Community Advisory Board

2. **Week 2**:
   - Submit IRAP application
   - Draft Indigenous Innovation Initiative application
   - Complete community selection criteria refinement

3. **Week 3-4**:
   - Finalize FNBC MOU
   - Indigenous Innovation application submission
   - Begin community outreach for pilot participation

**Success = FNBC MOU signed by December 20, 2025**

---

**For questions or feedback**: governance@q-grid.ca
