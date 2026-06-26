import {
  Activity,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  Pencil,
  Play,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import cloudVisual from "./assets/developer-cloud-visual.png";
import veridianMark from "./assets/veridian-mark-teal.svg";
import {
  allTargets,
  integrations,
  provisioningEvents,
  targetIcons,
  templates,
  type Environment,
  type JobState,
  type Target,
  type Template,
  type TemplateGovernance,
  type TemplateTier,
  type View,
} from "./data/cloudStudioData";
import {
  estimateMonthlyCost,
  getProvisioningSnapshot,
  loadEnvironments,
  loadTemplateGovernance,
  saveEnvironments,
  saveTemplateGovernance,
  updateEnvironmentStatus,
  upsertRequestedEnvironment,
} from "./services/provisioningService";

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [selectedTargets, setSelectedTargets] = useState<Target[]>(templates[0].targets);
  const [environmentName, setEnvironmentName] = useState("checkout-api-dev");
  const [region, setRegion] = useState("Berlin Lab");
  const [jobState, setJobState] = useState<JobState>("Idle");
  const [jobStep, setJobStep] = useState(0);
  const [environments, setEnvironments] = useState<Environment[]>(() => loadEnvironments());
  const [templateGovernance, setTemplateGovernance] = useState<TemplateGovernance>(() =>
    loadTemplateGovernance(templates)
  );

  const selectedTemplate = enrichTemplate(templates.find((template) => template.id === selectedTemplateId) ?? templates[0], templateGovernance);
  const estimatedCost = useMemo(() => estimateMonthlyCost(selectedTemplate, selectedTargets), [selectedTargets, selectedTemplate]);

  useEffect(() => {
    saveEnvironments(environments);
  }, [environments]);

  useEffect(() => {
    saveTemplateGovernance(templateGovernance);
  }, [templateGovernance]);

  useEffect(() => {
    if (jobState !== "Queued" && jobState !== "Running") {
      return;
    }

    const snapshot = getProvisioningSnapshot(jobStep, selectedTargets);
    if (snapshot.complete) {
      setJobState(snapshot.jobState);
      const nextEnvironmentStatus = snapshot.environmentStatus;
      if (nextEnvironmentStatus) {
        setEnvironments((current) => updateEnvironmentStatus(current, environmentName, nextEnvironmentStatus));
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setJobStep((current) => current + 1);
      setJobState("Running");
    }, provisioningEvents[jobStep].durationMs);

    return () => window.clearTimeout(timeout);
  }, [environmentName, jobState, jobStep, selectedTargets]);

  function selectTemplate(id: string) {
    const template = templates.find((item) => item.id === id) ?? templates[0];
    setSelectedTemplateId(template.id);
    setSelectedTargets(template.targets);
    setView("create");
  }

  function openTemplate(id: string) {
    setSelectedTemplateId(id);
    setView("template");
  }

  function toggleTarget(target: Target) {
    setSelectedTargets((current) =>
      current.includes(target) ? current.filter((item) => item !== target) : [...current, target]
    );
  }

  function launchEnvironment() {
    setJobState("Queued");
    setJobStep(0);
    setEnvironments((current) =>
      upsertRequestedEnvironment(current, {
        name: environmentName,
        template: selectedTemplate.name,
        owner: "demo.user",
        region,
        cost: estimatedCost,
      })
    );
    setView("environment");
  }

  function updateTemplateGovernance(id: string, field: "owner" | "tier", value: string) {
    setTemplateGovernance((current) => {
      const currentTemplate = current[id] ?? { owner: "", tier: "Standard" };
      return {
        ...current,
        [id]: {
          ...currentTemplate,
          [field]: field === "tier" ? (value as TemplateTier) : value,
        },
      };
    });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <img src={veridianMark} alt="" />
          </div>
          <div>
            <strong>NDC Studio</strong>
            <span>Developer Cloud</span>
          </div>
        </div>
        <nav className="nav">
          <NavButton icon={Gauge} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={Layers3} label="Catalog" active={view === "catalog"} onClick={() => setView("catalog")} />
          <NavButton icon={Play} label="Create" active={view === "create"} onClick={() => setView("create")} />
          <NavButton
            icon={Activity}
            label="Environment"
            active={view === "environment"}
            onClick={() => setView("environment")}
          />
          <NavButton icon={ShieldCheck} label="Admin" active={view === "admin"} onClick={() => setView("admin")} />
        </nav>
        <div className="sidebarStatus">
          <span className="dot" />
          Prism Central mock connected
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Nutanix Developer Cloud Studio</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <button className="primaryAction" onClick={() => setView("create")}>
            <Play size={16} />
            New environment
          </button>
        </header>

        {view === "dashboard" && (
          <Dashboard
            environments={environments}
            selectTemplate={selectTemplate}
            openTemplate={openTemplate}
            setView={setView}
          />
        )}
        {view === "catalog" && (
          <Catalog selectedId={selectedTemplateId} selectTemplate={selectTemplate} openTemplate={openTemplate} />
        )}
        {view === "template" && <TemplateDetail template={selectedTemplate} selectTemplate={selectTemplate} />}
        {view === "create" && (
          <CreateEnvironment
            template={selectedTemplate}
            selectedTargets={selectedTargets}
            environmentName={environmentName}
            region={region}
            estimatedCost={estimatedCost}
            setEnvironmentName={setEnvironmentName}
            setRegion={setRegion}
            setSelectedTemplateId={setSelectedTemplateId}
            toggleTarget={toggleTarget}
            launchEnvironment={launchEnvironment}
          />
        )}
        {view === "environment" && (
          <EnvironmentStatus
            jobState={jobState}
            jobStep={jobStep}
            environmentName={environmentName}
            templateName={selectedTemplate.name}
            selectedTargets={selectedTargets}
            estimatedCost={estimatedCost}
            setView={setView}
          />
        )}
        {view === "admin" && (
          <AdminView
            environments={environments}
            templateGovernance={templateGovernance}
            updateTemplateGovernance={updateTemplateGovernance}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({
  environments,
  selectTemplate,
  openTemplate,
  setView,
}: {
  environments: Environment[];
  selectTemplate: (id: string) => void;
  openTemplate: (id: string) => void;
  setView: (view: View) => void;
}) {
  return (
    <section className="screen">
      <div className="dashboardGrid">
        <div className="heroPanel">
          <div className="heroCopy">
            <p className="eyebrow">Golden paths across Nutanix Cloud Platform</p>
            <h2>Launch governed developer environments in minutes.</h2>
            <p>
              Request VMs, Kubernetes namespaces, databases, storage, and AI endpoints through one
              platform workflow with policy and cost checks built in.
            </p>
            <div className="buttonRow">
              <button className="primaryAction" onClick={() => setView("create")}>
                <Play size={16} />
                Create environment
              </button>
              <button className="secondaryAction" onClick={() => setView("catalog")}>
                <Layers3 size={16} />
                Browse catalog
              </button>
            </div>
          </div>
          <img src={cloudVisual} alt="" />
        </div>

        <MetricCard icon={Cloud} label="Active environments" value={String(environments.length)} detail="Across 3 labs" />
        <MetricCard icon={ShieldCheck} label="Policy pass rate" value="94%" detail="Last 30 days" />
        <MetricCard icon={CircleDollarSign} label="Monthly estimate" value="$18.6k" detail="12% below guardrail" />
      </div>

      <div className="twoColumn">
        <Panel title="Recommended golden paths" action="Catalog">
          <div className="templateList">
            {templates.slice(0, 3).map((template) => (
              <button className="templateRow" key={template.id} onClick={() => openTemplate(template.id)}>
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.runtime}</span>
                </div>
                <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Environment activity" action="Live">
          <div className="envTable">
            {environments.map((env) => (
              <div className="envRow" key={env.name}>
                <div>
                  <strong>{env.name}</strong>
                  <span>{env.template}</span>
                </div>
                <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Catalog({
  selectedId,
  selectTemplate,
  openTemplate,
}: {
  selectedId: string;
  selectTemplate: (id: string) => void;
  openTemplate: (id: string) => void;
}) {
  return (
    <section className="screen">
      <div className="catalogGrid">
        {templates.map((template) => (
          <article className={`templateCard ${selectedId === template.id ? "selected" : ""}`} key={template.id}>
            <div className="cardTop">
              <div className="cardIcon">
                <Code2 size={20} />
              </div>
              <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
            </div>
            <h2>{template.name}</h2>
            <p>{template.summary}</p>
            <div className="targetStrip">
              {template.targets.map((target) => {
                const Icon = targetIcons[target];
                return (
                  <span key={target}>
                    <Icon size={14} />
                    {target}
                  </span>
                );
              })}
            </div>
            <div className="cardMeta">
              <span>{template.owner}</span>
              <strong>${template.monthlyCost.toLocaleString()}/mo</strong>
            </div>
            <button className="fullButton" onClick={() => selectTemplate(template.id)}>
              Use template
            </button>
            <button className="textButton" onClick={() => openTemplate(template.id)}>
              View details
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TemplateDetail({ template, selectTemplate }: { template: Template; selectTemplate: (id: string) => void }) {
  return (
    <section className="screen detailGrid">
      <Panel title={template.name} action={template.tier}>
        <p className="detailLead">{template.description}</p>
        <div className="targetStrip spacious">
          {template.targets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <span key={target}>
                <Icon size={14} />
                {target}
              </span>
            );
          })}
        </div>
        <div className="cardMeta detailMeta">
          <span>{template.owner}</span>
          <strong>${template.monthlyCost.toLocaleString()}/mo baseline</strong>
        </div>
        <button className="fullButton launch" onClick={() => selectTemplate(template.id)}>
          Use this golden path
        </button>
      </Panel>
      <Panel title="What gets created" action={template.runtime}>
        <div className="bulletList">
          {template.outcomes.map((item) => (
            <CheckLine key={item} icon={CheckCircle2} label={item} value="Included in prototype workflow" passed />
          ))}
        </div>
      </Panel>
      <Panel title="Integration readiness" action="Next">
        <div className="bulletList">
          {template.readiness.map((item) => (
            <CheckLine key={item} icon={Network} label={item} value="Required before real provisioning" passed={false} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CreateEnvironment({
  template,
  selectedTargets,
  environmentName,
  region,
  estimatedCost,
  setEnvironmentName,
  setRegion,
  setSelectedTemplateId,
  toggleTarget,
  launchEnvironment,
}: {
  template: Template;
  selectedTargets: Target[];
  environmentName: string;
  region: string;
  estimatedCost: number;
  setEnvironmentName: (value: string) => void;
  setRegion: (value: string) => void;
  setSelectedTemplateId: (value: string) => void;
  toggleTarget: (target: Target) => void;
  launchEnvironment: () => void;
}) {
  return (
    <section className="screen createGrid">
      <Panel title="Request details" action="Step 1">
        <label className="field">
          Environment name
          <input value={environmentName} onChange={(event) => setEnvironmentName(event.target.value)} />
        </label>
        <label className="field">
          Golden path
          <select value={template.id} onChange={(event) => setSelectedTemplateId(event.target.value)}>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Target location
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option>Berlin Lab</option>
            <option>London Edge</option>
            <option>Paris DR</option>
          </select>
        </label>
      </Panel>

      <Panel title="Target services" action="Step 2">
        <div className="targetGrid">
          {allTargets.map((target) => {
            const Icon = targetIcons[target];
            const active = selectedTargets.includes(target);
            return (
              <button className={`targetButton ${active ? "active" : ""}`} key={target} onClick={() => toggleTarget(target)}>
                <Icon size={18} />
                {target}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Automated checks" action="Step 3">
        <CheckLine icon={ShieldCheck} label="Policy" value="Allowed by developer sandbox policy" passed />
        <CheckLine icon={CircleDollarSign} label="Cost" value={`Estimated $${estimatedCost.toLocaleString()} per month`} passed />
        <CheckLine
          icon={LockKeyhole}
          label="Compliance"
          value={selectedTargets.includes("AI Endpoint") ? "Requires AI platform approval" : "No approval required"}
          passed={!selectedTargets.includes("AI Endpoint")}
        />
        <CheckLine icon={Network} label="Integrations" value={template.runtime} passed />
        <button className="fullButton launch" onClick={launchEnvironment}>
          Launch simulated provisioning
        </button>
      </Panel>
    </section>
  );
}

function EnvironmentStatus({
  jobState,
  jobStep,
  environmentName,
  templateName,
  selectedTargets,
  estimatedCost,
  setView,
}: {
  jobState: JobState;
  jobStep: number;
  environmentName: string;
  templateName: string;
  selectedTargets: Target[];
  estimatedCost: number;
  setView: (view: View) => void;
}) {
  const jobStarted = jobState !== "Idle";
  const actionLabel = jobStarted ? jobState : "Ready";

  return (
    <section className="screen statusGrid">
      <Panel title={jobStarted ? environmentName : "No active request"} action={actionLabel}>
        <div className="statusSummary">
          <div className="statusBadge">
            <TerminalSquare size={28} />
          </div>
          <div>
            <h2>{jobStarted ? jobHeadline(jobState) : "Create an environment to see status"}</h2>
            <p>{jobStarted ? templateName : "The status view will show checks, events, and Nutanix integration handoff."}</p>
          </div>
        </div>
        {jobStarted && (
          <div className="timeline">
            {provisioningEvents.map((item, index) => (
              <div className={`timelineItem ${timelineClass(index, jobStep, jobState)}`} key={item.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{timelineLabel(index, jobStep, jobState)} - {item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        )}
        {!jobStarted && (
          <button className="fullButton" onClick={() => setView("create")}>
            Create environment
          </button>
        )}
      </Panel>

      <Panel title="Provisioned resources" action={`$${estimatedCost.toLocaleString()}/mo`}>
        <div className="resourceList">
          {selectedTargets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <div className="resourceRow" key={target}>
                <Icon size={18} />
                <div>
                  <strong>{target}</strong>
                  <span>{resourceDescription(target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function AdminView({
  environments,
  templateGovernance,
  updateTemplateGovernance,
}: {
  environments: Environment[];
  templateGovernance: TemplateGovernance;
  updateTemplateGovernance: (id: string, field: "owner" | "tier", value: string) => void;
}) {
  return (
    <section className="screen adminGrid">
      <Panel title="Integration health" action="Mock adapters">
        <div className="integrationList">
          {integrations.map(({ name, label, state, score }) => (
            <div className="integrationRow" key={name}>
              <div className="integrationLogo">{name}</div>
              <div>
                <strong>{label}</strong>
                <span>{state}</span>
              </div>
              <meter min="0" max="100" value={Number(score)} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Governance queue" action={`${environments.filter((env) => env.status !== "Ready").length} open`}>
        <div className="envTable">
          {environments.map((env) => (
            <div className="envRow" key={env.name}>
              <div>
                <strong>{env.name}</strong>
                <span>
                  {env.owner} / {env.region}
                </span>
              </div>
              <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Platform controls" action="Admin">
        <div className="controlGrid">
          <CheckLine icon={ShieldCheck} label="Policy packs" value="12 active, 3 draft" passed />
          <CheckLine icon={Layers3} label="Templates" value={`${templates.length} published golden paths`} passed />
          <CheckLine icon={CircleDollarSign} label="Budgets" value="$25k monthly sandbox limit" passed />
          <CheckLine icon={LockKeyhole} label="Approvals" value="AI and regulated data require review" passed={false} />
        </div>
      </Panel>
      <Panel title="Template governance" action="Editable">
        <div className="templateEditList">
          {templates.map((template) => (
            <div className="templateEditRow" key={template.id}>
              <div className="editRowHeader">
                <strong>{template.name}</strong>
                <Pencil size={15} />
              </div>
              <label className="field compact">
                Owner
                <input
                  value={templateGovernance[template.id]?.owner ?? template.owner}
                  onChange={(event) => updateTemplateGovernance(template.id, "owner", event.target.value)}
                />
              </label>
              <label className="field compact">
                Tier
                <select
                  value={templateGovernance[template.id]?.tier ?? template.tier}
                  onChange={(event) => updateTemplateGovernance(template.id, "tier", event.target.value)}
                >
                  <option>Standard</option>
                  <option>Regulated</option>
                  <option>Accelerated</option>
                </select>
              </label>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Integration readiness" action="Real API path">
        <div className="readinessList">
          {integrations.map((integration) => (
            <div className="readinessRow" key={integration.name}>
              <strong>{integration.product}</strong>
              <span>{integration.readiness}</span>
              <small>{integration.nextStep}</small>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`navButton ${active ? "active" : ""}`} onClick={onClick} title={label}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Panel({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span>{action}</span>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function CheckLine({
  icon: Icon,
  label,
  value,
  passed,
}: {
  icon: ElementType;
  label: string;
  value: string;
  passed: boolean;
}) {
  return (
    <div className="checkLine">
      <Icon size={18} />
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <CheckCircle2 className={passed ? "pass" : "warn"} size={18} />
    </div>
  );
}

function viewTitle(view: View) {
  switch (view) {
    case "dashboard":
      return "Developer portal";
    case "catalog":
      return "Golden path catalog";
    case "template":
      return "Template details";
    case "create":
      return "Create environment";
    case "environment":
      return "Environment status";
    case "admin":
      return "Platform admin";
  }
}

function statusClass(status: Environment["status"]) {
  return status === "Ready" ? "ready" : status === "Provisioning" ? "running" : "approval";
}

function resourceDescription(target: Target) {
  switch (target) {
    case "VM":
      return "NCI VM with hardened image and lifecycle expiry";
    case "Kubernetes":
      return "NKP namespace, ingress, secrets, and quota";
    case "Database":
      return "NDB managed instance with backup policy";
    case "Storage":
      return "NUS file or object storage allocation";
    case "AI Endpoint":
      return "NAI model endpoint with GPU quota review";
  }
}

function enrichTemplate(template: Template, governance: TemplateGovernance) {
  return {
    ...template,
    owner: governance[template.id]?.owner ?? template.owner,
    tier: governance[template.id]?.tier ?? template.tier,
  };
}

function jobHeadline(jobState: JobState) {
  switch (jobState) {
    case "Queued":
      return "Provisioning job queued";
    case "Running":
      return "Provisioning workflow running";
    case "Approval":
      return "Approval required before activation";
    case "Complete":
      return "Environment ready";
    case "Failed":
      return "Provisioning needs attention";
    case "Idle":
      return "Create an environment to see status";
  }
}

function timelineClass(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "approvalStep";
  }
  if (index < jobStep || jobState === "Complete") {
    return "completeStep";
  }
  if (index === jobStep) {
    return "activeStep";
  }
  return "";
}

function timelineLabel(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "Approval";
  }
  if (index < jobStep || jobState === "Complete") {
    return "Complete";
  }
  if (index === jobStep) {
    return jobState === "Queued" ? "Queued" : "Running";
  }
  return "Waiting";
}
