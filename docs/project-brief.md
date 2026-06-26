# Nutanix Developer Cloud Studio - Project Brief

## Product Thesis

Nutanix Developer Cloud Studio is a self-service developer portal for launching governed application environments on Nutanix-powered infrastructure.

The first version should be a polished MVP and clickable product prototype. It should demonstrate the product story clearly without requiring live Nutanix infrastructure, production credentials, or real provisioning APIs.

## Target Users

- Developers who need fast access to approved app environments
- Platform teams who need governance, visibility, and reusable delivery patterns
- Infrastructure leaders evaluating how Nutanix services can support internal developer platform workflows

## Core Experience

1. A developer opens the portal dashboard.
2. They choose an app template or golden path from the catalog.
3. They create a new environment by selecting target services.
4. The system runs simulated policy, cost, and compliance checks.
5. The environment enters a mocked provisioning workflow.
6. The developer lands on a status page with logs, resources, ownership, and next steps.
7. Platform admins can inspect templates, policies, usage, and integration health.

## Prototype Integrations

- NCI: core infrastructure and VM capacity
- NKP: Kubernetes platform targets
- NDB: database-as-a-service workflows
- NUS: storage and file/object service patterns
- NCM: governance, self-service, and operations hooks
- NAI: AI endpoint or model-serving targets

## Future Real Integrations

- Nutanix Prism Central APIs
- Nutanix Calm or NCM Self-Service blueprints
- NKP APIs or Kubernetes APIs
- NDB APIs
- NUS APIs
- SSO/OIDC identity
- Terraform, Crossplane, or similar provisioning control planes

## MVP Principle

Prototype first, integrate second. The MVP should validate workflow, language, stakeholder value, and product fit before connecting to production infrastructure.

