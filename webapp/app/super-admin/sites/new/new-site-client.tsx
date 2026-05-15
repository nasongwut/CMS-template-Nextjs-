"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TemplateRef {
  id: string;
  name: string;
  blurb: string;
  glyph: string;
  themeId: string;
  counts: {
    categories: number;
    articles: number;
    timeline: number;
    navItems: number;
  };
}

type Step = 1 | 2 | 3 | 4;

type StepStatus = "pending" | "running" | "done" | "error" | "skipped";
interface FlowStep {
  key: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

export default function NewSiteClient({
  templates,
}: {
  templates: TemplateRef[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 form
  const [v, setV] = useState({
    name: "",
    slug: "",
    primaryDomain: "",
    databaseUrl: "",
    directDbUrl: "",
    notes: "",
  });

  // Step 2
  const [templateId, setTemplateId] = useState<string>(""); // "" = blank

  // Step 3 (running) / 4 (done)
  const [flow, setFlow] = useState<FlowStep[]>([]);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  function set<K extends keyof typeof v>(k: K, val: string) {
    setV((p) => ({ ...p, [k]: val }));
  }

  /* ─── Step 1 validation ─── */

  const step1Valid =
    v.name.trim().length > 0 &&
    // DATABASE_URL is OPTIONAL — when empty, the API falls back to the
    // platform's env DATABASE_URL with a per-site Postgres schema.
    (v.databaseUrl.trim() === "" ||
      /^postgres(ql)?:\/\//i.test(v.databaseUrl.trim()));

  /* ─── Step 3 orchestration ─── */

  function setStepStatus(
    key: string,
    status: StepStatus,
    detail?: string,
  ) {
    setFlow((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status, detail } : s)),
    );
  }

  async function runFlow() {
    setFatalError(null);
    const initialFlow: FlowStep[] = [
      { key: "create", label: "Create site row", status: "pending" },
      { key: "migrate", label: "Run schema migrations on tenant DB", status: "pending" },
      {
        key: "template",
        label: templateId
          ? `Apply template — ${templateId}`
          : "Skip template (blank site)",
        status: templateId ? "pending" : "skipped",
      },
    ];
    setFlow(initialFlow);
    setStep(3);

    /* ── 1. Create site ── */
    setStepStatus("create", "running");
    const createRes = await fetch("/api/super-admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: v.name,
        slug: v.slug || slugify(v.name),
        primaryDomain: v.primaryDomain,
        databaseUrl: v.databaseUrl,
        directDbUrl: v.directDbUrl,
        notes: v.notes,
      }),
    });
    const created = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      setStepStatus(
        "create",
        "error",
        created.detail ?? created.error ?? "create_failed",
      );
      setFatalError(
        "ไม่สามารถสร้าง site row — แก้ข้อมูลที่ Step 1 แล้วลองใหม่",
      );
      return;
    }
    setCreatedSiteId(created.site.id);
    setStepStatus("create", "done");

    /* ── 2. Run migrations ── */
    setStepStatus("migrate", "running");
    const mgRes = await fetch(
      `/api/super-admin/sites/${created.site.id}/migrate`,
      { method: "POST" },
    );
    const mg = await mgRes.json().catch(() => ({}));
    if (!mgRes.ok || !mg.success) {
      setStepStatus(
        "migrate",
        "error",
        mg.fatal ?? mg.stderr ?? mg.detail ?? mg.error ?? "migrate_failed",
      );
      setFatalError(
        "Migration ล้มเหลว — Site ถูกสร้างแล้ว แต่ schema ยังไม่ถูก apply " +
          "ลองรัน Run migrations จากหน้า site detail หรือตรวจ DATABASE_URL",
      );
      return;
    }
    setStepStatus("migrate", "done", `${mg.durationMs}ms`);

    /* ── 3. Apply template (optional) ── */
    if (templateId) {
      setStepStatus("template", "running");
      const tplRes = await fetch(
        `/api/super-admin/sites/${created.site.id}/apply-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, wipeTarget: true }),
        },
      );
      const tpl = await tplRes.json().catch(() => ({}));
      if (!tplRes.ok) {
        setStepStatus(
          "template",
          "error",
          tpl.detail ?? tpl.error ?? "apply_failed",
        );
        setFatalError(
          "Apply template ล้มเหลว — site ใช้ได้แต่ยังเป็น blank ลอง Apply ใหม่จาก site detail",
        );
        return;
      }
      if (tpl.errors && tpl.errors.length > 0) {
        setStepStatus(
          "template",
          "error",
          tpl.errors.map((e: { step: string; message: string }) => `${e.step}: ${e.message}`).join("; "),
        );
        setFatalError(
          "Apply template ทำเสร็จแต่บางส่วน fail — ตรวจ detail ด้านล่าง",
        );
        return;
      }
      setStepStatus(
        "template",
        "done",
        `${tpl.categories} cats · ${tpl.articles} articles · ${tpl.navItems} nav · ${tpl.durationMs}ms`,
      );
    }

    setStep(4);
  }

  /* ─── Render ─── */

  return (
    <div className="max-w-3xl">
      <Link
        href="/super-admin"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← back to sites
      </Link>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
        New site
      </h1>

      <Stepper step={step} />

      {step === 1 && (
        <Step1Form
          v={v}
          set={set}
          onNext={() => setStep(2)}
          canNext={step1Valid}
        />
      )}

      {step === 2 && (
        <Step2Template
          templates={templates}
          value={templateId}
          onChange={setTemplateId}
          onBack={() => setStep(1)}
          onNext={runFlow}
        />
      )}

      {(step === 3 || step === 4) && (
        <Step3Progress
          flow={flow}
          done={step === 4}
          fatalError={fatalError}
          primaryDomain={v.primaryDomain}
          siteName={v.name}
          onRetry={runFlow}
          onGoToSite={
            createdSiteId
              ? () => router.push(`/super-admin/sites/${createdSiteId}`)
              : undefined
          }
        />
      )}
    </div>
  );
}

/* ─── Stepper bar ─── */

function Stepper({ step }: { step: Step }) {
  const items = [
    { n: 1, label: "Site & Database" },
    { n: 2, label: "Template" },
    { n: 3, label: "Finish" },
  ];
  return (
    <ol className="flex items-center gap-2 mt-5 mb-7 text-sm">
      {items.map((it, i) => {
        const current = step === it.n || (step === 4 && it.n === 3);
        const done = step > it.n || (step === 4 && it.n <= 3);
        return (
          <li key={it.n} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                done
                  ? "text-white"
                  : current
                    ? "text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
              }`}
              style={
                done || current
                  ? {
                      backgroundImage:
                        "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                    }
                  : undefined
              }
            >
              {done ? "✓" : it.n}
            </span>
            <span
              className={
                current
                  ? "font-medium"
                  : done
                    ? "text-zinc-700 dark:text-zinc-300"
                    : "text-zinc-400"
              }
            >
              {it.label}
            </span>
            {i < items.length - 1 && (
              <span className="text-zinc-300 dark:text-zinc-700 ml-1">›</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Step 1: site & DB form ─── */

function Step1Form({
  v,
  set,
  onNext,
  canNext,
}: {
  v: {
    name: string;
    slug: string;
    primaryDomain: string;
    databaseUrl: string;
    directDbUrl: string;
    notes: string;
  };
  set: (k: keyof typeof v, val: string) => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Site name"
          required
          value={v.name}
          onChange={(s) => set("name", s)}
          placeholder="City Art Studio"
        />
        <Field
          label="Slug"
          value={v.slug}
          onChange={(s) => set("slug", s)}
          placeholder={v.name ? slugify(v.name) : "auto from name"}
          hint="Used in dashboards. Auto-derived if empty."
        />
      </div>

      <Field
        label="Primary domain"
        value={v.primaryDomain}
        onChange={(s) => set("primaryDomain", s)}
        placeholder="tenant-a.localhost (dev)  หรือ  www.cityart.co.th (prod)"
        hint="Used for hostname-based routing. Optional but recommended."
      />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Database isolation</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            ปล่อยช่องด้านล่างว่าง → ระบบใช้ DATABASE_URL ของ platform แบ่ง
            <strong> Postgres schema</strong> เป็นของ site นี้ (
            <code className="font-mono">
              site_{v.slug || slugify(v.name || "default")}
            </code>
            ) — DB เดียวกับ platform แต่ data แยกกันชัดเจน
            <br />
            กรอก URL ของ DB อื่น → site ใช้ <strong>DB เฉพาะตัว</strong>{" "}
            แยกออกจาก platform เลย
          </p>
        </div>

        <Textarea
          label="DATABASE_URL (pooled) — optional"
          value={v.databaseUrl}
          onChange={(s) => set("databaseUrl", s)}
          rows={2}
          mono
          placeholder="(ปล่อยว่างเพื่อใช้ shared DB) หรือ postgresql://user:pass@host-pooler.aws.neon.tech/db"
          hint="ปล่อยว่าง = shared schema mode. ถ้ากรอก ระบบจะ ping เพื่อ verify ก่อนบันทึก"
        />

        <Textarea
          label="DIRECT_URL (non-pooled) — optional"
          value={v.directDbUrl}
          onChange={(s) => set("directDbUrl", s)}
          rows={2}
          mono
          placeholder="ปล่อยว่าง = ใช้ DATABASE_URL ของ platform"
        />
      </div>

      <Textarea
        label="Notes (internal)"
        value={v.notes}
        onChange={(s) => set("notes", s)}
        rows={2}
        placeholder="Customer reference, billing notes…"
      />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm disabled:opacity-50"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2: template picker ─── */

function Step2Template({
  templates,
  value,
  onChange,
  onBack,
  onNext,
}: {
  templates: TemplateRef[];
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-medium">เลือก template</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Bundle ที่จะ apply ลง DB ของ site นี้ — เลือก blank ถ้าจะตั้งค่าเองทั้งหมด
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Blank option */}
        <TemplateCard
          active={value === ""}
          onClick={() => onChange("")}
          glyph="○"
          name="Blank site"
          blurb="No content — empty site ready for manual setup."
          themeId="default"
        />
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            active={value === t.id}
            onClick={() => onChange(t.id)}
            glyph={t.glyph}
            name={t.name}
            blurb={t.blurb}
            themeId={t.themeId}
            counts={t.counts}
          />
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Finish — Create site →
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  active,
  onClick,
  glyph,
  name,
  blurb,
  themeId,
  counts,
}: {
  active: boolean;
  onClick: () => void;
  glyph: string;
  name: string;
  blurb: string;
  themeId: string;
  counts?: { categories: number; articles: number; timeline: number; navItems: number };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition ${
        active
          ? "border-violet-500 dark:border-violet-400 shadow-md ring-2 ring-violet-500/20"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xl"
              style={{ color: "var(--site-primary)" }}
            >
              {glyph}
            </span>
            <h3 className="font-semibold">{name}</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{blurb}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded shrink-0">
          {themeId}
        </span>
      </div>
      {counts && (
        <div className="mt-3 text-xs text-zinc-500 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono">
          <span>cats</span><span className="text-right">{counts.categories}</span>
          <span>articles</span><span className="text-right">{counts.articles}</span>
          <span>timeline</span><span className="text-right">{counts.timeline}</span>
          <span>nav</span><span className="text-right">{counts.navItems}</span>
        </div>
      )}
    </button>
  );
}

/* ─── Step 3 / 4: progress + done ─── */

function Step3Progress({
  flow,
  done,
  fatalError,
  primaryDomain,
  siteName,
  onRetry,
  onGoToSite,
}: {
  flow: FlowStep[];
  done: boolean;
  fatalError: string | null;
  primaryDomain: string;
  siteName: string;
  onRetry: () => void;
  onGoToSite?: () => void;
}) {
  // Build the URL the operator should visit to see the new site.
  const visitUrl =
    primaryDomain && typeof window !== "undefined"
      ? `${window.location.protocol}//${primaryDomain}${
          window.location.port ? `:${window.location.port}` : ""
        }`
      : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-medium">
          {done ? `✓ "${siteName}" is ready` : "Setting up site…"}
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {done
            ? "ระบบสร้าง site, รัน migrations และ apply template เสร็จแล้ว"
            : "ระบบกำลังสร้าง site, รัน migrations และ apply template ตามลำดับ"}
        </p>
      </div>

      {done && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            🚀 เปิดดู site ใหม่ที่:
          </p>
          {visitUrl ? (
            <a
              href={visitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-mono text-base text-emerald-700 dark:text-emerald-300 hover:underline break-all"
            >
              {visitUrl}
              <span aria-hidden>↗</span>
            </a>
          ) : (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              ⚠ ยังไม่ได้ตั้ง <strong>primary domain</strong> ตอนสร้าง site —
              เปิด localhost จะเห็นเป็นเว็บหลัก (control plane) ไม่ใช่ site ใหม่
              <br />
              เข้าไปเพิ่ม domain ที่ <em>Site detail → Site details → Primary domain</em> แล้วบันทึก
              เปิดที่ <code className="font-mono">http://&lt;domain&gt;:3000</code> จะเห็นเนื้อหา template
            </div>
          )}
          <p className="mt-3 text-xs text-emerald-800 dark:text-emerald-300">
            *.localhost รองรับ wildcard อัตโนมัติใน Chrome / Safari / Firefox —
            ไม่ต้องแก้ <code className="font-mono">/etc/hosts</code>
          </p>
        </div>
      )}

      <ol className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 divide-y divide-zinc-200 dark:divide-zinc-800">
        {flow.map((s) => (
          <li key={s.key} className="p-4 flex items-start gap-3">
            <StatusIcon status={s.status} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{s.label}</div>
              {s.detail && (
                <p
                  className={`mt-0.5 text-xs ${
                    s.status === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-500"
                  } font-mono whitespace-pre-wrap break-words`}
                >
                  {s.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {fatalError && (
        <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-sm text-red-800 dark:text-red-200 px-3 py-2">
          {fatalError}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {fatalError && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
          >
            Retry from current step
          </button>
        )}
        {done && onGoToSite && (
          <button
            type="button"
            onClick={onGoToSite}
            className="px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm"
            style={{
              background:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }}
          >
            Go to site detail →
          </button>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs shrink-0 mt-0.5">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs shrink-0 mt-0.5">
        ✓
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs shrink-0 mt-0.5">
        ✗
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs shrink-0 mt-0.5">
        –
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-400 text-xs shrink-0 mt-0.5">
      ○
    </span>
  );
}

/* ─── shared bits ─── */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
  mono,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  mono?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`mt-1.5 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </label>
  );
}
