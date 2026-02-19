# HIPAA Compliance Review
## SS Navigator — Sebastian Strong Foundation
**Version:** 1.0 (Prototype/MVP)
**Date:** February 2025
**Prepared by:** Development Team
**Status:** ⚠️ HIPAA-Aligned Prototype — Not Yet Fully HIPAA Compliant

---

## Executive Summary

SS Navigator is a web application that helps families of children facing childhood cancer navigate resources, community support, and professional guidance. This document reviews the application's current HIPAA posture and outlines the steps required to achieve full HIPAA compliance before handling Protected Health Information (PHI) in a production context.

> **Important:** This prototype is designed with HIPAA principles in mind but is **not yet fully HIPAA compliant**. Full compliance requires additional organizational, contractual, and technical safeguards outlined below. The Sebastian Strong Foundation should engage qualified HIPAA counsel and a compliance officer before launching with PHI.

---

## Does SS Navigator Handle PHI?

### What is PHI?
Protected Health Information (PHI) is any individually identifiable health information relating to:
- An individual's past, present, or future physical or mental health condition
- The provision of health care to the individual
- Payment for health care

### SS Navigator's PHI Exposure

| Data Collected | PHI Status | Notes |
|---|---|---|
| User email address | ⚠️ Indirect identifier | Alone, not PHI. Combined with health data = PHI |
| Child's name | ⚠️ Indirect identifier | Combined with health data = PHI |
| Cancer diagnosis | 🔴 PHI | Specific health condition |
| Treatment stage | 🔴 PHI | Health condition information |
| Treatment center | 🔴 PHI | Healthcare provider information |
| State/city/zip | ⚠️ Geographic identifier | Sub-region data can be PHI |
| Saved resources | ⚠️ May imply health needs | Inferred health information |
| AI conversation history | 🔴 Likely PHI | Contains health discussions |
| Community messages | 🔴 Likely PHI | User-shared health information |
| Contact form submissions | 🔴 Likely PHI | May contain medical details |
| Audit logs | 🟡 Operational | PHI-adjacent |

**Conclusion:** SS Navigator collects and processes PHI. Full HIPAA compliance is required before production deployment handling real patient data.

---

## Current HIPAA-Aligned Architecture

### ✅ What We've Built Right

#### 1. Authentication & Access Control
- **Supabase Auth** provides industry-standard JWT-based authentication
- **Session timeout:** 30-minute inactivity timeout with 5-minute warning dialog
- **Protected routes:** All PHI-containing pages require authentication
- Users cannot access other users' data (enforced at the application layer)

#### 2. Row-Level Security (RLS)
All 10 database tables have RLS policies enforced at the PostgreSQL level:
```sql
-- Example: user_profiles RLS
CREATE POLICY "Users can only see their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);
```

This means even if application code has bugs, database queries cannot return another user's data.

#### 3. Encryption at Rest & In Transit
- **Supabase (PostgreSQL):** Data encrypted at rest using AES-256
- **HTTPS/TLS:** All data in transit encrypted via TLS 1.2+
- **Supabase Edge Functions:** Run in isolated Deno environments

#### 4. Audit Logging
The `audit_log` table records:
- User ID and action taken
- Resource type and ID affected
- Timestamp (immutable)
- IP address (when available from edge function)
- Metadata (including AI crisis detection flags)

This provides an audit trail for investigating potential breaches.

#### 5. AI Guardrails (No Medical Advice)
Hope, our AI Sherpa, has hard-coded guardrails:
- Cannot provide medical diagnoses or treatment recommendations
- Crisis detection triggers immediate escalation to human resources
- All conversations logged for audit purposes
- System prompt includes explicit prohibition on medical advice

#### 6. Data Minimization
- Only collects data that serves a specific function
- Diagnosis and treatment fields are optional
- "Prefer not to say" option for treatment stage
- Community display names are pseudonymous

#### 7. Privacy-First UI/UX
- Crisis resources always visible (no barrier to access)
- Clear privacy notices on registration
- Data only used to improve resource recommendations
- No third-party advertising or tracking pixels

---

## HIPAA Gaps — What Needs to Be Done

### 🔴 Critical Gaps (Required Before Production)

#### Gap 1: Business Associate Agreements (BAAs)
**Status:** ❌ Not in place
**Requirement:** HIPAA requires BAAs with all vendors that handle PHI.

Required BAAs:
- **Supabase** — Supabase offers BAAs on HIPAA-eligible plans (Team or Enterprise). Must upgrade and execute BAA.
- **Anthropic (Claude API)** — Check current BAA availability. If not available, AI responses must not include or process PHI in prompts.
- **Hosting/CDN provider** — If using Lovable or other hosting, obtain BAA.

**Action:** Contact each vendor, upgrade to BAA-eligible plan, execute agreements.

#### Gap 2: HIPAA Privacy Policy & Notices
**Status:** ❌ Not implemented
**Requirement:** Must have a Notice of Privacy Practices (NPP) accessible to all users.

**Action:**
- Draft NPP with qualified HIPAA counsel
- Display NPP link prominently (footer, registration, sign-in)
- Obtain user acknowledgment of NPP
- Post to sebastianstrong.org

#### Gap 3: HIPAA Security Officer Designation
**Status:** ❌ Not designated
**Requirement:** Covered entities must designate a Privacy Officer and Security Officer.

**Action:** Sebastian Strong Foundation leadership must designate:
- HIPAA Privacy Officer (can be same person)
- HIPAA Security Officer
- Document designation in writing

#### Gap 4: Risk Assessment
**Status:** ❌ Not completed
**Requirement:** HIPAA Security Rule requires a documented, organization-wide risk analysis.

**Action:** Conduct and document a formal risk assessment covering:
- All PHI data flows
- Technical vulnerabilities
- Administrative safeguards
- Physical safeguards

#### Gap 5: Staff Training
**Status:** ❌ Not documented
**Requirement:** All workforce members with PHI access must receive HIPAA training.

**Action:**
- Develop HIPAA training curriculum
- Train all staff and volunteers
- Document training completion dates
- Refresh annually

#### Gap 6: Breach Response Policy
**Status:** ❌ Not documented
**Requirement:** Must have documented breach notification procedures (60-day notification to HHS, affected individuals).

**Action:** Develop and test a Breach Response Plan.

---

### 🟡 Recommended Technical Enhancements

#### Enhancement 1: Password Policies
**Current:** Supabase default (minimum 6 characters)
**Recommended:**
- Minimum 12 characters
- Complexity requirements
- Account lockout after 5 failed attempts

**Implementation:** Configure in Supabase Auth settings and add client-side validation.

#### Enhancement 2: Multi-Factor Authentication (MFA)
**Current:** Password-only
**Recommended:** Optional TOTP-based MFA (authenticator app)

**Implementation:** Supabase supports TOTP MFA — enable in project settings and add UI.

#### Enhancement 3: Automatic Session Invalidation
**Current:** 30-minute client-side timeout
**Recommended:** Server-side session validation + automatic invalidation on backend

**Implementation:** Use Supabase `auth.setSession()` with shorter JWT expiry.

#### Enhancement 4: Audit Log Immutability
**Current:** Audit log has `DELETE` access for admins
**Recommended:** Make audit log append-only (no UPDATE or DELETE even for admins)

**Implementation:** Remove DELETE/UPDATE RLS policies from `audit_log` table.

#### Enhancement 5: Data Retention Policy
**Current:** Data retained indefinitely
**Recommended:** Define and enforce retention periods:
- AI conversation history: 2 years
- Community messages: 5 years or user-controlled
- Audit logs: 6 years (HIPAA minimum)
- Contact submissions: 3 years

**Implementation:** Supabase scheduled functions to purge old data.

#### Enhancement 6: PHI Segmentation in AI
**Current:** User's diagnosis/stage sent to Claude API
**Recommended:** Consider whether to de-identify context sent to AI:
- Send only general region (state), not specific diagnosis
- Implement AI context without direct PHI inclusion
- Alternatively, obtain Anthropic BAA

#### Enhancement 7: Community Message Content Moderation
**Current:** No automated moderation
**Recommended:** Add content flagging, moderator tools, and PHI scrubbing warning for community posts

#### Enhancement 8: Right to Access / Right to Delete
**Current:** Users can update but not formally delete their account
**Recommended:** Implement:
- Data export (download all my data)
- Account deletion with PHI purge
- Data access request workflow

---

## HIPAA Compliance Roadmap

### Phase 1: Foundation (Before any beta users) — Est. 4–6 weeks
- [ ] Execute BAAs with Supabase, Anthropic (if applicable)
- [ ] Designate Privacy Officer and Security Officer
- [ ] Complete initial risk assessment
- [ ] Draft and post Notice of Privacy Practices
- [ ] Conduct staff HIPAA training
- [ ] Develop breach response plan

### Phase 2: Technical Hardening — Est. 2–4 weeks
- [ ] Upgrade Supabase to HIPAA-eligible plan
- [ ] Implement MFA option
- [ ] Strengthen password policy
- [ ] Make audit log append-only
- [ ] Implement account deletion / data export
- [ ] Add server-side session validation

### Phase 3: Ongoing Compliance — Quarterly
- [ ] Risk assessment review
- [ ] Staff training refresh
- [ ] BAA status check with all vendors
- [ ] Penetration testing / vulnerability assessment
- [ ] Audit log review

---

## Community Module Special Considerations

The community hub presents unique HIPAA challenges:

**Risk:** Users may post their child's name, diagnosis, treatment details, or photos in community messages. This is user-generated PHI that the Foundation has limited control over.

**Mitigation Recommendations:**
1. **Terms of Service** clearly discouraging PHI in community messages
2. **Moderation tools** for navigators to remove PHI from posts
3. **Warning banners** before posting ("Don't share identifying medical information")
4. **Optional anonymization** — allow users to post as "Community Member" instead of display name

---

## AI Sherpa (Hope) Special Considerations

The AI module creates specific compliance considerations:

**Data sent to Anthropic's API:**
- User's message content (may contain PHI)
- User context (treatment_stage, state, diagnosis — PHI)
- Conversation history

**Current Status:** Anthropic does not currently offer a standard BAA. Options:
1. **De-identify AI context:** Remove direct PHI from API calls, use only general context
2. **Monitor Anthropic BAA availability:** Check anthropic.com/legal periodically
3. **Self-hosted model:** Consider running an open-source LLM (significant infrastructure cost)

**Recommended short-term approach:** Remove `diagnosis` from the user context sent to Claude API. Keep treatment stage and state (less specific). Display a clear UI notice that the AI assistant is powered by a third-party API.

---

## Supabase HIPAA Configuration Checklist

When upgrading Supabase to an HIPAA-eligible plan:

- [ ] Enable Point-in-Time Recovery (PITR) backups
- [ ] Enable Database Encryption at Rest (EAR)
- [ ] Configure network restrictions (IP allowlisting for admin access)
- [ ] Enable audit logging at the database level (pgaudit)
- [ ] Configure automated backups with encryption
- [ ] Enable SSL enforcement
- [ ] Disable direct database connections (use only API/Edge Functions)
- [ ] Set up database connection pooling (PgBouncer) for performance + security
- [ ] Review and restrict database user permissions

---

## Conclusion

SS Navigator has been architected with HIPAA principles as a foundation:
- Row-level security on all tables
- Session management and timeout
- Audit logging
- Encrypted data storage and transport
- AI guardrails preventing medical advice

However, achieving full HIPAA compliance requires organizational commitments (BAAs, policies, training, designated officers) that go beyond the technical implementation. The Sebastian Strong Foundation should treat HIPAA compliance as an ongoing program, not a one-time checklist.

**We strongly recommend engaging a qualified HIPAA compliance consultant or attorney to guide the Foundation through full compliance before opening SS Navigator to the public.**

---

## References

- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [HHS HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [Supabase HIPAA Compliance](https://supabase.com/docs/guides/platform/hipaa)
- [HHS Breach Notification Rule](https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html)
- [HHS Risk Assessment Guidance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html)

---

*This document was prepared for internal review purposes and does not constitute legal advice. Consult qualified HIPAA counsel for compliance determinations.*
