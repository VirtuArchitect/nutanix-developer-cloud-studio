# Nutanix Developer Cloud Studio - Build Plan

## Recommended Next Step

Build the first clickable prototype as a polished web app with simulated data and mock provisioning workflows.

The goal is to make the product thesis visible quickly: developers can request governed environments, and platform teams can control templates, integrations, policies, and cost.

## First Implementation Slice

- Created a modern frontend app shell
- Added developer dashboard
- Added app catalog with golden-path templates
- Added create-environment workflow
- Added simulated policy, cost, and compliance checks
- Added environment status page with provisioning timeline
- Added admin view for platform teams
- Kept all data mocked locally first

## Next Implementation Slice

- Extract mock data into dedicated domain files - done
- Add persisted local state for requested environments - done
- Add a richer job simulation with timed status transitions - done
- Add template detail pages - done
- Add admin template editing states - done
- Add integration readiness notes for Prism Central, NKP, NDB, NUS, NCM, and NAI - done

## Current Implementation Slice

- Mock product data now lives in `src/data/cloudStudioData.ts`
- Mock provisioning behavior now lives in `src/services/provisioningService.ts`
- Requested environments persist in browser local storage
- Admin template governance edits persist in browser local storage
- The environment status screen advances through timed mock job states
- AI endpoint requests pause at an approval state
- Catalog templates have a details view with outcomes and integration readiness
- Admins can edit prototype template owner and tier state
- Admin integration readiness notes describe the first real API questions for NCI, NKP, NDB, NUS, NCM, and NAI
- Unit tests cover cost estimates, persistence, environment upsert/status behavior, and job transitions
- `docs/demo-script.md` provides the stakeholder walkthrough
- `docs/hosting.md` captures prototype and on-premises hosting direction

## Next Recommended Slice

- Add an end-to-end smoke test for catalog to create to status
- Add a backend-shaped mock API adapter interface for future Nutanix integrations
- Add CI checks for build and unit tests
- Add GitHub Pages or another static hosting workflow for prototype sharing
- Add a lightweight approval queue interaction for AI endpoint and regulated data requests

## Suggested Tech Stack

- React or Next.js for the prototype UI
- TypeScript for safer product modeling
- Tailwind CSS or a small local design system for fast UI polish
- Mock data files for templates, environments, policies, integrations, and jobs
- Optional API later once the workflow is validated

## Success Criteria

- A stakeholder can understand the product in under five minutes
- A developer can complete a create-environment flow without explanation
- The prototype feels realistic enough to discuss real Nutanix integration priorities
- The admin view explains platform-team value, not just developer convenience
