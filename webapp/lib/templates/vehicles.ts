import type { SiteTemplate } from "./types";

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vehiclesTemplate: SiteTemplate = {
  id: "vehicles",
  name: "Motorworks",
  blurb: "รถยนต์ + จักรยานยนต์ — รีวิว แต่ง ขับขี่",
  glyph: "◐",
  themeId: "gallery",
  siteName: "Motorworks",
  siteDescription:
    "เว็บไซต์รีวิวรถยนต์ จักรยานยนต์ ของแต่ง และเรื่องราวบนถนน — เขียนโดยคนที่ขี่จริง ขับจริง",

  about: {
    heading: "Motorworks",
    subheading:
      "ทีมรีวิวอิสระที่ขี่จริงทุกคัน — ไม่รับเงินจากค่าย แค่บอกความรู้สึกที่ได้ลองจริงๆ",
    body:
      "เริ่มจากเพื่อน 3 คนที่ชอบรถและจักรยานยนต์มาตั้งแต่เรียนวิศวะ ตอนนี้เราเขียนรีวิวให้คนไทยอ่านมา 8 ปี\n\n" +
      "ทุกชิ้นที่เผยแพร่บนเว็บนี้ ทีมต้องได้สัมผัสจริงอย่างน้อย 500 กิโลเมตร — สถิตินั้นคือกติกาภายในของเราที่ตั้งมาเองเพื่อรักษาคุณภาพ\n\n" +
      "ไม่ได้รับสปอนเซอร์จากบริษัทรถ ค่าใช้จ่ายของทีมมาจากค่า affiliate ของอุปกรณ์แต่งและประกันรถเท่านั้น",
    heroImage: UNSPLASH("photo-1503376780353-7e6692767b70"),
    layout: "magazine",
  },

  categories: [
    {
      slug: "cars",
      name: "รถยนต์",
      description: "ข่าวสาร รีวิว เปรียบเทียบรถยนต์ ทั้ง EV และ ICE",
      coverImage: UNSPLASH("photo-1492144534655-ae79c964c9d7"),
      order: 0,
    },
    {
      slug: "motorcycles",
      name: "จักรยานยนต์",
      description: "Sport bike, naked, café racer, scooter — ทดสอบและรีวิว",
      coverImage: UNSPLASH("photo-1568772585407-9361f9bf3a87"),
      order: 1,
    },
    {
      slug: "reviews",
      name: "รีวิวระยะยาว",
      description: "ใช้งานจริง 6 เดือนขึ้น สรุปข้อดี-ข้อเสียที่ไม่เห็นในรีวิวเปิดตัว",
      coverImage: UNSPLASH("photo-1494976388531-d1058494cdd8"),
      order: 2,
    },
    {
      slug: "modifications",
      name: "แต่งซิ่ง",
      description: "ยาง ล้อ ระบบดูดอากาศ ECU — เรื่องช่างที่อ่านสนุก",
      coverImage: UNSPLASH("photo-1597007030739-6d2e7172ee72"),
      order: 3,
    },
    {
      slug: "safety",
      name: "ขับขี่ปลอดภัย",
      description: "หมวก เกียร์ ท่าทาง เทคนิคหลบหลีก — เนื้อหาที่อยากให้พ่อแม่ผู้ปกครองอ่าน",
      coverImage: UNSPLASH("photo-1571068316344-75bc76f77890"),
      order: 4,
    },
  ],

  articles: [
    {
      slug: "honda-cb650r-2025-review",
      title: "รีวิว Honda CB650R 2025 — naked bike ที่เก่งกว่าราคา",
      excerpt:
        "ขี่ 1,200 กม. ใน 3 สัปดาห์ ทั้งซิตี้และทางยาว สรุปจุดที่ทำให้ยกให้เป็น naked ที่ดีที่สุดในช่วงราคานี้",
      body:
        "หลังขี่ Honda CB650R 2025 มา 1,200 กม. ภายในเวลา 3 สัปดาห์ ทีมเราขอสรุปว่าเครื่อง 4 สูบนี้ยังคงเป็น naked bike ที่ตอบโจทย์คนไทยส่วนใหญ่ได้ดีที่สุดในช่วงราคา 3 แสนกลางๆ\n\n" +
        "จุดที่เปลี่ยนชัดเจนจากรุ่นปี 2024 คือระบบ throttle-by-wire ที่ smooth ขึ้นแบบรู้สึกได้ตั้งแต่ปั๊มแรก และ traction control ที่เปิด-ปิดได้จากแฮนด์ซ้ายไม่ต้องเข้าเมนู\n\n" +
        "ข้อสังเกตที่ยังต้องทน — เบาะรุ่นสตาร์ทยังแข็งเกินไปสำหรับทริปเกิน 4 ชั่วโมง แนะนำเปลี่ยน aftermarket ทันที",
      coverImage: UNSPLASH("photo-1558981403-c5f9899a28bc"),
      layout: "magazine",
      categorySlug: "motorcycles",
      order: 0,
    },
    {
      slug: "toyota-corolla-cross-gr-sport-longterm",
      title: "Toyota Corolla Cross GR Sport — รายงานหลังขับ 5,000 กม.",
      excerpt: "ครอบครัวจริง บรรทุกจริง ขับขึ้นเขาจริง — ฟีลลิ่ง GR สมราคาที่บวกมาไหม?",
      body:
        "เราหยิบ Corolla Cross GR Sport มาใช้แทนรถบ้านจริงๆ เป็นเวลา 3 เดือน ใช้ไปงาน วิ่งทริปครอบครัว ขับขึ้นเขาที่ปายและภูเก็ต รวมระยะ 5,200 กม.\n\n" +
        "ช่วงล่างที่ปรับใหม่ของ GR Sport แข็งกว่ารุ่นปกติพอสมควร — ในทางตรงคือดีกว่า แต่ทางขรุขระในเมืองช่วงแรกเริ่มรู้สึกว่าเกินไปสำหรับครอบครัวที่มีเด็กเล็ก\n\n" +
        "อัตราสิ้นเปลืองเฉลี่ย 16.8 km/L บนการขับผสม city + highway ในไทย ดีกว่าตัวเลขในเอกสารโรงงานเล็กน้อย",
      coverImage: UNSPLASH("photo-1606664515524-ed2f786a0bd6"),
      layout: "classic",
      categorySlug: "reviews",
      order: 1,
    },
    {
      slug: "long-trip-essentials",
      title: "5 อุปกรณ์เสริมที่ควรมีก่อนทริปยาว",
      excerpt:
        "ก่อนออกทริป 1,000+ กม. นี่คือลิสต์ที่ทีมเราเช็คทุกครั้ง — เคยลืมแล้วเสียดาย",
      body:
        "หลังขี่ทริปยาวมานับสิบครั้ง ลิสต์นี้คือสิ่งที่เราลืมไม่ได้:\n\n" +
        "1. ปั๊มลมไฟฟ้าพกพา — แบตในตัว ใช้ได้ทั้งรถยนต์และจักรยานยนต์\n" +
        "2. ชุดยางพิเศษ patch kit — แก้ยางแบนชั่วคราวริมถนนได้ภายใน 10 นาที\n" +
        "3. เครื่องสตาร์ทแบตสำรอง (jump starter) — แบตหมดเป็น emergency ที่พบบ่อยที่สุด\n" +
        "4. ผ้าห่ม emergency พับเก็บ + น้ำ 2 ลิตร — ในกรณีต้องรอช่างนาน\n" +
        "5. กล้อง dashcam + back-up battery — เป็นพยานหลักฐานถ้ามีเหตุการณ์ที่ไม่คาดคิด\n\n" +
        "ทั้งหมดนี้รวมไม่ถึง 5,000 บาท แต่ช่วยชีวิตได้หลายครั้ง",
      coverImage: UNSPLASH("photo-1492144534655-ae79c964c9d7"),
      layout: "sidebar",
      categorySlug: "safety",
      order: 2,
    },
    {
      slug: "byd-atto-3-family-review",
      title: "BYD Atto 3 — รถไฟฟ้าสำหรับครอบครัวเอเชีย",
      excerpt: "EV ราคาต่ำกว่าล้านที่บรรทุกเด็ก 2 คนได้สบาย — แต่มีจุดต้องระวัง 3 ข้อ",
      body:
        "BYD Atto 3 กลายเป็น EV ที่ขายดีที่สุดในไทยมาเกือบ 2 ปีแล้ว และเราเพิ่งได้ใช้งานจริงในชีวิตครอบครัวเป็นเวลา 4 เดือน\n\n" +
        "Charging behavior คือจุดเด่นที่สุด — DC fast charge ของ Atto 3 ทำให้เราเดินทางกรุงเทพ-โคราชได้สบายโดยไม่ต้องวางแผนนาน\n\n" +
        "จุดต้องระวัง: 1) battery thermal management ตอนหน้าร้อนไทยลด range ลง 12-15% 2) infotainment touchscreen แม้สวยแต่ตอบสนองช้าในเดือนที่ 3 เป็นต้นไป 3) interior trim บางส่วนเริ่มเหินตามอายุการใช้งาน",
      coverImage: UNSPLASH("photo-1593941707882-a5bba14938c7"),
      layout: "wide",
      categorySlug: "cars",
      order: 3,
    },
    {
      slug: "retro-90s-style-build",
      title: "เทคนิคแต่งรถ retro 90s แบบไม่เพี้ยน",
      excerpt:
        "neo-retro ที่ดีต้องอ้างอิงยุคของมันให้แม่น — ตัวอย่าง 4 จุดที่ทีมเราใช้ในการ build",
      body:
        "การแต่งรถ retro มักออกมาเพี้ยนเพราะคนแต่งไม่ได้อยู่ในยุคนั้นจริง — ผลคือไม่ใช่ 90s หรือ 2010s ที่พยายามดูเก่า\n\n" +
        "หลักง่ายๆ ที่เราใช้: ใช้สี enamel ที่ผลิตในยุคนั้นจริงๆ (Pantone 90s palette), ฟอนต์ลายเส้นแบบ helvetica narrow, ล้อสปกแบบ 5 ดาวเงา ไม่ใช่ดำด้าน, ที่จับประตู chrome ของแท้แบบ recycle จากซากรถ\n\n" +
        "ผลลัพธ์: คนยุค 90s ที่เห็นรถจะมองด้วยรอยยิ้มเพราะมัน 'ใช่' ส่วนคนรุ่นใหม่จะคิดว่าเก๋แต่ก็บอกไม่ถูกว่าทำไม",
      coverImage: UNSPLASH("photo-1605559424843-9e4c228bf1c0"),
      layout: "editorial",
      categorySlug: "modifications",
      order: 4,
    },
    {
      slug: "xsr700-vs-z650rs",
      title: "Yamaha XSR700 vs Kawasaki Z650RS — naked retro สองเจ้า",
      excerpt: "ขี่สองคันบนเส้นทางเดียวกัน 800 กม. แต่ละคันเด่นเรื่องอะไร และเหมาะกับคนแบบไหน",
      body:
        "ทั้งคู่เป็น naked retro สอง สูบในช่วงราคาเดียวกัน แต่ feel ต่างกันมาก\n\n" +
        "XSR700 — เครื่อง CP2 ของ Yamaha torque แน่นตั้งแต่รอบกลาง สนุกตอนซิ่งโค้ง เบาะ rider ออกแบบให้คนสูง 175+ ขึ้นไปสบาย\n\n" +
        "Z650RS — engine 4 สูบ smooth กว่ามาก เสียงเงียบในเมือง เหมาะกับคนที่ขับ daily ในกรุงเทพ ไม่ค่อยออกทริปยาว\n\n" +
        "สรุป: XSR700 สำหรับคนชอบ ride, Z650RS สำหรับคนชอบ cruise",
      coverImage: UNSPLASH("photo-1611241893603-3c359704e0ee"),
      layout: "gallery",
      categorySlug: "motorcycles",
      order: 5,
    },
    {
      slug: "helmet-tis-standard-guide",
      title: "คู่มือเลือกหมวกกันน็อก ตามมาตรฐาน TIS",
      excerpt: "TIS 369-2557 vs ECE 22.06 vs DOT — ต่างกันยังไง คนใช้รถในไทยควรเลือกแบบไหน",
      body:
        "มาตรฐานหมวกกันน็อกที่ใช้ในไทย:\n\n" +
        "- TIS 369-2557 (มอก. ไทย) — บังคับขั้นต่ำ แต่ไม่ละเอียดเท่าฝั่งยุโรป\n" +
        "- ECE 22.06 (ยุโรปใหม่ 2022) — มาตรฐานสูงสุดในตลาด เทียบเท่ารถ MotoGP ใช้\n" +
        "- DOT (อเมริกา) — ตรวจสุ่มไม่ทุกใบ คุณภาพไม่สม่ำเสมอ\n" +
        "- SNELL (มาตรฐานเอกชนของอเมริกา) — เข้มข้นที่สุด นิยมใน racing\n\n" +
        "คำแนะนำ: ใช้หมวกที่มี ECE 22.06 ถ้าซื้อใหม่ในปี 2025 — ทดสอบครอบคลุมกว่า TIS หลายเท่า ราคาเริ่ม 4,000 บาทเท่านั้น",
      coverImage: UNSPLASH("photo-1517825738774-7de9363ef735"),
      layout: "technical",
      categorySlug: "safety",
      order: 6,
    },
    {
      slug: "drag-race-season-opener-2026",
      title: "Drag race เลกแรกของฤดูกาล 2026",
      excerpt:
        "การแข่งขัน Bangkok International Drag 2026 — สรุปผลทุกคลาส + รถที่น่าจับตา",
      body:
        "ฤดูกาล 2026 เปิดอย่างยิ่งใหญ่ที่สนาม Bangkok International Drag เมื่อสุดสัปดาห์ที่ผ่านมา\n\n" +
        "คลาส Pro Modified — Nissan GT-R R35 ของทีม Speedstars ทำสถิติ 8.41 วินาทีในรอบชิง ทุบสถิติเดิมของสนามที่ทำไว้เมื่อปี 2023\n\n" +
        "คลาส Street — Honda Civic FK8 ของทีม Tilo Racing คว้าชัยด้วย 11.92 วินาที — ฉบับ daily driver ที่ขับมาแข่งจริงๆ\n\n" +
        "รถที่น่าจับตาสำหรับเลกถัดไป: Toyota Supra A90 ของทีม Bangkok Roller ที่กำลังพัฒนาระบบ twin-turbo รุ่นใหม่",
      coverImage: UNSPLASH("photo-1493238792000-8113da705763"),
      layout: "bold",
      categorySlug: "reviews",
      order: 7,
    },
    {
      slug: "used-car-7-checks",
      title: "รถมือสอง — 7 จุดที่ต้องเช็คก่อนซื้อ",
      excerpt: "checklist ที่ใช้กับลูกค้าจริงในร้านของเพื่อน — เซฟเงินได้หลายแสนต่อคัน",
      body:
        "1. เช็คเลขไมล์กับเลข VIN ใน chassis — ต้องตรงกัน\n" +
        "2. ดูใต้ท้องรถหา rust กับร่องรอย accident — ใช้กระจกพับ\n" +
        "3. สตาร์ทเครื่องเย็น — ฟังเสียง valve clatter ในนาทีแรก\n" +
        "4. ทดสอบ AC ทั้ง 4 ทิศทาง ในจังหวะร้อนสุดของวัน\n" +
        "5. ตรวจ tire wear pattern — ผิดด้านบอก alignment เพี้ยน\n" +
        "6. เช็คไฟทุกดวง รวม brake light + reverse + interior\n" +
        "7. ขอเอกสารประวัติ service — ถ้าไม่มีอย่าซื้อ",
      coverImage: UNSPLASH("photo-1494976388531-d1058494cdd8"),
      layout: "compact",
      categorySlug: "cars",
      order: 8,
    },
    {
      slug: "phuket-chiangmai-2400km",
      title: "Phuket → Chiang Mai 2,400 กม. บน Triumph Tiger 900",
      excerpt: "ทริปเหนือ-ใต้ใน 6 วัน เรียนรู้อะไรจากการนั่งบนเบาะวันละ 8 ชั่วโมง",
      body:
        "เดือนตุลาคมเราออกทริปจาก Phuket ขึ้น Chiang Mai โดยใช้เส้นทาง 4 หลักเป็นส่วนใหญ่ — รวม 2,400 กม. ใน 6 วัน\n\n" +
        "Tiger 900 ที่ออกแบบเป็น adventure bike พิสูจน์ตัวเองในทุกระยะ — เบาะของรุ่น GT Pro ปี 2025 สบายมากแม้ขี่วันละ 350+ กม.\n\n" +
        "บทเรียนสำคัญ: ออกเช้า, พักทุก 90 นาที, ดื่มน้ำมากกว่าที่คิด — และพักให้พอในแต่ละคืน รถกับคนต้องพร้อมเท่ากัน",
      coverImage: UNSPLASH("photo-1568772585407-9361f9bf3a87"),
      layout: "gallery",
      categorySlug: "reviews",
      order: 9,
    },
  ],

  timeline: [
    {
      date: "2017",
      title: "เริ่มเขียน blog ใน Facebook",
      description: "3 คนเขียน weekly review ในเพจ Facebook ของตัวเอง",
      order: 0,
    },
    {
      date: "2019",
      title: "เปิดเว็บแยก",
      description: "ย้ายจาก FB Page มาเว็บไซต์เพื่อให้เก็บ archive ได้ยาวๆ",
      order: 1,
    },
    {
      date: "2021",
      title: "ผ่านระยะการเข้าถึง 100k pageviews/เดือน",
      description: "ทีมโตเป็น 8 คน เริ่มทำรีวิวยาวพิเศษ (ขับเกิน 5,000 กม.)",
      imageUrl: UNSPLASH("photo-1492144534655-ae79c964c9d7", 900),
      order: 2,
    },
    {
      date: "2023",
      title: "ครบ 200 รีวิว",
      description: "นับรวม รถยนต์ จักรยานยนต์ และ EV ตั้งแต่ปี 2017",
      order: 3,
    },
    {
      date: "2026",
      title: "เริ่มผลิต video review",
      description: "ขยายเข้า YouTube + TikTok ด้วยทีม producer 2 คน",
      order: 4,
    },
  ],

  openPositions: [
    {
      id: "senior-motorcycle-reviewer",
      title: "Senior Motorcycle Reviewer",
      team: "Editorial",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ขับและรีวิว motorcycle ทุกระดับ — ตั้งแต่ scooter จนถึง superbike เขียนบทความระยะยาว 5,000+ คำ",
    },
    {
      id: "automotive-video-producer",
      title: "Automotive Video Producer",
      team: "Video",
      type: "Full-time",
      location: "Bangkok",
      summary:
        "ถ่าย-ตัดต่อ video รีวิวรถยนต์/จักรยานยนต์ สำหรับ YouTube + TikTok กล้องเลือกได้ตามสไตล์",
    },
    {
      id: "test-rider-driver",
      title: "Test Rider / Driver",
      team: "Editorial",
      type: "Contract",
      location: "Bangkok / Track",
      summary:
        "มีใบขับขี่ครบ + ประสบการณ์ขับ track พา test รถใหม่ก่อนทีมรีวิวเขียน",
    },
    {
      id: "garage-technician",
      title: "Garage Technician",
      team: "Workshop",
      type: "Full-time",
      location: "Workshop, Bangkok",
      summary:
        "ดูแล + เตรียมรถทดสอบ มี certificate ช่างยนต์ + เคยทำที่ dealer อย่างน้อย 3 ปี",
    },
    {
      id: "content-editor",
      title: "Content Editor",
      team: "Editorial",
      type: "Full-time",
      location: "Bangkok / Remote",
      summary:
        "Edit บทความก่อนเผยแพร่ ตรวจ fact + flow + tone ของ Motorworks สนใจรถเป็นพิเศษ",
    },
  ],

  navItems: [
    { label: "Home", kind: "page", target: "/", order: 0 },
    {
      label: "Reviews",
      kind: "page",
      target: "/articles",
      order: 1,
      children: [
        { label: "รถยนต์", kind: "category", target: "cars", order: 0 },
        { label: "จักรยานยนต์", kind: "category", target: "motorcycles", order: 1 },
        { label: "รีวิวระยะยาว", kind: "category", target: "reviews", order: 2 },
      ],
    },
    {
      label: "Garage",
      kind: "page",
      target: "",
      order: 2,
      children: [
        { label: "แต่งซิ่ง", kind: "category", target: "modifications", order: 0 },
        { label: "ขับขี่ปลอดภัย", kind: "category", target: "safety", order: 1 },
      ],
    },
    { label: "Careers", kind: "page", target: "/careers", order: 3 },
    { label: "About", kind: "page", target: "/about", order: 4 },
  ],
};
