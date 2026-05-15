import type { SiteTemplate } from "./types";

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const engineeringTemplate: SiteTemplate = {
  id: "engineering",
  name: "Engineering Notes",
  blurb: "วิศวกรรม — โครงสร้าง ไฟฟ้า เครื่องกล ซอฟต์แวร์",
  glyph: "▌",
  themeId: "terminal",
  siteName: "Engineering Notes",
  siteDescription:
    "บันทึกของวิศวกรในไทย — โครงสร้าง ไฟฟ้า เครื่องกล ซอฟต์แวร์ และการจัดการโครงการ เขียนโดยคนที่ทำงานจริงในไซต์",

  about: {
    heading: "Engineering Notes",
    subheading:
      "บันทึกจากวิศวกรในไทยที่เลือกแบ่งปันความรู้แทนที่จะเก็บไว้ — เพื่อให้รุ่นต่อไปเรียนรู้เร็วกว่ารุ่นเรา",
    body:
      "Engineering Notes ก่อตั้งโดย senior engineer 4 คนในสาขาที่ต่างกัน — โครงสร้าง ไฟฟ้า เครื่องกล ซอฟต์แวร์ — ที่อยากแบ่งปัน technical know-how แบบไม่ขายของ\n\n" +
      "บทความทุกชิ้นเป็นเรื่องที่เกิดขึ้นจริงในไซต์งาน — รวมทั้งข้อผิดพลาดและบทเรียนที่ตำราเรียนไม่ได้สอน\n\n" +
      "เราเชื่อว่าวิศวกรในไทยเก่งกว่าที่คนภายนอกเห็น — และสิ่งที่ขาดคือพื้นที่แบ่งปันที่ไม่ใช่ academic หรือ marketing",
    heroImage: UNSPLASH("photo-1504917595217-d4dc5ebe6122"),
    layout: "sidebar",
  },

  categories: [
    {
      slug: "structural",
      name: "โครงสร้าง",
      description: "Concrete, steel, foundation, load calculation",
      coverImage: UNSPLASH("photo-1486325212027-8081e485255e"),
      order: 0,
    },
    {
      slug: "electrical",
      name: "ไฟฟ้า",
      description: "Power system, control, motor, instrumentation",
      coverImage: UNSPLASH("photo-1518365050014-70fe7232897f"),
      order: 1,
    },
    {
      slug: "mechanical",
      name: "เครื่องกล",
      description: "Pneumatic, hydraulic, bearing, vibration, HVAC",
      coverImage: UNSPLASH("photo-1581094794329-c8112a89af12"),
      order: 2,
    },
    {
      slug: "software",
      name: "ซอฟต์แวร์",
      description: "Patterns, distributed systems, type theory, dev tools",
      coverImage: UNSPLASH("photo-1517694712202-14dd9538aa97"),
      order: 3,
    },
    {
      slug: "project",
      name: "โครงการ",
      description: "Estimation, scheduling, risk, vendor management",
      coverImage: UNSPLASH("photo-1454165804606-c3d57bc86b40"),
      order: 4,
    },
  ],

  articles: [
    {
      slug: "wind-load-outdoor-stage",
      title: "คำนวณ wind load สำหรับเวที outdoor — checklist EIT",
      excerpt:
        "เวที outdoor ในไทยต้องผ่านมาตรฐาน wind load — สูตรและตัวเลขตามมาตรฐานวิศวกรรมสถาน",
      body:
        "Wind load บนเวที outdoor ต้องคำนวณตาม EIT Standard 1311 — โดยใช้สมการ:\n\n" +
        "F = qz × G × Cf × A\n\n" +
        "qz = velocity pressure (kN/m²) ขึ้นกับความสูงและพื้นที่\n" +
        "G = gust factor (ปกติ 0.85 สำหรับโครงเล็ก)\n" +
        "Cf = drag coefficient (1.3 สำหรับ truss ปกติ)\n" +
        "A = area exposed (m²)\n\n" +
        "ตัวอย่าง: เวทีสูง 6 ม. ในกรุงเทพ pole 1 ต้น area 30 m² → F ≈ 8 kN ต่อ pole — ต้อง anchor ด้วย ground stake หรือ counter-weight 1.5 ตัน/ต้น\n\n" +
        "Pro tip: เผื่อ safety factor 1.5x สำหรับงาน outdoor — ลมหนักผิดคาดเกิดได้ตลอด",
      coverImage: UNSPLASH("photo-1486325212027-8081e485255e"),
      layout: "technical",
      categorySlug: "structural",
      order: 0,
    },
    {
      slug: "breaker-sizing-for-load",
      title: "เลือก breaker ขนาดเหมาะกับโหลด — กฎ NEC + ปฏิบัติจริงในไทย",
      excerpt:
        "ตัวอย่างคำนวณ breaker สำหรับ workshop ขนาดเล็ก + เหตุที่หลายคนเลือกเล็กไป",
      body:
        "Breaker sizing ใช้สูตร: I_breaker ≥ I_continuous × 1.25\n\n" +
        "I_continuous = โหลดที่ใช้ต่อเนื่อง > 3 ชั่วโมง\n\n" +
        "ตัวอย่าง: workshop ที่มี CNC 3 kW + AC 2 kW + ไฟ 0.5 kW = 5.5 kW @ 220V single-phase ≈ 25A\n\n" +
        "Breaker ต้อง: 25 × 1.25 = 31.25A → round up to 32A breaker\n\n" +
        "Cable: AWG 8 (8 mm²) ขั้นต่ำสำหรับ 32A\n\n" +
        "Mistake ที่พบบ่อยในไทย: ใช้ 25A breaker เพราะ ‘โหลดมี 25A พอ’ — ถูกตามสมการง่ายๆ แต่ผิด NEC เพราะ continuous load ต้อง 125%",
      coverImage: UNSPLASH("photo-1518365050014-70fe7232897f"),
      layout: "technical",
      categorySlug: "electrical",
      order: 1,
    },
    {
      slug: "pneumatic-vs-hydraulic",
      title: "Pneumatic vs Hydraulic actuator — เลือกตามงาน",
      excerpt:
        "ความเร็ว ความแม่นยำ ราคา การบำรุงรักษา — เลือกถูกประหยัด 10x ในระยะยาว",
      body:
        "Pneumatic (ลม): เร็ว ราคาถูก ปลอดภัยกับ flammable area maintenance ต่ำ — แต่ control ได้แย่ และพลังจำกัด\n\n" +
        "Hydraulic (น้ำมัน): พลังสูงมาก control แม่นยำ — แต่แพง maintenance สูง อันตรายถ้ารั่ว\n\n" +
        "ตัวอย่าง use case:\n• Pick-and-place ในสายการผลิตอาหาร → pneumatic (เร็ว + clean)\n• Press 50 ton สำหรับงาน metal forming → hydraulic\n• Robotic arm 6-DOF → electric servo (ไม่ใช่ทั้งสอง — แม่นยำสุด)\n\n" +
        "Rule of thumb: pneumatic ราคา/พลัง ดีกว่า hydraulic ที่ load < 500 kg — เกินจากนั้น hydraulic คุ้ม",
      coverImage: UNSPLASH("photo-1581094794329-c8112a89af12"),
      layout: "technical",
      categorySlug: "mechanical",
      order: 2,
    },
    {
      slug: "monorepo-api-patterns",
      title: "Pattern API monorepo ที่ใช้ใน production",
      excerpt:
        "Type-safe end-to-end APIs ใน monorepo — patterns ที่ scale ได้จริง",
      body:
        "หลังจาก migrate monorepo ขนาด 200k LOC ไปยัง type-safe APIs เราสรุป 3 patterns ที่ work:\n\n" +
        "1. Shared types package — types ของ request/response อยู่ใน package เดียวที่ client + server ใช้ร่วมกัน\n\n" +
        "2. tRPC สำหรับ internal — Type inference เต็มที่ไม่ต้องเขียน schema มือ ใช้ใน internal admin/dashboard\n\n" +
        "3. OpenAPI generator สำหรับ external API — บังคับ schema-first สำหรับ public consumers + external partners\n\n" +
        "Trade-off: tRPC ติด TypeScript เท่านั้น OpenAPI ใช้ได้ทุก language — เลือกตาม consumer\n\n" +
        "ของเสีย: ทั้งสองอย่างเพิ่ม build complexity 30-40% — ต้องมี CI pipeline ที่ tight",
      coverImage: UNSPLASH("photo-1517694712202-14dd9538aa97"),
      layout: "technical",
      categorySlug: "software",
      order: 3,
    },
    {
      slug: "construction-project-risks",
      title: "7 risks ของโครงการ construction ที่มักโดน",
      excerpt:
        "Risk ที่ project manager มือใหม่มักไม่เผื่อ — มาจากการทำงาน 50+ โครงการ",
      body:
        "1. Weather delay — รัฐบาลไทยฝนตกหนักเดือนสิงหา-ตุลา — เผื่อ buffer 15-20 วันใน schedule\n\n" +
        "2. Material price fluctuation — เหล็กในไทยขยับ ±25% ในช่วง 2 ปีที่ผ่านมา — lock price ก่อนเริ่ม\n\n" +
        "3. Permit delay — กรมโยธาฯ บางช่วงใช้เวลานานกว่า 90 วัน — submit ล่วงหน้า\n\n" +
        "4. Sub-contractor failure — สำรอง vendor 2 รายต่อ trade — sub ที่หาย mid-project ทำให้ schedule slip 2-4 สัปดาห์\n\n" +
        "5. Design change มา late — owner เปลี่ยนใจ — มี change order process ตั้งแต่วันแรก\n\n" +
        "6. Quality control failure ที่ pre-fab — ตรวจในโรงงาน factory acceptance ก่อนส่ง\n\n" +
        "7. Safety incident — มี SHE plan + insurance ตั้งแต่ pre-construction",
      coverImage: UNSPLASH("photo-1454165804606-c3d57bc86b40"),
      layout: "sidebar",
      categorySlug: "project",
      order: 4,
    },
    {
      slug: "concrete-vs-steel-structure",
      title: "คอนกรีตเสริมเหล็ก vs โครงสร้างเหล็ก — Choosing for project",
      excerpt:
        "Cost, speed, fire rating, maintenance — เปรียบเทียบจากโครงการจริงในไทย",
      body:
        "ในประเทศไทยทั้งสองแบบมีจุดเด่นต่างกัน:\n\n" +
        "Reinforced concrete (RC): cost ต่ำ, fire rating สูงเองโดยไม่ต้อง add coating, maintenance ต่ำ — แต่ slow construction (ต้อง cure) และ heavy ต้อง pile foundation\n\n" +
        "Steel structure: เร็วกว่า RC 30-40% สำหรับ height > 4 floor, lighter foundation, recyclable — แต่ต้อง fire-rated coating, cost สูงกว่า 15-25%, lifetime maintenance รวม painting cycle\n\n" +
        "ในไทย: คอนกรีตยังเหมาะกับ residential, hotels, hospitals — steel เหมาะกับ industrial, warehouse, sports facilities ที่ต้อง span ยาว",
      coverImage: UNSPLASH("photo-1486325212027-8081e485255e"),
      layout: "editorial",
      categorySlug: "structural",
      order: 5,
    },
    {
      slug: "three-phase-workshop-wiring",
      title: "Three-phase wiring สำหรับ workshop ขนาดเล็ก",
      excerpt:
        "เครื่องจักร 5kW ขึ้นไปใช้ 3-phase คุ้มกว่า single — wiring ที่ผ่าน inspection",
      body:
        "Workshop ที่มี milling machine + lathe + air compressor 3kW+ ควรมี 3-phase supply เพราะ:\n\n" +
        "• Motor ทำงาน smoother (less vibration)\n• Voltage drop น้อยกว่า\n• สามารถใส่ load ใหญ่กว่าได้\n• ทนต่อ phase imbalance ดีกว่า\n\n" +
        "Layout ที่ทีมเราออกแบบ:\n\n" +
        "- Main feed 3-phase 32A → main distribution board\n- Branch 1: phase R+N → outlet group (single-phase 220V)\n- Branch 2: 3-phase 16A → milling machine\n- Branch 3: 3-phase 16A → lathe\n- Branch 4: phase Y+N → lighting (separate to keep on during work)\n\n" +
        "Tips: balance load across phases — phase imbalance > 10% ทำให้ utility ปรับค่าไฟ + ทำลายอุปกรณ์",
      coverImage: UNSPLASH("photo-1518365050014-70fe7232897f"),
      layout: "technical",
      categorySlug: "electrical",
      order: 6,
    },
    {
      slug: "bearing-failure-vibration",
      title: "Bearing failure modes — วิเคราะห์จาก vibration signature",
      excerpt:
        "Inner race, outer race, ball, cage — แต่ละ failure มี frequency signature เฉพาะ",
      body:
        "Bearing fault frequencies ที่ใช้ในการ diagnose:\n\n" +
        "• BPFO (Outer race) = (N/2) × Fr × (1 - d/D × cos β)\n• BPFI (Inner race) = (N/2) × Fr × (1 + d/D × cos β)\n• BSF (Ball spin) = (D/2d) × Fr × (1 - (d/D × cos β)²)\n• FTF (Cage) = (Fr/2) × (1 - d/D × cos β)\n\n" +
        "เมื่อ N = balls, d = ball diameter, D = pitch diameter, β = contact angle, Fr = shaft rotation freq\n\n" +
        "Pattern ที่บอกถึง failure mode:\n• BPFO ปรากฏ → outer race spalling (เริ่มต้น)\n• BPFI ปรากฏพร้อม sideband ที่ ±Fr → inner race fault + load distribution problem\n• High frequency noise broad-band → severe wear, replace urgently\n\n" +
        "Tool: VibXpert, SKF Microlog หรือ open-source: ml-bearing-toolkit ใน Python",
      coverImage: UNSPLASH("photo-1581094794329-c8112a89af12"),
      layout: "technical",
      categorySlug: "mechanical",
      order: 7,
    },
    {
      slug: "typescript-patterns-production",
      title: "TypeScript type system patterns ที่ใช้บ่อยใน production",
      excerpt:
        "Branded types, discriminated unions, exhaustive checks — patterns ที่ตำราไม่ได้สอน",
      body:
        "5 patterns ที่ใช้ใน production ของทีม:\n\n" +
        "1. Branded types สำหรับ ID — กัน accidentally swap UserId กับ OrgId\n```ts\ntype Brand<T, B> = T & { readonly __brand: B };\ntype UserId = Brand<string, 'UserId'>;\ntype OrgId = Brand<string, 'OrgId'>;\n```\n\n" +
        "2. Discriminated unions สำหรับ state machine\n```ts\ntype LoadingState = \n  | { kind: 'idle' }\n  | { kind: 'loading' }\n  | { kind: 'success', data: User }\n  | { kind: 'error', error: string };\n```\n\n" +
        "3. Exhaustive switch ด้วย `never`\n```ts\nfunction handle(s: LoadingState) {\n  switch (s.kind) {\n    case 'idle': return ...;\n    // ถ้าลืม case ใด → compile error\n    default: const _: never = s;\n  }\n}\n```\n\n" +
        "4. Const assertions + literal narrowing\n5. Template literal types สำหรับ API path inference",
      coverImage: UNSPLASH("photo-1517694712202-14dd9538aa97"),
      layout: "sidebar",
      categorySlug: "software",
      order: 8,
    },
    {
      slug: "gantt-chart-actually-useful",
      title: "ทำ Gantt chart ที่ใช้งานได้จริง",
      excerpt:
        "Gantt ใน MS Project ที่ไม่มีใครอ่าน vs Gantt ที่ทีมใช้ทุกวัน — ความต่าง",
      body:
        "Gantt chart มี 2 mode — Gantt ที่เอาไว้โชว์เจ้าของโครงการ และ Gantt ที่ทีมใช้ทุกวัน\n\n" +
        "Gantt ที่ใช้ทุกวันต้อง:\n\n" +
        "1. ไม่เกิน 30 lines ใน 1 view (ทุกอย่างเกินกว่านี้คือ noise)\n\n" +
        "2. แต่ละ line มี owner ชัดเจน (ชื่อคน ไม่ใช่ ‘team’)\n\n" +
        "3. มี slack/buffer ที่แสดงเห็น (ไม่ใช่ทุกอย่าง critical path)\n\n" +
        "4. Update ทุกสัปดาห์โดยทีม — ไม่ใช่ PM กดอัปเดตคนเดียว\n\n" +
        "5. Print ออกแล้ว readable บน A3 (ถ้าใหญ่กว่านี้ = แบ่งเป็นหลาย Gantt)\n\n" +
        "Tool ที่ใช้: Microsoft Project สำหรับ complex projects, Linear/Asana สำหรับ software teams, simple spreadsheet ก็พอสำหรับโครงการเล็ก",
      coverImage: UNSPLASH("photo-1454165804606-c3d57bc86b40"),
      layout: "classic",
      categorySlug: "project",
      order: 9,
    },
  ],

  timeline: [
    {
      date: "2019",
      title: "เริ่ม blog ส่วนตัว",
      description: "วิศวกรโครงสร้าง 1 คน เขียนบล็อกเรื่อง structural analysis",
      order: 0,
    },
    {
      date: "2021",
      title: "ขยายเป็น multi-author",
      description: "เชิญ senior จาก 3 สาขามาเขียนร่วม — electrical, mechanical, software",
      order: 1,
    },
    {
      date: "2023",
      title: "ครบ 200 บทความ",
      description: "ผ่านการอ่าน 500k unique readers ส่วนใหญ่จาก SEA + South Asia",
      imageUrl: UNSPLASH("photo-1504917595217-d4dc5ebe6122", 900),
      order: 2,
    },
    {
      date: "Q2 2025",
      title: "เปิด private community Discord",
      description: "สำหรับ subscriber ที่อยากปรึกษา expert ในแต่ละสาขาแบบ 1:1",
      order: 3,
    },
    {
      date: "2026",
      title: "เริ่ม video tutorial series",
      description: "ทำ video สำหรับเนื้อหา technical ที่ text อธิบายได้ยาก",
      order: 4,
    },
  ],

  openPositions: [
    {
      id: "senior-civil-engineer",
      title: "Senior Civil Engineer",
      team: "Structural",
      type: "Full-time",
      location: "Bangkok / Site",
      summary:
        "ออกแบบโครงสร้างอาคาร 8+ ชั้น ผ่าน EIT — เคยใช้ ETABS / SAP2000 + AutoCAD",
    },
    {
      id: "electrical-engineer",
      title: "Electrical Engineer",
      team: "Electrical",
      type: "Full-time",
      location: "Bangkok / Site",
      summary:
        "ออกแบบระบบไฟฟ้า industrial 3-phase + control panel เคย design substation ขนาดกลาง",
    },
    {
      id: "mechanical-engineer",
      title: "Mechanical Engineer",
      team: "Mechanical",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ออกแบบ HVAC + pneumatic / hydraulic system + analysis FEM พื้นฐาน",
    },
    {
      id: "software-engineer",
      title: "Software Engineer",
      team: "Software",
      type: "Full-time / Remote",
      location: "Remote (TH timezone)",
      summary:
        "TypeScript + Postgres + React 5+ ปี เคยทำ ERP / SaaS / internal tool ในวงการวิศวกรรม",
    },
    {
      id: "project-manager",
      title: "Project Manager (Construction)",
      team: "Project",
      type: "Full-time",
      location: "Bangkok / Site",
      summary:
        "PMP หรือเทียบเท่า เคยคุมโครงการ 50M+ THB + ดูแล vendor ต่างชาติ + ทีม 10+",
    },
  ],

  navItems: [
    { label: "Home", kind: "page", target: "/", order: 0 },
    {
      label: "Disciplines",
      kind: "page",
      target: "",
      order: 1,
      children: [
        { label: "โครงสร้าง", kind: "category", target: "structural", order: 0 },
        { label: "ไฟฟ้า", kind: "category", target: "electrical", order: 1 },
        { label: "เครื่องกล", kind: "category", target: "mechanical", order: 2 },
        { label: "ซอฟต์แวร์", kind: "category", target: "software", order: 3 },
        { label: "โครงการ", kind: "category", target: "project", order: 4 },
      ],
    },
    { label: "Articles", kind: "page", target: "/articles", order: 2 },
    { label: "Careers", kind: "page", target: "/careers", order: 3 },
    { label: "About", kind: "page", target: "/about", order: 4 },
  ],
};
