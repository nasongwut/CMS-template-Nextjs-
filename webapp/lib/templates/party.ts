import type { SiteTemplate } from "./types";

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const partyTemplate: SiteTemplate = {
  id: "party",
  name: "Partido",
  blurb: "Party + Event planning — ทุกโอกาสในชีวิต",
  glyph: "✦",
  themeId: "bloom",
  siteName: "Partido",
  siteDescription:
    "ทุกเรื่องเกี่ยวกับการจัดงาน — วันเกิด งานแต่ง งานบริษัท ของขวัญ ของชำร่วย และไอเดียที่ทำให้แขกประทับใจ",

  about: {
    heading: "Partido",
    subheading:
      "งานปาร์ตี้ที่ดี ไม่ใช่งานที่หรูที่สุด — แต่เป็นงานที่ทำให้ทุกคนรู้สึกได้รับเชิญจริงๆ",
    body:
      "Partido เริ่มต้นจากทีมที่จัดงาน wedding มากกว่า 200 ครั้งในรอบ 6 ปี — เราเห็นทั้งงานที่งดงามและงานที่เครียดเกินไป\n\n" +
      "เราเชื่อว่ารายละเอียดเล็กๆ ที่ทำให้แขกรู้สึก ‘มีคนคิดถึงเรา’ มีค่ามากกว่าการตกแต่งหรูหรา\n\n" +
      "ทุกบทความที่นี่ออกแบบมาเพื่อช่วยให้คุณวางแผนงานในงบที่มี โดยไม่เสียคุณภาพ",
    heroImage: UNSPLASH("photo-1530103862676-de8c9debad1d"),
    layout: "magazine",
  },

  categories: [
    {
      slug: "birthday",
      name: "ปาร์ตี้วันเกิด",
      description: "เด็ก ผู้ใหญ่ surprise — ไอเดีย theme และ checklist",
      coverImage: UNSPLASH("photo-1464349095431-e9a21285b5f3"),
      order: 0,
    },
    {
      slug: "wedding",
      name: "งานแต่งงาน",
      description: "พิธี งานเลี้ยง สถานที่ และทีมงานที่ต้องเลือกให้ดี",
      coverImage: UNSPLASH("photo-1519225421980-715cb0215aed"),
      order: 1,
    },
    {
      slug: "corporate",
      name: "งานบริษัท",
      description: "Year-end party launch event team building",
      coverImage: UNSPLASH("photo-1492684223066-81342ee5ff30"),
      order: 2,
    },
    {
      slug: "gifts",
      name: "ของขวัญ",
      description: "ของขวัญที่คนได้รับแล้วประทับใจ ไม่ใช่แค่ใช้เสร็จแล้วลืม",
      coverImage: UNSPLASH("photo-1513201099705-a9746e1e201f"),
      order: 3,
    },
    {
      slug: "decor-party",
      name: "ตกแต่ง & ของชำร่วย",
      description: "Balloon arch dessert table flower setup ของชำร่วย",
      coverImage: UNSPLASH("photo-1521336575822-6da63fb45455"),
      order: 4,
    },
  ],

  articles: [
    {
      slug: "kids-birthday-superhero",
      title: "วันเกิดเด็ก theme superhero — checklist 17 ข้อ",
      excerpt:
        "งาน 4 ชั่วโมง 25 คน budget 8,000 บาท — เด็กจำได้นานหลายปี",
      body:
        "หลังจัดงานแบบนี้มา 18 ครั้ง สำหรับลูกของลูกค้า + ลูกหลานในครอบครัวเอง — checklist ที่ทำให้งานไม่เครียด:\n\n" +
        "1. เลือกฮีโร่เดียว ไม่ผสม Marvel กับ DC (เด็กจะถูกแบ่งเป็น 2 กลุ่ม)\n2. ใบเชิญดิจิทัล Canva 30 นาที\n3. Balloon arch สีของตัวละคร 2 สี\n4. Cake topper สั่ง online 200 บาท\n5. ของเล่นจัด goodie bag ราคา 50/ชิ้น (มาสก์, สติกเกอร์, ดาว)\n6. กิจกรรม: ‘rescue mission’ ซ่อนของในสวน\n7. เพลง playlist ทำไว้ล่วงหน้า — Marvel/DC opening songs ใน Spotify\n\n" +
        "ที่เหลือเหมือนงานทั่วไป — อาหาร เครื่องดื่ม ของหวาน เก้าอี้ — สเปคทุกอย่างคืนได้ภายใน 1 วันก่อนงาน",
      coverImage: UNSPLASH("photo-1464349095431-e9a21285b5f3"),
      layout: "gallery",
      categorySlug: "birthday",
      order: 0,
    },
    {
      slug: "thai-engagement-ceremony",
      title: "พิธีหมั้นแบบไทย — ขั้นตอนครบ + checklist สำหรับเจ้าบ่าวเจ้าสาว",
      excerpt:
        "ขันหมาก ของหมั้น คำกล่าวสำคัญ — ครอบครัวไทย-จีน-ฝรั่งใช้ได้",
      body:
        "พิธีหมั้นไทยมีองค์ประกอบที่ฝ่ายเจ้าบ่าวต้องเตรียม 4 อย่างหลัก:\n\n" +
        "1. ขันหมาก — ใบไม้, ผ้าไหม, ทองคำ, เครื่องบูชา รวม 9 ขัน (เลขมงคล)\n\n" +
        "2. ของหมั้น — แหวน, สร้อย, หรือเงิน ตามแต่ตกลงกับครอบครัวฝ่ายหญิง\n\n" +
        "3. ขันหมากเอก/โท — มี ขันหมากเอกเป็นชุดหลัก ขันหมากโทคือของแถมที่เพิ่มความหรูหรา\n\n" +
        "4. คำกล่าว — ผู้เฒ่าฝ่ายชายกล่าวขอเจ้าสาว ฝ่ายหญิงตอบรับ\n\n" +
        "งบประมาณ: 30,000-300,000 บาทขึ้นไป ขึ้นกับครอบครัวและจำนวนแขก",
      coverImage: UNSPLASH("photo-1519741497674-611481863552"),
      layout: "editorial",
      categorySlug: "wedding",
      order: 1,
    },
    {
      slug: "souvenirs-that-last",
      title: "ของชำร่วยที่คนได้รับแล้วไม่ทิ้ง — 12 ไอเดียจริง",
      excerpt:
        "หลีกเลี่ยงของ generic ที่ลงถังขยะใน 24 ชั่วโมง — ของชำร่วยที่ใช้จริง",
      body:
        "ของชำร่วยที่ ‘ดี’ ต้องผ่าน 3 ข้อ: ใช้ได้จริง, เก็บได้ไม่กินที่, ระลึกได้ถึงงานครั้งนี้\n\n" +
        "1. เทียนหอม mini จากผู้ผลิตในประเทศ — ราคา 60-80 บาท ใช้ได้จริง\n\n" +
        "2. เมล็ดพันธุ์พืชจิ๋วในซองกระดาษ — ปลูกแล้วได้ดอกระลึกถึงงาน\n\n" +
        "3. Tea bag premium คู่กับขนมท้องถิ่น — เหมาะงานไทย\n\n" +
        "4. ที่เปิดขวด stainless ลายงานแกะสกัด — ใช้ในครัวทุกวัน\n\n" +
        "5-12 ต่อไป — link ในบทถัดไป\n\n" +
        "Budget ทั้งหมด: 100-200 บาท/ชิ้น เหมาะกับงานแต่ง / งานเกษียณ / งานเปิดบริษัท",
      coverImage: UNSPLASH("photo-1513201099705-a9746e1e201f"),
      layout: "classic",
      categorySlug: "decor-party",
      order: 2,
    },
    {
      slug: "year-end-party-200-people",
      title: "จัด Year-end company party 200 คน — playbook",
      excerpt:
        "Budget 600k งาน 4 ชั่วโมง — ทุกขั้นจาก kick-off ถึงเก็บงาน",
      body:
        "การจัด year-end สำหรับบริษัท 200 คน ต้องเริ่มล่วงหน้า 8 สัปดาห์เป็นอย่างต่ำ:\n\n" +
        "Week 8-7: kick-off, theme decision, venue shortlist\n" +
        "Week 6-5: venue booked, catering RFP, entertainment booking\n" +
        "Week 4-3: invitation sent, RSVP tracking, special diet collection\n" +
        "Week 2: tech rehearsal, last-minute change handling\n" +
        "Week 1: signage, gift bags assembly, day-of timeline\n\n" +
        "Budget breakdown ที่ใช้จริง: venue 30%, F&B 35%, entertainment 15%, decoration 10%, contingency 10%\n\n" +
        "Error ที่พบบ่อย: ตอบรับ <70% ของ headcount จริงในวันงาน — เผื่อ +15% ในการจอง food",
      coverImage: UNSPLASH("photo-1492684223066-81342ee5ff30"),
      layout: "magazine",
      categorySlug: "corporate",
      order: 3,
    },
    {
      slug: "balloon-arch-diy-or-hire",
      title: "Balloon arch — DIY หรือจ้าง ตัดสินใจยังไง",
      excerpt:
        "ค่าจ้างเริ่ม 3,000 — ทำเองได้ครึ่งหนึ่งของราคา แต่ใช้เวลา 5 ชั่วโมง",
      body:
        "Balloon arch (ซุ้มลูกโป่ง) เป็น decoration สำหรับงานเด็กหรืองาน casual ที่นิยมมาก\n\n" +
        "DIY: ค่าวัสดุ 1,200-1,800 บาท + เวลา 5 ชั่วโมง สำหรับ arch ขนาด 2.5 เมตร\nต้องการ: 130 ลูกโป่ง 3 ขนาด, balloon arch tape, ผู้ช่วย 1 คน\n\n" +
        "จ้าง: 3,000-5,000 บาท แล้วแต่ขนาดและสี ส่งติดให้ในที่งาน 1 ชั่วโมง\n\n" +
        "Tip: ถ้าจัดงานบ่อย ลงทุนปั๊มลม electric + pump shaft 1,500 บาท จะทำเองได้สบาย ส่วนงานครั้งเดียวจ้างจะคุ้มกว่า",
      coverImage: UNSPLASH("photo-1521336575822-6da63fb45455"),
      layout: "technical",
      categorySlug: "decor-party",
      order: 4,
    },
    {
      slug: "gifts-for-people-who-have-everything",
      title: "7 ของขวัญสำหรับคนที่มีทุกอย่างแล้ว",
      excerpt:
        "ของขวัญ ‘experience’ มักประทับใจกว่าของที่จับต้องได้ — สำหรับ executive ผู้ใหญ่",
      body:
        "1. คอร์สเรียนหนึ่งหัวข้อใหม่ — sushi making, wine tasting, photography\n\n" +
        "2. Spa day แบบ premium พร้อมบริการพาไปส่ง\n\n" +
        "3. ของหายาก: หนังสือ first-edition, vinyl record รุ่นเก่า, ของสะสมเฉพาะกลุ่ม\n\n" +
        "4. งานศิลปะจากศิลปินรุ่นใหม่ที่กำลังจะมีชื่อ — มูลค่าเพิ่มกับเวลา\n\n" +
        "5. Travel voucher แบบ flexible — ใช้ได้หลายปลายทาง\n\n" +
        "6. Custom embroidered piece — ผ้าเช็ดหน้า, หมวก, แจ็คเก็ต ปัก initial\n\n" +
        "7. Bespoke perfume ปรับแต่งจากกลิ่นที่เลือก",
      coverImage: UNSPLASH("photo-1513201099705-a9746e1e201f"),
      layout: "compact",
      categorySlug: "gifts",
      order: 5,
    },
    {
      slug: "mocktail-for-kids-party",
      title: "ค็อกเทลที่เด็กดื่มได้ในงานเลี้ยง — 6 สูตร",
      excerpt:
        "Mocktail ที่ดูเก๋พอกับเครื่องดื่มผู้ใหญ่ — เด็กจะรู้สึกเป็นส่วนหนึ่งของงาน",
      body:
        "Mocktail สวยๆ ที่ทำได้ง่ายในงานเด็ก:\n\n" +
        "1. Strawberry Lemonade Fizz — strawberry purée + lemon + sparkling water\n" +
        "2. Watermelon Cooler — watermelon juice + mint + lime\n" +
        "3. Mango Tango — mango + orange + soda + pinch of salt\n" +
        "4. Blue Lagoon — blue Hawaiian syrup + pineapple + soda\n" +
        "5. Pink Lemonade Spritzer — lemonade + grenadine + ginger ale\n" +
        "6. Tropical Sunset — orange juice + grenadine layered + cherry\n\n" +
        "Tip: ใช้แก้ว coupe หรือ martini glass + แต่งขอบด้วยน้ำตาลสีต่างๆ + ใส่ฟาง striped — ดูเก๋กว่าผู้ใหญ่ดื่ม wine ในงาน",
      coverImage: UNSPLASH("photo-1551024601-bec78aea704b"),
      layout: "sidebar",
      categorySlug: "birthday",
      order: 6,
    },
    {
      slug: "wedding-venue-100k-budget",
      title: "เช่าสถานที่จัดงานแต่ง budget 100k — มีตัวเลือกอะไรบ้าง",
      excerpt:
        "หาสถานที่แต่งใน 100k บาทไม่ง่าย แต่เป็นไปได้ — ตัวเลือก 6 ประเภท",
      body:
        "การจัดงานแต่งใน budget สถานที่ 100,000 บาท สามารถทำได้ในไทยถ้าเลือกถูกประเภท:\n\n" +
        "1. โรงแรม 4 ดาวต่างจังหวัด (เช่น เชียงราย แม่ฮ่องสอน) — รวมห้องพักให้แขก 30 ห้อง\n\n" +
        "2. รีสอร์ทเล็กในเขาใหญ่/ปาย — outdoor garden + ห้องพักเล็กๆ\n\n" +
        "3. คาเฟ่ขนาดใหญ่ที่เปิดให้เช่าทั้งร้านใน weekday — 60-80 คน\n\n" +
        "4. Beach house เช่าใน Bang Saen/Cha-am — งาน intimate\n\n" +
        "5. Studio space สไตล์ industrial ในกรุงเทพ — bring-your-own catering\n\n" +
        "6. บ้านญาติที่ใหญ่พอ — โบว์ ดอกไม้ ไฟ เพิ่มเอง",
      coverImage: UNSPLASH("photo-1519225421980-715cb0215aed"),
      layout: "wide",
      categorySlug: "wedding",
      order: 7,
    },
    {
      slug: "christmas-office-party-everyone-fun",
      title: "Christmas office party ที่ทุกคนสนุกจริง — ไม่ใช่แค่ HR",
      excerpt:
        "ความลับของ office party ที่คนรอ — คือไม่ให้รู้สึกว่าเป็น meeting ขยาย",
      body:
        "Office party ที่ล้มเหลวมักเริ่มจากการเอา formality มาผสม — พิธีกร MC, speech ของ CEO, awards ยาวๆ\n\n" +
        "Office party ที่ดีกลับด้าน — ลด formality, เพิ่ม interaction\n\n" +
        "เคล็ดลับ: 1) Open bar เร็วๆ (ภายใน 15 นาที), 2) games ที่เล่นเป็นกลุ่ม 4-6 คนได้ — ห้าม competitive, 3) speech ของ CEO ต้องไม่เกิน 3 นาที, 4) DJ play เพลงที่ทุก generation ในบริษัทรู้จัก, 5) End at 10 PM sharp — better short and memorable than long and tired",
      coverImage: UNSPLASH("photo-1492684223066-81342ee5ff30"),
      layout: "bold",
      categorySlug: "corporate",
      order: 8,
    },
    {
      slug: "choosing-wedding-photographer",
      title: "เลือก photographer งานแต่ง — ดูอะไรในผลงาน",
      excerpt:
        "Photographer ที่เหมาะกับงานคุณ ไม่ได้ขึ้นอยู่กับราคา — แต่ขึ้นอยู่กับ style",
      body:
        "Photographer งานแต่งในไทยมี 3 styles หลัก:\n\n" +
        "1. Photojournalism — เก็บ moment ธรรมชาติ candid ไม่จัด pose — เหมาะกับคู่ที่ relaxed\n\n" +
        "2. Fine Art — จัดวาง compose สวยงาม ใช้แสงและสถานที่ — เหมาะกับงานสวยมากเป็นพิเศษ\n\n" +
        "3. Traditional — ภาพถ่ายแบบครอบครัว ครบทุก pose สำคัญ — เหมาะกับงานครอบครัวใหญ่\n\n" +
        "ดู portfolio ของแต่ละช่างให้ครบ — ต้องเห็น 3-5 งานเต็ม ไม่ใช่แค่ highlight reel — เพราะ highlight reel ใครก็ทำให้ดูดีได้\n\n" +
        "ราคาในไทยปี 2026: 30k (มือใหม่), 60-80k (ระดับกลาง), 150k+ (top tier)",
      coverImage: UNSPLASH("photo-1519741497674-611481863552"),
      layout: "editorial",
      categorySlug: "wedding",
      order: 9,
    },
  ],

  timeline: [
    {
      date: "2018",
      title: "จัดงานแรก",
      description: "งานแต่งของเพื่อน — ไม่คิดจะทำเป็นอาชีพ",
      order: 0,
    },
    {
      date: "2020",
      title: "ครบ 30 งาน",
      description: "ตัดสินใจเปิดเป็นบริษัทอย่างเป็นทางการ ทีม 3 คน",
      order: 1,
    },
    {
      date: "2022",
      title: "ขยายเข้า corporate events",
      description: "เริ่มรับงานบริษัทเทคในกรุงเทพ — year-end, product launch",
      imageUrl: UNSPLASH("photo-1492684223066-81342ee5ff30", 900),
      order: 2,
    },
    {
      date: "2024",
      title: "ครบ 200 งานแต่ง",
      description: "นับเฉพาะงานเลี้ยงเต็มรูปแบบ ไม่นับงานหมั้น",
      order: 3,
    },
    {
      date: "2026",
      title: "เปิดบริการ destination wedding",
      description: "พา wedding ไป Bali, Phuket, Krabi — รวม logistics ครบ",
      order: 4,
    },
  ],

  openPositions: [
    {
      id: "wedding-planner",
      title: "Wedding Planner",
      team: "Weddings",
      type: "Full-time",
      location: "Bangkok / On-site",
      summary:
        "วางแผนงานแต่งตั้งแต่ engagement ถึง wedding day ดูแลลูกค้า 6-8 งาน/ปี งบ 500k+",
    },
    {
      id: "event-coordinator",
      title: "Event Coordinator",
      team: "Operations",
      type: "Full-time",
      location: "Bangkok / On-site",
      summary:
        "ประสานงาน vendor + venue ในวันงาน ทำงาน weekend เป็นหลัก สงบมือ + แก้ปัญหาเฉพาะหน้าเก่ง",
    },
    {
      id: "decoration-designer",
      title: "Decoration Designer",
      team: "Creative",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ออกแบบ floral + lighting + table setting ใช้ Pinterest mood board + Photoshop sketch",
    },
    {
      id: "logistics-coordinator",
      title: "Logistics Coordinator",
      team: "Operations",
      type: "Full-time",
      location: "Warehouse + venue",
      summary:
        "จัดทีมขนย้ายของ + setup งาน เริ่มเช้าก่อนงาน 4-6 ชั่วโมง คุม inventory ของเช่า",
    },
    {
      id: "sales-account-exec",
      title: "Sales Account Executive",
      team: "Sales",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "รับลูกค้า inbound + outbound — คอมมิชชั่นตามขนาดงาน เข้าใจ pricing ของ event industry",
    },
  ],

  navItems: [
    { label: "Home", kind: "page", target: "/", order: 0 },
    {
      label: "Events",
      kind: "page",
      target: "",
      order: 1,
      children: [
        { label: "ปาร์ตี้วันเกิด", kind: "category", target: "birthday", order: 0 },
        { label: "งานแต่งงาน", kind: "category", target: "wedding", order: 1 },
        { label: "งานบริษัท", kind: "category", target: "corporate", order: 2 },
      ],
    },
    { label: "Gifts & Decor", kind: "page", target: "",
      order: 2,
      children: [
        { label: "ของขวัญ", kind: "category", target: "gifts", order: 0 },
        { label: "ตกแต่ง / ของชำร่วย", kind: "category", target: "decor-party", order: 1 },
      ],
    },
    { label: "Articles", kind: "page", target: "/articles", order: 3 },
    { label: "Careers", kind: "page", target: "/careers", order: 4 },
    { label: "About", kind: "page", target: "/about", order: 5 },
  ],
};
