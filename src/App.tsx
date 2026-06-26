import {
  Activity,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  Database,
  Gauge,
  HardDrive,
  Layers3,
  LockKeyhole,
  Network,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import cloudVisual from "./assets/developer-cloud-visual.png";
import veridianMark from "./assets/veridian-mark-teal.svg";

type View = "dashboard" | "catalog" | "create" | "environment" | "admin";
type Target = "VM" | "Kubernetes" | "Database" | "Storage" | "AI Endpoint";

type Template = {
  id: string;
  name: string;
  summary: string;
  owner: string;
  tier: "Standard" | "Regulated" | "Accelerated";
  targets: Target[];
  runtime: string;
  monthlyCost: number;
  compliance: string[];
};

type Environment = {
  name: string;
  template: string;
  owner: string;
  region: string;
  status: "Ready" | "Provisioning" | "Needs approval";
  cost: number;
};

const templates: Template[] = [
  {
    id: "spring-postgres",
    name: "Spring API with NDB Postgres",
    summary: "Kubernetes service, managed Postgres, backup policy, and developer observability.",
    owner: "App Platform",
    tier: "Standard",
    targets: ["Kubernetes", "Database", "Storage"],
    runtime: "NKP + NDB + NUS",
    monthlyCost: 1840,
    compliance: ["SRE owned", "Backups enabled", "Cost guardrail"],
  },
  {
    id: "vm-app",
    name: "Linux VM App Sandbox",
    summary: "Self-service VM with image hardening, Prism Central inventory, and lifecycle expiry.",
    owner: "Cloud Infrastructure",
    tier: "Standard",
    targets: ["VM", "Storage"],
    runtime: "NCI + NCM",
    monthlyCost: 920,
    compliance: ["Hardened image", "30 day expiry", "Patch baseline"],
  },
  {
    id: "ai-endpoint",
    name: "AI Endpoint Lab",
    summary: "GPU-backed model endpoint, object storage mount, and prompt test workspace.",
    owner: "AI Platform",
    tier: "Accelerated",
    targets: ["AI Endpoint", "Storage", "Kubernetes"],
    runtime: "NAI + NKP + NUS",
    monthlyCost: 4200,
    compliance: ["PII scan", "GPU quota", "Approval required"],
  },
  {
    id: "regulated-db",
    name: "Regulated Data Service",
    summary: "Database environment with encryption, audit export, retention, and approval routing.",
    owner: "Data Platform",
    tier: "Regulated",
    targets: ["Database", "Storage"],
    runtime: "NDB + NUS + NCM",
    monthlyCost: 3100,
    compliance: ["Encryption", "Audit export", "Change approval"],
  },
];

const initialEnvironments: Environment[] = [
  {
    name: "payments-dev",
    template: "Spring API with NDB Postgres",
    owner: "mira.chen",
    region: "Berlin Lab",
    status: "Ready",
    cost: 1840,
  },
  {
    name: "ml-reco-lab",
    template: "AI Endpoint Lab",
    owner: "samir.patel",
    region: "London Edge",
    status: "Needs approval",
    cost: 4200,
  },
  {
    name: "billing-sandbox",
    template: "Linux VM App Sandbox",
    owner: "jordan.lee",
    region: "Berlin Lab",
    status: "Provisioning",
    cost: 920,
  },
];

const integrations = [
  ["NCI", "Infrastructure", "Healthy", 99],
  ["NKP", "Kubernetes", "Healthy", 98],
  ["NDB", "Databases", "Healthy", 96],
  ["NUS", "Storage", "Healthy", 97],
  ["NCM", "Governance", "Warning", 88],
  ["NAI", "AI Services", "Preview", 74],
];

const targetIcons: Record<Target, React.ElementType> = {
  VM: Server,
  Kubernetes: Boxes,
  Database: Database,
  Storage: HardDrive,
  "AI Endpoint": Sparkles,
};

const timeline = [
  "Template validated",
  "Policy bundle attached",
  "Cost estimate approved",
  "Provisioning job queued",
  "Nutanix integration handoff",
];

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [selectedTargets, setSelectedTargets] = useState<Target[]>(templates[0].targets);
  const [environmentName, setEnvironmentName] = useState("checkout-api-dev");
  const [region, setRegion] = useState("Berlin Lab");
  const [jobStarted, setJobStarted] = useState(false);
  const [environments, setEnvironments] = useState(initialEnvironments);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? templates[0];
  const estimatedCost = useMemo(() => {
    const targetPremium = selectedTargets.includes("AI Endpoint") ? 960 : 0;
    return selectedTemplate.monthlyCost + targetPremium + selectedTargets.length * 85;
  }, [selectedTargets, selectedTemplate]);

  function selectTemplate(id: string) {
    const template = templates.find((item) => item.id === id) ?? templates[0];
    setSelectedTemplateId(template.id);
    setSelectedTargets(template.targets);
    setView("create");
  }

  function toggleTarget(target: Target) {
    setSelectedTargets((current) =>
      current.includes(target) ? current.filter((item) => item !== target) : [...current, target]
    );
  }

  function launchEnvironment() {
    setJobStarted(true);
    setEnvironments((current) => [
      {
        name: environmentName,
        template: selectedTemplate.name,
        owner: "john",
        region,
        status: selectedTargets.includes("AI Endpoint") ? "Needs approval" : "Provisioning",
        cost: estimatedCost,
      },
      ...current.filter((env) => env.name !== environmentName),
    ]);
    setView("environment");
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
            setView={setView}
          />
        )}
        {view === "catalog" && <Catalog selectedId={selectedTemplateId} selectTemplate={selectTemplate} />}
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
            jobStarted={jobStarted}
            environmentName={environmentName}
            templateName={selectedTemplate.name}
            selectedTargets={selectedTargets}
            estimatedCost={estimatedCost}
            setView={setView}
          />
        )}
        {view === "admin" && <AdminView environments={environments} />}
      </main>
    </div>
  );
}

function Dashboard({
  environments,
  selectTemplate,
  setView,
}: {
  environments: Environment[];
  selectTemplate: (id: string) => void;
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
              <button className="templateRow" key={template.id} onClick={() => selectTemplate(template.id)}>
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

function Catalog({ selectedId, selectTemplate }: { selectedId: string; selectTemplate: (id: string) => void }) {
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
          </article>
        ))}
      </div>
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
  const allTargets: Target[] = ["VM", "Kubernetes", "Database", "Storage", "AI Endpoint"];

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
  jobStarted,
  environmentName,
  templateName,
  selectedTargets,
  estimatedCost,
  setView,
}: {
  jobStarted: boolean;
  environmentName: string;
  templateName: string;
  selectedTargets: Target[];
  estimatedCost: number;
  setView: (view: View) => void;
}) {
  return (
    <section className="screen statusGrid">
      <Panel title={jobStarted ? environmentName : "No active request"} action={jobStarted ? "Simulated job" : "Ready"}>
        <div className="statusSummary">
          <div className="statusBadge">
            <TerminalSquare size={28} />
          </div>
          <div>
            <h2>{jobStarted ? "Provisioning workflow started" : "Create an environment to see status"}</h2>
            <p>{jobStarted ? templateName : "The status view will show checks, events, and Nutanix integration handoff."}</p>
          </div>
        </div>
        {jobStarted && (
          <div className="timeline">
            {timeline.map((item, index) => (
              <div className="timelineItem" key={item}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item}</strong>
                  <small>{index < 3 ? "Complete" : index === 3 ? "Running" : "Waiting"}</small>
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

function AdminView({ environments }: { environments: Environment[] }) {
  return (
    <section className="screen adminGrid">
      <Panel title="Integration health" action="Mock adapters">
        <div className="integrationList">
          {integrations.map(([name, label, state, score]) => (
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
    </section>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
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

function Panel({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
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
  icon: React.ElementType;
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
  icon: React.ElementType;
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
