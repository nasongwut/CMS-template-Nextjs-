import CodeBlock from "./code-block";

type Method = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

interface Param {
  name: string;
  type?: string;
  required?: boolean;
  desc: string;
}

interface ErrorRow {
  status: number;
  code: string;
  when: string;
}

interface Props {
  method: Method;
  path: string;
  title: string;
  description?: string;
  auth?: "none" | "user" | "admin";
  body?: { description?: string; example: string; lang?: string };
  query?: Param[];
  multipart?: Param[];
  response?: { example: string; lang?: string; status?: number };
  errors?: ErrorRow[];
  examples?: { title: string; code: string; lang?: string }[];
}

const methodColor: Record<Method, string> = {
  GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
  PATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
  PUT: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
};

export default function Endpoint(p: Props) {
  const id = `${p.method.toLowerCase()}-${p.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;
  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 overflow-hidden my-8"
    >
      <header className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-16 text-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ${methodColor[p.method]}`}
        >
          {p.method}
        </span>
        <code className="font-mono text-sm">{p.path}</code>
        {p.auth === "user" && <Badge>auth required</Badge>}
        {p.auth === "admin" && <Badge amber>admin only</Badge>}
        <h3 className="basis-full font-medium text-zinc-900 dark:text-zinc-100 mt-1">
          {p.title}
        </h3>
        {p.description && (
          <p className="basis-full text-sm text-zinc-600 dark:text-zinc-400 -mt-1">
            {p.description}
          </p>
        )}
      </header>

      <div className="px-5 py-4 space-y-5">
        {p.query && p.query.length > 0 && (
          <ParamTable title="Query params" rows={p.query} />
        )}

        {p.multipart && p.multipart.length > 0 && (
          <ParamTable title="Multipart fields" rows={p.multipart} />
        )}

        {p.body && (
          <div>
            <h4 className="text-sm font-medium mb-2">Request body</h4>
            {p.body.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                {p.body.description}
              </p>
            )}
            <CodeBlock code={p.body.example} lang={p.body.lang ?? "json"} />
          </div>
        )}

        {p.response && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Response {p.response.status ?? 200}
            </h4>
            <CodeBlock code={p.response.example} lang={p.response.lang ?? "json"} />
          </div>
        )}

        {p.errors && p.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Errors</h4>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
                  <tr>
                    <th className="px-3 py-2 w-16">HTTP</th>
                    <th className="px-3 py-2 w-48">Error code</th>
                    <th className="px-3 py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {p.errors.map((e) => (
                    <tr key={e.code} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-3 py-2 font-mono text-zinc-500">{e.status}</td>
                      <td className="px-3 py-2 font-mono text-zinc-900 dark:text-zinc-100">
                        {e.code}
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{e.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {p.examples && p.examples.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Examples</h4>
            <div className="space-y-3">
              {p.examples.map((ex, i) => (
                <CodeBlock key={i} code={ex.code} title={ex.title} lang={ex.lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ParamTable({ title, rows }: { title: string; rows: Param[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-left">
            <tr>
              <th className="px-3 py-2 w-44">Name</th>
              <th className="px-3 py-2 w-32">Type</th>
              <th className="px-3 py-2 w-20">Required</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2 font-mono">{r.name}</td>
                <td className="px-3 py-2 font-mono text-zinc-500">{r.type ?? "string"}</td>
                <td className="px-3 py-2">
                  {r.required ? (
                    <span className="text-xs text-rose-600 dark:text-rose-400">yes</span>
                  ) : (
                    <span className="text-xs text-zinc-500">no</span>
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({
  children,
  amber = false,
}: {
  children: React.ReactNode;
  amber?: boolean;
}) {
  return (
    <span
      className={`text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 ${
        amber
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
      }`}
    >
      {children}
    </span>
  );
}
