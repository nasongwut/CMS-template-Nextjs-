import type { SiteTemplate } from "./types";

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const furnitureTemplate: SiteTemplate = {
  id: "furniture",
  name: "Casa Studio",
  blurb: "เฟอร์นิเจอร์ — design notes, material, vendor",
  glyph: "❦",
  themeId: "editorial",
  siteName: "Casa Studio",
  siteDescription:
    "บทความและคู่มือเลือกเฟอร์นิเจอร์ — เน้นวัสดุที่ใช้นาน ดีไซน์ที่ไม่ตกเทรนด์ และผู้ผลิตที่น่าเชื่อถือ",

  about: {
    heading: "Casa Studio",
    subheading:
      "เฟอร์นิเจอร์ที่ดีคือเฟอร์นิเจอร์ที่ใช้ได้สิบปีโดยยังภูมิใจ — เราเขียนเพื่อช่วยคุณเลือก",
    body:
      "Casa Studio เริ่มต้นจากความหงุดหงิดง่ายๆ — รีวิวเฟอร์นิเจอร์ในไทยส่วนใหญ่เน้นโชว์ไม่เน้นใช้ และมักไม่ระบุข้อด้อย\n\n" +
      "ทีมของเราเป็นนักออกแบบ interior สามคนและช่างไม้สองคน — เราใช้เครื่องมือจริง อยู่ในวงการมานาน เห็นทั้งของดีและของห่วยมาเยอะ\n\n" +
      "บทความทุกชิ้นมีคำตอบสำหรับคำถามที่เราถูกถามบ่อยที่สุดในชีวิตจริง — ‘ตัวไหนคุ้มที่สุดในงบนี้?’",
    heroImage: UNSPLASH("photo-1555041469-a586c61ea9bc"),
    layout: "minimal",
  },

  categories: [
    {
      slug: "living",
      name: "ห้องนั่งเล่น",
      description: "โซฟา ตู้โชว์ พรม โต๊ะกลาง — เฟอร์นิเจอร์ที่อยู่ในชีวิตประจำวัน",
      coverImage: UNSPLASH("photo-1567538096630-e0c55bd6374c"),
      order: 0,
    },
    {
      slug: "bedroom",
      name: "ห้องนอน",
      description: "เตียง ที่นอน หัวเตียง ตู้เสื้อผ้า — ส่วนที่ใช้เวลาในชีวิตมากที่สุด",
      coverImage: UNSPLASH("photo-1505691938895-1758d7feb511"),
      order: 1,
    },
    {
      slug: "kitchen",
      name: "ครัวและรับประทาน",
      description: "ครัว built-in โต๊ะอาหาร เก้าอี้ทาน อุปกรณ์ทำอาหาร",
      coverImage: UNSPLASH("photo-1556909114-f6e7ad7d3136"),
      order: 2,
    },
    {
      slug: "office",
      name: "ห้องทำงาน",
      description: "โต๊ะทำงาน เก้าอี้ที่ดี ระบบเก็บของ และแสงสำหรับ WFH",
      coverImage: UNSPLASH("photo-1593642632559-0c6d3fc62b89"),
      order: 3,
    },
    {
      slug: "decor",
      name: "ของแต่งบ้าน",
      description: "โคมไฟ พรม รูปติดผนัง ของจัดวาง — รายละเอียดที่เปลี่ยนความรู้สึก",
      coverImage: UNSPLASH("photo-1513161455079-7dc1de15ef3e"),
      order: 4,
    },
  ],

  articles: [
    {
      slug: "3-seat-sofa-buying-guide",
      title: "โซฟา 3 ที่นั่ง — เลือกอย่างไรให้คุ้ม 10 ปี",
      excerpt:
        "หลักการเลือกโซฟาที่ทนนาน — โครงไม้ ฟองน้ำ ผ้าหุ้ม — ที่ร้านไม่บอก",
      body:
        "โซฟาที่ดีอยู่ได้ 10 ปี — โซฟาที่ห่วยอยู่ได้ 2 ปี ราคาต่างกันมักแค่ 30%\n\n" +
        "โครงไม้: ต้องเป็น kiln-dried hardwood (โอ๊ก, บีช) ไม่ใช่ไม้อัด MDF ทดสอบโดยยกขอบขึ้นด้านเดียว — ถ้าอีกขอบไม่ลอยตามแสดงว่าโครงแข็งจริง\n\n" +
        "ฟองน้ำ: high-density foam (D35 ขึ้นไป) ส่วนผสมที่ดีคือ foam + feather + polyfill — มี layer ขั้นกัน ไม่ใช่ฟองน้ำชั้นเดียว\n\n" +
        "ผ้าหุ้ม: rub count > 30,000 (Martindale test) สำหรับครอบครัวที่มีเด็ก/สัตว์เลี้ยง — ผ้า linen ดูแลยาก ผ้า microfiber ทน",
      coverImage: UNSPLASH("photo-1555041469-a586c61ea9bc"),
      layout: "magazine",
      categorySlug: "living",
      order: 0,
    },
    {
      slug: "wood-vs-metal-bed-frame",
      title: "เตียงไม้ vs เตียงเหล็ก — ตัวไหนเหมาะกับใคร",
      excerpt: "เปรียบเทียบทั้งความทน เสียง การ assembly และความรู้สึกในห้องนอน",
      body:
        "เตียงไม้ — ความรู้สึกอบอุ่น เงียบไม่ดัง (ถ้าไม้คุณภาพดี) ทนนาน 15+ ปี แต่ขนย้ายยาก หนัก และราคาสูงกว่า\n\n" +
        "เตียงเหล็ก — modern look น้ำหนักเบา ถอดประกอบง่าย ขนย้ายสะดวก ราคาต่ำกว่า แต่บางครั้งดังเวลาขยับ และโครงเหล็กเย็นในห้องแอร์\n\n" +
        "คำแนะนำของเรา: เตียงไม้สำหรับบ้าน ที่จะอยู่ยาว, เตียงเหล็กสำหรับอพาร์ตเมนต์เช่า/คนย้ายบ้านบ่อย",
      coverImage: UNSPLASH("photo-1505691938895-1758d7feb511"),
      layout: "editorial",
      categorySlug: "bedroom",
      order: 1,
    },
    {
      slug: "small-kitchen-ideas",
      title: "7 ไอเดียตกแต่งครัวขนาดเล็ก — Maximize ทุกตารางเมตร",
      excerpt:
        "ครัวคอนโด 6 ตร.ม. ก็ทำอาหารได้ทุกวันถ้าวางถูก — ตัวอย่างจริงจาก 7 บ้าน",
      body:
        "1. Vertical storage — ตู้สูงถึงเพดาน ใช้บันไดสามขั้นเก็บไว้ในซอก\n\n" +
        "2. Magnetic knife strip + spice rack — เคาน์เตอร์ว่างขึ้นทันที\n\n" +
        "3. Pull-out pantry บางๆ ในช่องว่างข้างตู้เย็น — เก็บของกระป๋อง 50+ ชิ้น\n\n" +
        "4. Foldable dining table ที่ผนัง — กางเฉพาะตอนทาน เก็บแล้วได้พื้นที่กลับคืน\n\n" +
        "5. Under-cabinet LED strip — เพิ่ม working light โดยไม่กินที่\n\n" +
        "6-7 ติดตามต่อในบทถัดไป",
      coverImage: UNSPLASH("photo-1556909114-f6e7ad7d3136"),
      layout: "gallery",
      categorySlug: "kitchen",
      order: 2,
    },
    {
      slug: "builtin-storage-worth-it",
      title: "ตู้เก็บของ built-in — คุ้มหรือไม่?",
      excerpt:
        "ค่าทำ built-in สูงกว่าตู้สำเร็จ 2-3 เท่า แต่มีเหตุผลที่หลายบ้านยอมจ่าย",
      body:
        "Built-in cabinetry มีต้นทุนสูง — ค่าฝีมือ + ค่าวัสดุ + ค่าเสียโอกาสที่ขนย้ายไม่ได้ตอนย้ายบ้าน\n\n" +
        "ข้อดี: ใช้พื้นที่ทุกตารางเมตรได้ pixel-perfect, ไม่มีฝุ่นซ่อนหลัง, ดู ‘luxury’ มากกว่าตู้สำเร็จ, customize ลึก/สูง/กว้างได้ละเอียด\n\n" +
        "ข้อเสีย: ขนย้ายไม่ได้, ค่าซ่อมแพง, ถ้าออกแบบผิดทรงห้องเปลี่ยนไม่ได้, ระยะเวลาผลิตนาน 4-8 สัปดาห์\n\n" +
        "คำตอบ: คุ้มสำหรับบ้านที่ตั้งใจอยู่ 7+ ปี — สำหรับคอนโดเช่าหรือบ้าน Starter ใช้ modular ดีกว่า",
      coverImage: UNSPLASH("photo-1565538810643-b5bdb714032a"),
      layout: "classic",
      categorySlug: "living",
      order: 3,
    },
    {
      slug: "wfh-desk-back-friendly",
      title: "โต๊ะ WFH ที่ปวดหลังน้อย — มาตรฐาน ergonomic",
      excerpt:
        "ตัวเลขที่ต้องตรงเป๊ะ — ความสูงโต๊ะ ระยะหน้าจอ ความสูงเก้าอี้",
      body:
        "หลังจากปรึกษานักกายภาพบำบัด เราสรุปตัวเลขที่ ‘ต้องตรง’ ในการตั้ง work station:\n\n" +
        "ความสูงโต๊ะ: ข้อศอกตั้งฉาก 90° เมื่อพิมพ์ (ส่วนใหญ่ 70-74 ซม. สำหรับคนสูง 165-175)\n\n" +
        "ระยะหน้าจอ: ต้องห่างประมาณ arm’s length (60-70 ซม.) ขอบบนของจอตรงกับสายตา\n\n" +
        "ความสูงเก้าอี้: เท้าวางราบกับพื้น เข่าตั้งฉาก 90° — ถ้าไม่ถึงพื้นใช้ footrest\n\n" +
        "ความสูงพนักรองหลัง: ค้ำที่กระดูกสันหลังส่วน lumbar (เอวล่าง) ไม่ใช่หลังบน",
      coverImage: UNSPLASH("photo-1593642632559-0c6d3fc62b89"),
      layout: "technical",
      categorySlug: "office",
      order: 4,
    },
    {
      slug: "persian-vs-wool-rug",
      title: "พรมเปอร์เซีย vs พรมขนสัตว์ — ตัวไหนเหมาะกับบ้าน",
      excerpt:
        "Investment piece ที่อยู่หลายชั่วอายุคน vs item ที่เปลี่ยนเทรนด์ได้",
      body:
        "พรมเปอร์เซียแท้ — handknotted ในอิหร่าน คนทอใช้เวลา 6-18 เดือนต่อผืน อายุการใช้งาน 80+ ปี ราคาเริ่ม 80,000 บาทขึ้นไป\n\n" +
        "พรมขนสัตว์ทั่วไป — machine-made คุณภาพดี อายุ 8-15 ปี ราคา 10,000-30,000 บาท\n\n" +
        "เลือกพรมเปอร์เซียถ้าจะใช้เป็น investment + heirloom — เลือก wool rug ทั่วไปถ้าต้องการตามเทรนด์ได้ ไม่ต้องเสียดายเมื่อเปลี่ยน",
      coverImage: UNSPLASH("photo-1530603907829-659ab4d09b5b"),
      layout: "editorial",
      categorySlug: "decor",
      order: 5,
    },
    {
      slug: "statement-lighting-tricks",
      title: "โคมไฟ statement piece — เคล็ดลับให้ห้องดูแพงขึ้น",
      excerpt: "โคมไฟไม่ใช่แค่ส่องสว่าง — มันคือ jewelry ของห้อง",
      body:
        "Statement light fixture สามารถ transform ห้องได้มากกว่าเฟอร์นิเจอร์ใหญ่หลายชิ้นรวมกัน — เคล็ดลับใช้ให้ได้ผล:\n\n" +
        "ขนาด: เส้นผ่านศูนย์กลางโคม = ความยาว+ความกว้างห้อง (เป็นนิ้ว) เช่น ห้อง 12×14 ฟุต = โคม 26 นิ้ว\n\n" +
        "ความสูงห้อยจากเพดาน: 75-90 ซม. เหนือโต๊ะอาหาร, 200+ ซม. เหนือพื้นในห้องนั่งเล่น\n\n" +
        "ผสมวัสดุ: โคมโลหะ + เฟอร์นิเจอร์ไม้ + ผนังสีกลาง = balanced. ห้ามทุกอย่างเป็น metal",
      coverImage: UNSPLASH("photo-1513161455079-7dc1de15ef3e"),
      layout: "gallery",
      categorySlug: "decor",
      order: 6,
    },
    {
      slug: "eames-chair-real-vs-replica",
      title: "เก้าอี้ Eames — ของแท้ vs replica คุ้มไหม",
      excerpt:
        "ของแท้ราคา 6 หมื่น replica คุณภาพดี 8,000 — ความต่างจริงๆ คืออะไร",
      body:
        "Eames Lounge Chair ของแท้จาก Herman Miller / Vitra — palisander หรือ walnut veneer แท้, ฟองน้ำ multi-layer, หนัง grade A, รับประกัน 12 ปี\n\n" +
        "Replica คุณภาพดี — wood-grain laminate, fauxleather, รับประกัน 1-2 ปี (ถ้ามี)\n\n" +
        "หลังใช้งานจริง 3 ปี ของแท้ยังนุ่มเหมือนวันแรก replica เริ่มยุ่นและหนังเริ่มลอก — แต่ replica ก็ ‘สวย’ พอที่จะเห็นว่าเป็นรุ่นนี้\n\n" +
        "คำแนะนำ: ของแท้สำหรับคนที่ตั้งใจอยู่ในบ้านนี้ 10+ ปี และยอมจ่ายเพื่อ heirloom",
      coverImage: UNSPLASH("photo-1567538096630-e0c55bd6374c"),
      layout: "bold",
      categorySlug: "office",
      order: 7,
    },
    {
      slug: "hotel-grade-bedroom-styles",
      title: "ห้องนอน 4 สไตล์ระดับ Hotel — Reference สำหรับ home",
      excerpt:
        "ทำไมห้องโรงแรมดี ๆ ถึงรู้สึกพิเศษ — และวิธี recreate ที่บ้าน",
      body:
        "หลังพักโรงแรม 5 ดาว 60+ โรงในเอเชีย เราเก็บ pattern ที่ใช้ซ้ำๆ:\n\n" +
        "1. White Boutique (เช่น Aman) — สีขาวบริสุทธิ์ ผ้าลินิน วัสดุธรรมชาติ ไม่มีอะไรเด่นเกินไป\n\n" +
        "2. Dark Glamour (เช่น The Standard) — ไม้เข้ม พรมหนา หนังแท้ ไฟอบอุ่น\n\n" +
        "3. Modern Japanese (เช่น Aman Kyoto) — เส้นนิ่ง โทนหินและไม้อ่อน เปิดสู่ธรรมชาติ\n\n" +
        "4. Tropical Modern (เช่น Six Senses) — ไม้สีอ่อน rattan natural fiber ผ้าโปร่ง\n\n" +
        "ทุก style ใช้หลักการเดียว — น้อย แต่ทุกชิ้นมีคุณภาพ",
      coverImage: UNSPLASH("photo-1631049307264-da0ec9d70304"),
      layout: "magazine",
      categorySlug: "bedroom",
      order: 8,
    },
    {
      slug: "5-common-furniture-woods",
      title: "5 วัสดุไม้ที่ใช้บ่อยในเฟอร์นิเจอร์ไทย",
      excerpt: "ไม้แต่ละชนิดบอกอะไรเรื่องอายุการใช้งานและราคา",
      body:
        "1. ไม้สัก (Teak) — ทนน้ำ ทนแมลง อายุ 50+ ปี ราคาสูงสุด เหมาะกับเฟอร์นิเจอร์ outdoor และของที่ตั้งใจให้ใช้นาน\n\n" +
        "2. ไม้โอ๊ก (Oak) — แข็งแรง grain สวย ราคากลาง-สูง เหมาะกับเฟอร์นิเจอร์ใช้งานหนัก (โต๊ะอาหาร เตียง)\n\n" +
        "3. ไม้สนแดง (Pine) — น้ำหนักเบา ราคาถูก ใช้กับเฟอร์นิเจอร์ Scandinavian แต่ขีดข่วนง่าย\n\n" +
        "4. ไม้แอช (Ash) — ยืดหยุ่น ใช้ทำเก้าอี้ที่ต้องโค้ง\n\n" +
        "5. ไม้ engineered wood (MDF/Plywood) — ราคาถูก แต่ห้ามใกล้น้ำ อายุ 5-8 ปี",
      coverImage: UNSPLASH("photo-1581539250439-c96689b516dd"),
      layout: "technical",
      categorySlug: "decor",
      order: 9,
    },
  ],

  timeline: [
    {
      date: "2015",
      title: "เปิด studio ในบ้าน",
      description: "ทีม 2 คน เริ่มเขียนบล็อกเรื่องเฟอร์นิเจอร์ในไทย",
      order: 0,
    },
    {
      date: "2018",
      title: "ร่วมงานกับร้านเฟอร์นิเจอร์ 20 ร้าน",
      description: "เริ่ม content partnership ด้วยการรีวิวที่ตรงไปตรงมา",
      order: 1,
    },
    {
      date: "2021",
      title: "เปิดบริการให้คำปรึกษา interior",
      description: "ทีมขยายเป็น 5 คน รับงาน residential design 30+ โครงการ/ปี",
      imageUrl: UNSPLASH("photo-1555041469-a586c61ea9bc", 900),
      order: 2,
    },
    {
      date: "Q3 2024",
      title: "ครบ 500 บทความ",
      description: "ครอบคลุมทุกห้องในบ้าน และ vendor ในตลาดไทย 80%",
      order: 3,
    },
    {
      date: "2026",
      title: "เปิด showroom สำหรับ wholesale partners",
      description: "พื้นที่ 200 ตร.ม. ในย่านสุขุมวิท แสดงผลงาน + ทำ workshop",
      order: 4,
    },
  ],

  openPositions: [
    {
      id: "interior-designer",
      title: "Interior Designer",
      team: "Design",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ออกแบบ residential + commercial space ต้องเก่ง AutoCAD + SketchUp + เข้าใจวัสดุไทย",
    },
    {
      id: "furniture-buyer",
      title: "Furniture Buyer / Curator",
      team: "Sourcing",
      type: "Full-time",
      location: "Bangkok / Travel",
      summary:
        "ตามเทรนด์เฟอร์นิเจอร์โลก เจรจาราคา และคัดของจาก fair / supplier ในไทยและต่างประเทศ",
    },
    {
      id: "visual-merchandiser",
      title: "Visual Merchandiser",
      team: "Showroom",
      type: "Full-time",
      location: "Showroom, Sukhumvit",
      summary:
        "ออกแบบ display ใน showroom — เปลี่ยน mood ทุก 6 สัปดาห์ ให้ลูกค้าเห็นไอเดียจัดบ้าน",
    },
    {
      id: "sales-consultant",
      title: "Sales Consultant",
      team: "Sales",
      type: "Full-time",
      location: "Showroom",
      summary:
        "ช่วยลูกค้าเลือกเฟอร์นิเจอร์ — ฟังโจทย์ ดู floor plan ของลูกค้า แนะนำชุดที่เหมาะ",
    },
    {
      id: "showroom-manager",
      title: "Showroom Manager",
      team: "Operations",
      type: "Full-time",
      location: "Showroom",
      summary:
        "คุมทีม sales 6 คน + ดูแล logistics จัดส่ง + ติดตาม after-sales service",
    },
  ],

  navItems: [
    { label: "Home", kind: "page", target: "/", order: 0 },
    {
      label: "Rooms",
      kind: "page",
      target: "",
      order: 1,
      children: [
        { label: "ห้องนั่งเล่น", kind: "category", target: "living", order: 0 },
        { label: "ห้องนอน", kind: "category", target: "bedroom", order: 1 },
        { label: "ครัว", kind: "category", target: "kitchen", order: 2 },
        { label: "ห้องทำงาน", kind: "category", target: "office", order: 3 },
      ],
    },
    { label: "Decor", kind: "category", target: "decor", order: 2 },
    { label: "Articles", kind: "page", target: "/articles", order: 3 },
    { label: "Careers", kind: "page", target: "/careers", order: 4 },
    { label: "About", kind: "page", target: "/about", order: 5 },
  ],
};
