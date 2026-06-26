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

- Extract mock data into dedicated domain files
- Add persisted local state for requested environments
- Add a richer job simulation with timed status transitions
- Add template detail pages
- Add admin template editing states
- Add integration readiness notes for Prism Central, NKP, NDB, NUS, NCM, and NAI

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
