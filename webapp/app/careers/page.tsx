import type { Metadata } from "next";
import { OPEN_POSITIONS } from "@/lib/careers";
import { getSettings } from "@/lib/settings";
import CareersClient from "./careers-client";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return {
    title: "ร่วมงานกับเรา",
    description: `เปิดรับสมัครงานหลายตำแหน่งที่ ${site.siteName} — ส่งใบสมัครออนไลน์ได้ทันที`,
  };
}

export default function CareersPage() {
  return (
    <div className="relative">
      {/* decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[900px] -z-10 opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--site-primary), transparent 60%), radial-gradient(closest-side at 70% 50%, var(--site-accent), transparent 60%)",
        }}
      />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-6 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          Careers
        </p>
        <h1
          className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.05] bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          ร่วมงานกับเรา
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
          เรากำลังหาเพื่อนร่วมทีมที่หลงใหลในการสร้างงานศิลปะและประสบการณ์ใหม่ ๆ
          ส่งใบสมัครได้เลย — ทีม HR จะติดต่อกลับภายใน 7 วันทำการ
        </p>
      </section>

      {/* OPEN ROLES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight">
          ตำแหน่งที่เปิดรับ
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {OPEN_POSITIONS.map((p) => (
            <a
              key={p.id}
              href={`#apply?position=${encodeURIComponent(p.title)}`}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-base sm:text-lg leading-snug">
                  {p.title}
                </h3>
                <span
                  className="text-[10px] uppercase tracking-wider font-mono shrink-0"
                  style={{ color: "var(--site-primary)" }}
                >
                  {p.team}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                {p.summary}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                  {p.type}
                </span>
                <span>·</span>
                <span>{p.location}</span>
              </div>
              <span
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: "var(--site-primary)" }}
              >
                สมัครตำแหน่งนี้
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section
        id="apply"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-20"
      >
        <div className="text-center">
          <p
            className="text-[11px] font-mono uppercase tracking-[0.2em]"
            style={{ color: "var(--site-primary)" }}
          >
            apply
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
            กรอกใบสมัคร
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            แนบ CV และ portfolio (ถ้ามี) — ไฟล์รวมไม่เกิน 25 MB ต่อไฟล์
          </p>
        </div>

        <div className="mt-8">
          <CareersClient positions={OPEN_POSITIONS} />
        </div>
      </section>
    </div>
  );
}
