import type { SiteTemplate } from "./types";

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const petsTemplate: SiteTemplate = {
  id: "pets",
  name: "Furry House",
  blurb: "สัตว์เลี้ยง — อาหาร สุขภาพ การฝึก",
  glyph: "❀",
  themeId: "bloom",
  siteName: "Furry House",
  siteDescription:
    "ชุมชนคนรักสัตว์เลี้ยง — บทความเรื่องอาหาร สุขภาพ การฝึก และเรื่องราวเล็กๆ น่ารักของเพื่อนสี่ขา",

  about: {
    heading: "Furry House",
    subheading: "บ้านของเพื่อนสี่ขา และทุกชีวิตที่เรารักในครอบครัว",
    body:
      "เราเชื่อว่าสัตว์เลี้ยงไม่ใช่แค่ ‘สิ่งมีชีวิต’ ที่อยู่ในบ้าน — แต่เป็นสมาชิกของครอบครัวที่มีอารมณ์ ความรู้สึก และความต้องการเฉพาะ\n\n" +
      "Furry House ก่อตั้งโดยทีมสัตวแพทย์ 3 คนและคนรักสัตว์ 5 คนเพื่อสร้างพื้นที่ที่ให้ข้อมูลที่ถูกต้องและอ่านง่าย\n\n" +
      "บทความทุกชิ้นในเว็บนี้ผ่านการตรวจสอบโดยสัตวแพทย์ก่อนเผยแพร่",
    heroImage: UNSPLASH("photo-1450778869180-41d0601e046e"),
    layout: "split",
  },

  categories: [
    {
      slug: "dogs",
      name: "สุนัข",
      description: "ทุกเรื่องเกี่ยวกับน้องหมา — อาหาร การฝึก พฤติกรรม",
      coverImage: UNSPLASH("photo-1561037404-61cd46aa615b"),
      order: 0,
    },
    {
      slug: "cats",
      name: "แมว",
      description: "แมวบ้านและทุกพฤติกรรมแปลกๆ ที่คุณสงสัย",
      coverImage: UNSPLASH("photo-1514888286974-6c03e2ca1dba"),
      order: 1,
    },
    {
      slug: "small-pets",
      name: "กระต่าย / หนู / นก",
      description: "สัตว์เลี้ยงตัวเล็ก — พื้นที่ อาหาร และการดูแล",
      coverImage: UNSPLASH("photo-1583337130417-3346a1be7dee"),
      order: 2,
    },
    {
      slug: "fish",
      name: "ปลา / สัตว์น้ำ",
      description: "ตู้ปลา bonsai aquarium และการเลี้ยงปลาสวยงาม",
      coverImage: UNSPLASH("photo-1520302659611-d6b1b21e89dd"),
      order: 3,
    },
    {
      slug: "health",
      name: "สุขภาพและอาหาร",
      description: "วัคซีน อาหารเกรดสัตวแพทย์ และสัญญาณที่ควรพาไปหาหมอ",
      coverImage: UNSPLASH("photo-1583337130417-3346a1be7dee"),
      order: 4,
    },
  ],

  articles: [
    {
      slug: "5-foods-toxic-for-dogs",
      title: "5 อาหารที่ห้ามให้สุนัขกิน — เด็ดขาด",
      excerpt:
        "อาหารที่คนกินปกติแต่อันตรายต่อสุนัข — รู้ไว้ก่อนน้องป่วยเพราะคุณ",
      body:
        "อาหารที่อันตรายต่อสุนัข มีมากกว่าแค่ช็อกโกแลตที่ทุกคนรู้จัก — นี่คือ 5 อันดับที่สัตวแพทย์เจอบ่อยที่สุดในห้องฉุกเฉิน:\n\n" +
        "1. องุ่นและลูกเกด — ทำลายไตอย่างเฉียบพลัน แม้กินแค่ 1-2 ลูกก็เป็นอันตรายต่อสุนัขตัวเล็ก\n" +
        "2. หอม กระเทียม ต้นหอม — ทำลายเม็ดเลือดแดง สะสมเป็นพิษภายใน 3-7 วัน\n" +
        "3. ไซลิทอล (น้ำตาลเทียมใน gum / candy) — เป็นพิษมากกว่าช็อกโกแลตถึง 100 เท่า\n" +
        "4. อะโวคาโด (เมล็ดและเปลือก) — มีสาร persin ที่ทำให้อาเจียนรุนแรง\n" +
        "5. ขนมแมโคเดมีย — กระทบระบบประสาทส่วนกลาง",
      coverImage: UNSPLASH("photo-1587300003388-59208cc962cb"),
      layout: "classic",
      categorySlug: "dogs",
      order: 0,
    },
    {
      slug: "litter-box-training",
      title: "ฝึกแมวบ้านใช้ litter box ตั้งแต่ลูกแมว",
      excerpt:
        "ลูกแมวจะใช้ litter box ตามสัญชาตญาณอยู่แล้ว แต่ปัจจัยรอบตัวเป็นตัวกำหนดความสำเร็จ",
      body:
        "การฝึกแมวให้ใช้ litter box ไม่ใช่การ ‘สอน’ จริงๆ — แมวจะเลือกใช้ทรายเองตามสัญชาตญาณ แต่ปัจจัยรอบตัวคือสิ่งที่ทำให้สำเร็จหรือล้มเหลว\n\n" +
        "เคล็ดลับ: 1) มี litter box มากกว่าจำนวนแมวเสมอ +1 (เช่น แมว 2 ตัว = 3 box), 2) วางในที่เงียบ ไม่ใช่ใกล้ทางเดิน, 3) ทรายเปลี่ยนทุก 2-3 วัน เลือกแบบ clumping ที่กลิ่นไม่แรง\n\n" +
        "ถ้าฉี่นอก box หลายครั้ง — ตรวจสุขภาพก่อนสอนใหม่ อาจมี UTI",
      coverImage: UNSPLASH("photo-1574144611937-0df059b5ef3e"),
      layout: "sidebar",
      categorySlug: "cats",
      order: 1,
    },
    {
      slug: "first-rabbit-checklist",
      title: "กระต่ายตัวแรก — checklist 12 อย่างก่อนรับเข้าบ้าน",
      excerpt:
        "กระต่ายอายุยืน 8-12 ปี และต้องการการดูแลที่ไม่เหมือนสุนัข/แมว",
      body:
        "ก่อนรับน้องกระต่ายมาเลี้ยง เตรียมของ 12 อย่างนี้ให้ครบ:\n\n" +
        "พื้นที่ขนาด 1.5 ม. × 1.5 ม. ขึ้นไป, กรงสองชั้น (ไม่ใช่กรงเล็กๆ), หญ้า timothy 1 กิโล, อาหารเม็ดคุณภาพดี 1 ถุง, ขวดน้ำ 2 ขวด (สำรอง), กระบะทราย 1 กระบะ, ของเล่น chew 3 ชิ้น (กันฟันยาวเกิน), แปรงขน, ตัวพา carrier, ผ้ารองพื้น, ที่หลบซ่อน (hide box), และ — สำคัญ — สัตวแพทย์ที่รับรักษากระต่ายไว้ในรายชื่อ",
      coverImage: UNSPLASH("photo-1535930891776-0c2dfb7fda1a"),
      layout: "editorial",
      categorySlug: "small-pets",
      order: 2,
    },
    {
      slug: "first-aquarium-setup",
      title: "ตู้ปลามือใหม่ — 5 ขั้นพื้นฐาน",
      excerpt:
        "ตู้ปลาที่ตั้งถูกตั้งแต่ต้น ลดการตายของปลา 90% — กระบวนการแบบ scientific",
      body:
        "1. เลือกขนาดตู้ — มือใหม่ควรเริ่มที่ 60 ลิตรขึ้นไป (เล็กเกินดูแลยากเพราะ water chemistry ไม่ stable)\n\n" +
        "2. ตั้ง filter + heater + light แล้วเปิดเครื่อง 24/7 อย่างน้อย 2 สัปดาห์โดยไม่มีปลา (cycling)\n\n" +
        "3. ทดสอบน้ำด้วย test kit — ammonia, nitrite, nitrate, pH — ก่อนเอาปลาเข้า\n\n" +
        "4. ใส่ปลาทีละ 2-3 ตัว ห่างกันสัปดาห์ละครั้ง ระหว่างนี้ตรวจน้ำทุก 3 วัน\n\n" +
        "5. เปลี่ยนน้ำ 25% ทุกสัปดาห์ ห้าม 100%",
      coverImage: UNSPLASH("photo-1520302659611-d6b1b21e89dd"),
      layout: "technical",
      categorySlug: "fish",
      order: 3,
    },
    {
      slug: "dog-vaccine-schedule",
      title: "วัคซีนสุนัข — กำหนดและค่าใช้จ่ายในไทย 2026",
      excerpt:
        "ตารางวัคซีนพื้นฐานสำหรับลูกสุนัข + booster ประจำปี",
      body:
        "ตารางวัคซีนที่กรมปศุสัตว์แนะนำสำหรับสุนัขในไทย:\n\n" +
        "อายุ 6-8 สัปดาห์: วัคซีน Distemper + Parvo เข็มแรก (500-800฿)\n" +
        "อายุ 10-12 สัปดาห์: เข็มสอง + Lepto (800-1,200฿)\n" +
        "อายุ 14-16 สัปดาห์: เข็มสาม + Rabies (800-1,500฿)\n" +
        "อายุ 1 ปี: Booster ทั้งหมด (1,500-2,500฿)\n" +
        "หลังจากนั้น: Booster ทุกปี (1,000-2,000฿)\n\n" +
        "ค่าใช้จ่ายรวมปีแรก: 3,000-5,500 บาท",
      coverImage: UNSPLASH("photo-1583512603805-3cc6b41f3edb"),
      layout: "compact",
      categorySlug: "health",
      order: 4,
    },
    {
      slug: "cat-weird-behaviors-explained",
      title: "ทำไมแมวชอบทำท่าแปลกๆ — 8 พฤติกรรมอธิบายได้",
      excerpt:
        "แมว loaf, แมวเอาก้นชนคุณ, แมวขย้ำผ้า — มีเหตุผลทางพันธุกรรมและสัญชาตญาณ",
      body:
        "1. ท่า ‘loaf’ — เก็บอุ้งเท้าใต้ตัว = รู้สึกปลอดภัยและเตรียมหนีได้เร็ว\n\n" +
        "2. เอาก้นชนคุณ — แสดงความรักและความไว้วางใจ (แมวจะให้ส่วนเปราะบางที่สุดของตัวเองกับคนที่ไว้ใจเท่านั้น)\n\n" +
        "3. ขย้ำผ้า (kneading) — สัญชาตญาณตั้งแต่ลูกแมวที่ดูดนมแม่ บอกว่าน้องสบาย\n\n" +
        "4. หางสั่นปลายๆ — กำลังมีความสุขมาก (ไม่เหมือนสุนัขที่หางสั่นทั้งหาง)\n\n" +
        "5. หลับตาช้าๆ (slow blink) — เป็น ‘kitty kiss’ ภาษาสากลของแมว\n\n" +
        "6-8 มีอีก ติดตามตอนต่อไป",
      coverImage: UNSPLASH("photo-1573865526739-10659fec78a5"),
      layout: "gallery",
      categorySlug: "cats",
      order: 5,
    },
    {
      slug: "bird-cage-elements",
      title: "กรงนกที่ดี ต้องมีองค์ประกอบอะไรบ้าง",
      excerpt: "พื้นที่ คอน อาหาร แสง — 6 ข้อที่กรงนกคุณภาพต้องผ่าน",
      body:
        "กรงนกที่ดีไม่ใช่แค่ ‘ใหญ่พอ’ — มี 6 องค์ประกอบที่ขาดไม่ได้:\n\n" +
        "1. ขนาด: ยาวกว่า 1.5 เท่าของช่วงปีกนก (ไม่ใช่ความสูง — นกบินขวางมากกว่าขึ้น)\n" +
        "2. คอนหลายขนาด หลายเนื้อ — เลี่ยงคอนพลาสติกล้วน เลือกไม้จริง 3 ชนิดขึ้นไป\n" +
        "3. ของเล่น 2-3 ชิ้น + เปลี่ยนทุกสัปดาห์ — เลี่ยงเบื่อ\n" +
        "4. ตำแหน่งวาง: ไม่ใต้ AC โดยตรง ไม่ใกล้หน้าต่างที่แดดส่อง\n" +
        "5. แสงธรรมชาติทุกวัน — อย่างน้อย 4 ชั่วโมง\n" +
        "6. ทำความสะอาดพื้นทุก 2-3 วัน",
      coverImage: UNSPLASH("photo-1486825586573-7131f7991bdd"),
      layout: "classic",
      categorySlug: "small-pets",
      order: 6,
    },
    {
      slug: "wet-cat-food-review-7-brands",
      title: "รีวิวอาหารแมวเปียก 7 ยี่ห้อในไทย",
      excerpt:
        "ทดสอบกับแมวบ้าน 12 ตัวเป็นเวลา 3 เดือน — จัดอันดับด้วยข้อมูล ไม่ใช่ความเห็น",
      body:
        "ทีมเรา (ร่วมกับบ้านอาสาสมัคร 8 หลัง) ทดสอบอาหารแมวเปียก 7 ยี่ห้อในตลาดไทย เป็นเวลา 3 เดือน วัดผลด้วย: อัตราการกิน, น้ำหนักเปลี่ยน, ขนเงา, กลิ่นของอึ\n\n" +
        "ผลลัพธ์โดยสรุป: ยี่ห้อในประเทศ 2 ยี่ห้อทำคะแนนเทียบเท่ายี่ห้อนำเข้าได้ดีในราคาครึ่งหนึ่ง — แต่ยี่ห้อนำเข้าระดับ premium ก็มีข้อได้เปรียบในเรื่อง protein content\n\n" +
        "สูตรที่เราแนะนำสำหรับแมวบ้านทั่วไป: ผสม wet 60% + dry 40% ในแต่ละมื้อ",
      coverImage: UNSPLASH("photo-1606214174585-fe31582dc6ee"),
      layout: "magazine",
      categorySlug: "health",
      order: 7,
    },
    {
      slug: "positive-dog-training",
      title: "ฝึกสุนัขโดยไม่ลงโทษ — จริงไหม ทำได้ยังไง",
      excerpt:
        "การลงโทษทำให้สุนัขกลัวคุณ ไม่ใช่เคารพคุณ — positive reinforcement คือทางเลือกที่ได้ผลและมีหลักฐานทางวิทยาศาสตร์",
      body:
        "สมัยก่อนเราเชื่อว่าสุนัขต้อง ‘รู้ว่าใครเป็นเจ้านาย’ ผ่านการลงโทษ — ปัจจุบันงานวิจัยกว่า 30 ปีบอกตรงข้าม\n\n" +
        "Positive reinforcement (รางวัลเมื่อทำถูก, ignore เมื่อทำผิด) ได้ผลดีกว่าการลงโทษทั้งในการเรียนรู้และในความสัมพันธ์ระยะยาวระหว่างคนกับสุนัข\n\n" +
        "เคล็ดลับเบื้องต้น: ขนมเล็กๆ ที่สุนัขชอบที่สุด, ให้รางวัลภายใน 3 วินาทีหลังพฤติกรรมที่ต้องการ, คำสั่งสั้นๆ ที่ตัวเอง (และคนในบ้าน) จำง่าย",
      coverImage: UNSPLASH("photo-1587300003388-59208cc962cb"),
      layout: "bold",
      categorySlug: "dogs",
      order: 8,
    },
    {
      slug: "goldfish-color-health",
      title: "สีของปลาทอง — บอกอะไรเรื่องสุขภาพ",
      excerpt: "ปลาทองเปลี่ยนสีไม่ใช่เรื่องบังเอิญ — สังเกตให้ดี",
      body:
        "การเปลี่ยนสีของปลาทองเป็นสัญญาณที่ละเอียดแต่สำคัญ:\n\n" +
        "ส้มซีดไปทางเหลือง — น้ำที่ pH ผิดปกติ, อาจขาดแสง UV\n\n" +
        "เป็นแผลสีดำหรือเทาเป็นจุดๆ — ammonia burn จากน้ำคุณภาพไม่ดี\n\n" +
        "สีจางลงเรื่อยๆ ตลอดเดือน — ขาดสารอาหารคาโรทีน (carotenoids)",
      coverImage: UNSPLASH("photo-1520302659611-d6b1b21e89dd"),
      layout: "minimal",
      categorySlug: "fish",
      order: 9,
    },
  ],

  timeline: [
    {
      date: "2020",
      title: "เปิดเพจ Facebook Furry House",
      description: "ทีมสัตวแพทย์ 3 คน + คนรักสัตว์ 5 คน เริ่มแชร์ความรู้ฟรี",
      order: 0,
    },
    {
      date: "2021",
      title: "ครบ 100,000 followers",
      description: "บทความถูก share เข้ากลุ่ม Facebook ของคนรักสัตว์ทั่วประเทศ",
      order: 1,
    },
    {
      date: "Q3 2022",
      title: "เปิด online clinic ปรึกษาสัตวแพทย์",
      description: "ปรึกษาฟรีผ่าน Line สำหรับ urgent cases — มี vet on-call 12 ชม./วัน",
      imageUrl: UNSPLASH("photo-1583337130417-3346a1be7dee", 900),
      order: 2,
    },
    {
      date: "2024",
      title: "ร่วมโครงการกับมูลนิธิรักษ์แมว",
      description: "บริจาคค่าวัคซีนให้แมวจรในกรุงเทพ 2,000 ตัว/ปี",
      order: 3,
    },
    {
      date: "2026",
      title: "เปิดร้านอาหารสัตว์ออนไลน์",
      description: "คัดเฉพาะยี่ห้อที่ผ่านการทดสอบของทีมสัตวแพทย์",
      order: 4,
    },
  ],

  openPositions: [
    {
      id: "veterinarian",
      title: "Veterinarian (Part-time)",
      team: "Clinic",
      type: "Part-time",
      location: "Bangkok",
      summary:
        "สัตวแพทย์ part-time ดูแล online consultation 3 ชั่วโมง/วัน + ตรวจสุขภาพสัตว์เลี้ยงพนักงาน",
    },
    {
      id: "pet-care-writer",
      title: "Pet Care Writer",
      team: "Editorial",
      type: "Full-time",
      location: "Bangkok / Remote",
      summary:
        "เขียนบทความเรื่องสุนัข แมว สัตว์เลี้ยงตัวเล็ก — ทุกบทผ่านการตรวจของสัตวแพทย์ก่อนเผยแพร่",
    },
    {
      id: "photo-video-producer",
      title: "Pet Photo / Video Producer",
      team: "Content",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ถ่าย-ตัดต่อรูป + video สัตว์เลี้ยง เก่งกับสัตว์ + อดทน + รู้จัก lighting / sound design",
    },
    {
      id: "customer-service",
      title: "Customer Service",
      team: "Support",
      type: "Full-time",
      location: "Bangkok / Remote",
      summary:
        "ตอบคำถาม Line OA + Facebook + comment ในบทความ ตอบเองได้ไม่ต้องส่งให้สัตวแพทย์เสมอ",
    },
    {
      id: "animal-behavior-specialist",
      title: "Animal Behavior Specialist",
      team: "Clinic",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ผู้เชี่ยวชาญพฤติกรรมสัตว์ ให้คำปรึกษากรณีพฤติกรรมก้าวร้าว / กลัว / wt issue จัด workshop",
    },
  ],

  navItems: [
    { label: "Home", kind: "page", target: "/", order: 0 },
    {
      label: "Pets",
      kind: "page",
      target: "",
      order: 1,
      children: [
        { label: "สุนัข", kind: "category", target: "dogs", order: 0 },
        { label: "แมว", kind: "category", target: "cats", order: 1 },
        { label: "กระต่าย / หนู / นก", kind: "category", target: "small-pets", order: 2 },
        { label: "ปลา", kind: "category", target: "fish", order: 3 },
      ],
    },
    { label: "Health", kind: "category", target: "health", order: 2 },
    { label: "Articles", kind: "page", target: "/articles", order: 3 },
    { label: "Careers", kind: "page", target: "/careers", order: 4 },
    { label: "About", kind: "page", target: "/about", order: 5 },
  ],
};
