/**
 * Seed script — creates the first administrator + seeds the About page with
 * city-art-style mock content (articles + timeline) so /about isn't empty
 * out of the box.
 *
 * Run with:  npm run db:seed
 *
 * Safe to re-run: the admin user is only created if missing, and About content
 * is only inserted if the corresponding tables are empty.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ─── About page + content ─── */

const ABOUT_PAGE = {
  heading: "City Art",
  subheading:
    "สตูดิโอออกแบบและผลิตงานศิลปะครบวงจร — สำหรับ event, brand experience และ corporate art ในประเทศไทย",
  body:
    "เราเชื่อว่าศิลปะคือเครื่องมือเล่าเรื่องที่ทรงพลังที่สุด\n" +
    "ทีมของเราประกอบด้วย art director, นักออกแบบ 3D, วิศวกรโครงสร้าง และช่างฝีมือที่ทำงานร่วมกันตั้งแต่ขั้น concept จนถึงหน้างานจริง\n\n" +
    "ตลอดสิบกว่าปีที่ผ่านมา เราได้ออกแบบและผลิตงานให้แบรนด์ชั้นนำมากกว่า 200 แบรนด์ — ตั้งแต่ pop-up exhibition, sculpture สำหรับ corporate lobby, ไปจนถึง stage design ของ festival ขนาดใหญ่\n\n" +
    "เป้าหมายของเราคือทำให้ทุกพื้นที่ที่คุณก้าวเข้าไปกลายเป็นพื้นที่ที่ ‘เล่าเรื่องได้’",
};

const ARTICLES: Array<{
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  order: number;
}> = [
  {
    title: "เบื้องหลังงาน Brand Experience ขนาด 1,200 ตร.ม.",
    excerpt:
      "พาทัวร์งาน installation ขนาดใหญ่ที่ใช้เวลาผลิตเพียง 28 วัน — ตั้งแต่ concept board จนถึงวันเปิดงาน",
    body:
      "โจทย์ที่เราได้รับคือเปลี่ยน warehouse ขนาด 1,200 ตร.ม. ให้กลายเป็น immersive space สำหรับการเปิดตัวสินค้าใหม่\n\n" +
      "ทีม 3D ของเราใช้ Blender ขึ้น mockup ในวันแรก แล้วทำงานคู่ขนานกับทีมโครงสร้างเพื่อให้ทุก element สามารถผลิตและขนเข้าหน้างานได้ทันเวลา ใช้วัสดุรีไซเคิลกว่า 60% ของทั้งงาน\n\n" +
      "บทเรียนสำคัญคือ — ยิ่งทำงานเร็ว ยิ่งต้องสื่อสารช้าและชัด",
    imageUrl:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80&auto=format&fit=crop",
    order: 0,
  },
  {
    title: "Sculpture สำหรับ Corporate Lobby — กระบวนการที่อยู่หลังโลหะ",
    excerpt:
      "งาน stainless steel สูง 6 เมตรชิ้นนี้ใช้เวลาออกแบบนานกว่าผลิตเกือบสองเท่า",
    body:
      "เราเริ่มจากการศึกษา DNA ของแบรนด์ — สีหลัก รูปทรงที่ปรากฏใน logo และ texture ที่บริษัทเลือกใช้ใน interior\n\n" +
      "ทีม structural engineer เข้ามาช่วยตั้งแต่ช่วง sketch เพื่อให้แน่ใจว่า curve ที่นักออกแบบวาดสามารถยืนได้จริงโดยไม่ต้องใช้โครงเสริมที่จะทำลายความสวยงาม\n\n" +
      "ผลลัพธ์คือ sculpture ที่ทั้งสะท้อนตัวตนของแบรนด์และใช้งานเป็นจุดถ่ายภาพให้พนักงานได้ทุกวัน",
    imageUrl:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80&auto=format&fit=crop",
    order: 1,
  },
  {
    title: "ทำไม Pop-up ที่ดีต้องเริ่มจาก ‘เรื่องเล่า’ ไม่ใช่ ‘การตกแต่ง’",
    excerpt:
      "บทเรียนจากงาน 47 โครงการในปี 2025 — ทำไมงาน installation ส่วนใหญ่ถึงน่าเบื่อ แม้จะใช้งบสูง",
    body:
      "เรามักได้รับโจทย์ในรูปแบบ ‘อยากได้บูธสวย ๆ’ แต่บูธสวยที่ขาด narrative มักจบลงด้วยการเป็น backdrop ของรูปถ่ายเท่านั้น\n\n" +
      "วิธีที่เราใช้คือ workshop กับทีมการตลาดของลูกค้าก่อนเริ่มออกแบบจริง 1 วัน — ขุดให้เจอว่าแบรนด์อยากให้ผู้ชมรู้สึกอย่างไรเมื่อก้าวออกจากงาน แล้วค่อยตามด้วยรูปทรง วัสดุ แสง และเส้นทางเดิน\n\n" +
      "งานที่เริ่มจาก ‘ความรู้สึก’ ก่อน ‘หน้าตา’ มักได้ผลลัพธ์ที่จดจำได้นานกว่ามาก",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
    order: 2,
  },
  {
    title: "เปิดสตูดิโอใหม่ — โรงผลิตในเครือพื้นที่ 2,400 ตร.ม.",
    excerpt:
      "ลดเวลาผลิตเฉลี่ยลง 35% ด้วยโรงงานในมือตัวเองที่ครบเครื่องตั้งแต่งานไม้ งานเหล็ก ถึง CNC",
    body:
      "ตลอดหลายปีที่ผ่านมา เราพึ่งพา supplier ภายนอกเป็นหลัก ซึ่งทำให้คอนโทรลคุณภาพและไทม์ไลน์ทำได้จำกัด\n\n" +
      "โรงผลิตใหม่ของเรามีทั้งห้องเก็บวัสดุ ห้อง spray booth, CNC ขนาด 1.5 x 3 เมตร, และโซน assembly ที่รองรับงานสูงถึง 8 เมตร\n\n" +
      "ผลคือเรารับงานที่ ‘ต้องเสร็จเร็ว’ และ ‘ต้องเนี้ยบมาก’ ได้พร้อมกันอย่างมั่นใจ",
    imageUrl:
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80&auto=format&fit=crop",
    order: 3,
  },
  {
    title: "ทำงานกับศิลปินรุ่นใหม่ — โครงการ Artist Residency ปี 2026",
    excerpt:
      "เปิดพื้นที่ให้ศิลปินรุ่นใหม่ 6 คนเข้ามาทดลองวัสดุและกระบวนการของเราเป็นเวลา 3 เดือน",
    body:
      "เราเริ่มโครงการ Residency เพราะเชื่อว่าศิลปะที่ดีต้องไม่ปิดตัวเองอยู่ในกล่อง\n\n" +
      "ศิลปินที่ได้รับเลือกจะได้ใช้โรงผลิต ทีม technician และวัสดุของเราในการทดลองโดยไม่มีโจทย์จากลูกค้า — ผลงานจัดแสดงปลายปีในรูปแบบ open studio\n\n" +
      "เปิดรับสมัครรอบ 2 ในเดือนสิงหาคม 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1531731314256-7610adda4a92?w=1200&q=80&auto=format&fit=crop",
    order: 4,
  },
  {
    title: "Sustainability ในงาน Event — ไม่ใช่แค่ใช้ไม้รีไซเคิล",
    excerpt:
      "ทำไม ‘ความยั่งยืน’ ในงาน event ต้องเริ่มจากการออกแบบให้ถอดประกอบและใช้ซ้ำได้ตั้งแต่ต้น",
    body:
      "งาน event โดยธรรมชาติคืออุตสาหกรรมที่สร้างของเหลือทิ้งจำนวนมาก — บูธจำนวนมหาศาลที่กลายเป็นขยะหลังจัดงานเสร็จเพียงไม่กี่วัน\n\n" +
      "ทีมของเรานำหลัก modular design เข้ามาใช้กับงานเกือบทั้งหมด: ทุกชิ้นถอดประกอบได้ ทุก connector เป็น standard เพื่อให้นำกลับมา assemble ใหม่ในงานอื่นได้ในเวลาเพียงครึ่งวัน\n\n" +
      "ในปี 2025 เราสามารถนำชิ้นส่วนกลับมาใช้ใหม่ได้ถึง 64% โดย น้ำหนัก",
    imageUrl:
      "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&q=80&auto=format&fit=crop",
    order: 5,
  },
];

const TIMELINE: Array<{
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}> = [
  {
    date: "2012",
    title: "ก่อตั้ง City Art",
    description:
      "เริ่มต้นจากทีมออกแบบ 4 คนในออฟฟิศย่านลาดพร้าว — รับงาน window display ให้ห้างสรรพสินค้าและร้านค้าใน community mall",
    order: 0,
  },
  {
    date: "2014",
    title: "งาน Installation แรกในระดับ exhibition",
    description:
      "ออกแบบและผลิตงาน main installation สำหรับ design week ครั้งแรก — ใช้วัสดุไม้รีไซเคิลทั้งหมด",
    imageUrl:
      "https://images.unsplash.com/photo-1545987796-200677ee1011?w=900&q=80&auto=format&fit=crop",
    order: 1,
  },
  {
    date: "2017",
    title: "เปิดโรงผลิตในเครือแห่งแรก",
    description:
      "ลดเวลาผลิตเฉลี่ยลง 40% โดยมีงานไม้ งานเหล็ก และ painting ในมือตัวเอง",
    order: 2,
  },
  {
    date: "2019",
    title: "ขยายทีม 3D และ Visualisation",
    description:
      "เริ่มใช้ Blender + Unreal Engine สำหรับ pre-visualisation ทำให้ลูกค้าเห็นภาพงานก่อนผลิตจริง",
    imageUrl:
      "https://images.unsplash.com/photo-1581090700227-4c4f50b08c91?w=900&q=80&auto=format&fit=crop",
    order: 3,
  },
  {
    date: "2021",
    title: "งาน Sculpture สเกลใหญ่ชิ้นแรก",
    description:
      "ติดตั้ง stainless sculpture สูง 6 เมตรใน corporate lobby — เป็นจุดเริ่มของกลุ่มงาน permanent art",
    order: 4,
  },
  {
    date: "Q2 2024",
    title: "ครบ 200 โครงการสะสม",
    description:
      "นับจาก pop-up, exhibition, sculpture, ไปจนถึง stage design ของ music festival",
    imageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80&auto=format&fit=crop",
    order: 5,
  },
  {
    date: "2025",
    title: "เปิดโครงการ Artist Residency",
    description:
      "เปิดสตูดิโอให้ศิลปินรุ่นใหม่ 6 คน/ปี เข้ามาทำงานทดลองกับทีมและวัสดุของเรา",
    order: 6,
  },
  {
    date: "2026",
    title: "ขยายทีม + เปิดรับสมัครงานหลายตำแหน่ง",
    description:
      "เปิดรับ Art Director, 3D Designer, Production Supervisor และตำแหน่งอื่น ๆ ผ่านหน้า /careers",
    order: 7,
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@1234";
  const name = process.env.ADMIN_NAME ?? "Site Administrator";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash, role: Role.ADMIN },
  });
  console.log(`✓ Created admin user: ${email}`);
  console.log(`  password: ${password}`);
  console.log("  Please log in and change the password immediately.");
}

async function seedAbout() {
  // Singleton page — only update if it still has the default heading.
  const page = await prisma.aboutPage.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  if (page.heading === "About us" || page.heading.length === 0) {
    await prisma.aboutPage.update({
      where: { id: "singleton" },
      data: ABOUT_PAGE,
    });
    console.log("✓ Seeded /about page hero + body");
  } else {
    console.log("✓ /about page already customised — keeping existing content");
  }

  const articleCount = await prisma.aboutArticle.count();
  if (articleCount === 0) {
    await prisma.aboutArticle.createMany({ data: ARTICLES });
    console.log(`✓ Seeded ${ARTICLES.length} articles`);
  } else {
    console.log(`✓ Articles table already has ${articleCount} rows — skipping`);
  }

  const timelineCount = await prisma.timelineEvent.count();
  if (timelineCount === 0) {
    await prisma.timelineEvent.createMany({ data: TIMELINE });
    console.log(`✓ Seeded ${TIMELINE.length} timeline events`);
  } else {
    console.log(`✓ Timeline already has ${timelineCount} events — skipping`);
  }
}

/* ─── Categories + Articles + NavBar mock data ─── */

const CATEGORIES: Array<{
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  order: number;
}> = [
  {
    slug: "behind-the-scenes",
    name: "เบื้องหลังงาน",
    description: "พาทัวร์การทำงานจริงของทีม — ตั้งแต่ concept board จนถึงวันเปิดงาน",
    coverImage:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80&auto=format&fit=crop",
    order: 0,
  },
  {
    slug: "design-notes",
    name: "บันทึกการออกแบบ",
    description: "ข้อคิดและบทเรียนจากกระบวนการออกแบบในแต่ละโครงการ",
    coverImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
    order: 1,
  },
  {
    slug: "studio-updates",
    name: "ข่าวสตูดิโอ",
    description: "อัปเดตจากทีมงาน — โครงการใหม่ การขยายทีม และอีเวนต์ของเรา",
    coverImage:
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80&auto=format&fit=crop",
    order: 2,
  },
  {
    slug: "process",
    name: "กระบวนการทำงาน",
    description: "เครื่องมือ วัสดุ และวิธีคิดเบื้องหลังงานแต่ละชิ้น",
    coverImage:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80&auto=format&fit=crop",
    order: 3,
  },
  {
    slug: "inspiration",
    name: "แรงบันดาลใจ",
    description: "สิ่งที่ทีมเราเห็น อ่าน และเก็บไว้ในกระเป๋าทุกวัน",
    coverImage:
      "https://images.unsplash.com/photo-1531731314256-7610adda4a92?w=1200&q=80&auto=format&fit=crop",
    order: 4,
  },
];

/** Articles reference categories by slug — resolved to IDs at seed time. */
const NEW_ARTICLES: Array<{
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  layout: string;
  categorySlug: string;
  order: number;
}> = [
  {
    slug: "brand-experience-1200-sqm",
    title: "เบื้องหลังงาน Brand Experience ขนาด 1,200 ตร.ม.",
    excerpt:
      "พาทัวร์งาน installation ขนาดใหญ่ที่ใช้เวลาผลิตเพียง 28 วัน — ตั้งแต่ concept board จนถึงวันเปิดงาน",
    body:
      "โจทย์ที่เราได้รับคือเปลี่ยน warehouse ขนาด 1,200 ตร.ม. ให้กลายเป็น immersive space สำหรับการเปิดตัวสินค้าใหม่ของแบรนด์ใหญ่ ในเวลา 28 วัน — ซึ่งสั้นกว่าโครงการขนาดนี้ที่เราเคยทำเกือบครึ่งหนึ่ง\n\n" +
      "วันแรกเราใช้ Blender ขึ้น mockup คร่าวๆ ของ space ทั้งหมด แล้วทำงานคู่ขนานกัน 4 ทีม — 3D, structural, lighting, และ on-site coordinator — โดยที่ทุกคนอัปเดตหน้างานทุก 4 ชั่วโมง\n\n" +
      "ความท้าทายที่ใหญ่ที่สุดคือการขนส่ง element หลักที่กว้าง 18 เมตรเข้าตัว warehouse ที่ประตูกว้างเพียง 4 เมตร ทีมต้องออกแบบให้แยกชิ้นและประกอบหน้างานได้ภายใน 6 ชั่วโมง\n\n" +
      "บทเรียนสำคัญที่สุดของโครงการนี้คือ — ยิ่งทำงานเร็ว ยิ่งต้องสื่อสารช้าและชัด การประชุม stand-up 15 นาทีทุกเช้าช่วยให้ทุกคนไม่ทำของซ้ำซ้อน",
    coverImage:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1600&q=80&auto=format&fit=crop",
    layout: "magazine",
    categorySlug: "behind-the-scenes",
    order: 0,
  },
  {
    slug: "stainless-sculpture-process",
    title: "Sculpture สำหรับ Corporate Lobby — กระบวนการที่อยู่หลังโลหะ",
    excerpt:
      "งาน stainless steel สูง 6 เมตรชิ้นนี้ใช้เวลาออกแบบนานกว่าผลิตเกือบสองเท่า",
    body:
      "เราเริ่มจากการศึกษา DNA ของแบรนด์ — สีหลัก รูปทรงที่ปรากฏใน logo และ texture ที่บริษัทเลือกใช้ใน interior\n\n" +
      "ทีม structural engineer เข้ามาช่วยตั้งแต่ช่วง sketch เพื่อให้แน่ใจว่า curve ที่นักออกแบบวาดสามารถยืนได้จริงโดยไม่ต้องใช้โครงเสริมที่จะทำลายความสวยงาม — เป็นเรื่องที่หลายคนข้าม แต่จริงๆ แล้วต้องคิดตั้งแต่ขั้น concept\n\n" +
      "การเลือก finishing ของ stainless steel เป็นอีกขั้นที่ใช้เวลานาน เราทดลอง mirror finish, brushed finish, และ vibration finish ก่อนเลือก brushed ที่สะท้อนแสงนุ่มที่สุดในช่วงแสงธรรมชาติของ lobby\n\n" +
      "ผลลัพธ์คือ sculpture ที่ทั้งสะท้อนตัวตนของแบรนด์และใช้งานเป็นจุดถ่ายภาพให้พนักงานได้ทุกวัน — KPI ที่เราภูมิใจที่สุดคือมีพนักงานถ่ายรูปและโพสต์ลง LinkedIn เกิน 200 ครั้งในเดือนแรก",
    coverImage:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&q=80&auto=format&fit=crop",
    layout: "editorial",
    categorySlug: "process",
    order: 1,
  },
  {
    slug: "popup-narrative-first",
    title: "ทำไม Pop-up ที่ดีต้องเริ่มจาก 'เรื่องเล่า' ไม่ใช่ 'การตกแต่ง'",
    excerpt:
      "บทเรียนจากงาน 47 โครงการในปี 2025 — ทำไม installation ส่วนใหญ่ถึงน่าเบื่อ แม้จะใช้งบสูง",
    body:
      "เรามักได้รับโจทย์ในรูปแบบ 'อยากได้บูธสวยๆ' แต่บูธสวยที่ขาด narrative มักจบลงด้วยการเป็น backdrop ของรูปถ่ายเท่านั้น\n\n" +
      "วิธีที่เราใช้คือ workshop กับทีมการตลาดของลูกค้าก่อนเริ่มออกแบบจริง 1 วัน — ขุดให้เจอว่าแบรนด์อยากให้ผู้ชมรู้สึกอย่างไรเมื่อก้าวออกจากงาน แล้วค่อยตามด้วยรูปทรง วัสดุ แสง และเส้นทางเดิน\n\n" +
      "งานที่เริ่มจาก 'ความรู้สึก' ก่อน 'หน้าตา' มักได้ผลลัพธ์ที่จดจำได้นานกว่ามาก",
    coverImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80&auto=format&fit=crop",
    layout: "minimal",
    categorySlug: "design-notes",
    order: 2,
  },
  {
    slug: "new-production-studio",
    title: "เปิดสตูดิโอใหม่ — โรงผลิตในเครือพื้นที่ 2,400 ตร.ม.",
    excerpt:
      "ลดเวลาผลิตเฉลี่ยลง 35% ด้วยโรงงานในมือตัวเองที่ครบเครื่องตั้งแต่งานไม้ งานเหล็ก ถึง CNC",
    body:
      "ตลอดหลายปีที่ผ่านมา เราพึ่งพา supplier ภายนอกเป็นหลัก ซึ่งทำให้คอนโทรลคุณภาพและไทม์ไลน์ทำได้จำกัด — ถึงเวลาที่ต้องเปลี่ยน\n\n" +
      "โรงผลิตใหม่ของเรามีทั้งห้องเก็บวัสดุ ห้อง spray booth, CNC ขนาด 1.5 x 3 เมตร, และโซน assembly ที่รองรับงานสูงถึง 8 เมตร\n\n" +
      "ผลคือเรารับงานที่ 'ต้องเสร็จเร็ว' และ 'ต้องเนี้ยบมาก' ได้พร้อมกันอย่างมั่นใจ — ในไตรมาสแรกหลังเปิดเรารับงานเพิ่ม 40% โดยใช้เวลาเฉลี่ยน้อยลง",
    coverImage:
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1600&q=80&auto=format&fit=crop",
    layout: "bold",
    categorySlug: "studio-updates",
    order: 3,
  },
  {
    slug: "artist-residency-2026",
    title: "ทำงานกับศิลปินรุ่นใหม่ — Artist Residency 2026",
    excerpt:
      "เปิดพื้นที่ให้ศิลปินรุ่นใหม่ 6 คนเข้ามาทดลองวัสดุและกระบวนการของเราเป็นเวลา 3 เดือน",
    body:
      "เราเริ่มโครงการ Residency เพราะเชื่อว่าศิลปะที่ดีต้องไม่ปิดตัวเองอยู่ในกล่อง\n\n" +
      "ศิลปินที่ได้รับเลือกจะได้ใช้โรงผลิต ทีม technician และวัสดุของเราในการทดลองโดยไม่มีโจทย์จากลูกค้า — ผลงานจัดแสดงปลายปีในรูปแบบ open studio\n\n" +
      "ปีนี้เราคัดเลือกจากผู้สมัครกว่า 180 คน ได้ศิลปินที่ทำงานครอบคลุมตั้งแต่ ceramic, sound installation, video art, จนถึง textile sculpture\n\n" +
      "เปิดรับสมัครรอบ 2 ในเดือนสิงหาคม 2026 — รายละเอียดเพิ่มเติมที่หน้า Careers",
    coverImage:
      "https://images.unsplash.com/photo-1531731314256-7610adda4a92?w=1600&q=80&auto=format&fit=crop",
    layout: "gallery",
    categorySlug: "studio-updates",
    order: 4,
  },
  {
    slug: "sustainable-event-design",
    title: "Sustainability ในงาน Event — ไม่ใช่แค่ใช้ไม้รีไซเคิล",
    excerpt:
      "ทำไม 'ความยั่งยืน' ในงาน event ต้องเริ่มจากการออกแบบให้ถอดประกอบและใช้ซ้ำได้ตั้งแต่ต้น",
    body:
      "งาน event โดยธรรมชาติคืออุตสาหกรรมที่สร้างของเหลือทิ้งจำนวนมาก — บูธจำนวนมหาศาลที่กลายเป็นขยะหลังจัดงานเสร็จเพียงไม่กี่วัน\n\n" +
      "ทีมของเรานำหลัก modular design เข้ามาใช้กับงานเกือบทั้งหมด: ทุกชิ้นถอดประกอบได้ ทุก connector เป็น standard เพื่อให้นำกลับมา assemble ใหม่ในงานอื่นได้ในเวลาเพียงครึ่งวัน\n\n" +
      "เรายังออกแบบให้ทุกชิ้นมี 'ชีวิตที่สอง' ตั้งแต่แรก — โครงเหล็กที่ใช้ใน festival ปีนี้ จะกลายเป็น display ใน flagship store ของลูกค้าในไตรมาสหน้า\n\n" +
      "ในปี 2025 เราสามารถนำชิ้นส่วนกลับมาใช้ใหม่ได้ถึง 64% โดยน้ำหนัก — เป้าหมายปี 2026 อยู่ที่ 75%",
    coverImage:
      "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1600&q=80&auto=format&fit=crop",
    layout: "wide",
    categorySlug: "design-notes",
    order: 5,
  },
  {
    slug: "five-materials-2025",
    title: "5 วัสดุที่เราใช้บ่อยที่สุดในปี 2025",
    excerpt:
      "ตั้งแต่ aluminum honeycomb จนถึงผ้า canvas รีไซเคิล — บันทึกประจำปีจากโรงผลิต",
    body:
      "ปี 2025 ที่ผ่านมาทีมเราจดรายการวัสดุที่ใช้ทุกชิ้น แล้วจัดอันดับ 5 อันดับแรกที่ใช้บ่อยที่สุด\n\n" +
      "อันดับ 1: Birch plywood 18mm — ใช้กับงาน 73% ของโครงการ ด้วยความแข็งแรง น้ำหนักไม่มาก และยังเก็บลายสวยถ้าไม่อยาก paint\n\n" +
      "อันดับ 2: Aluminum profile T-slot — เป็นโครงสำหรับงาน modular ที่ assemble และ disassemble ได้รวดเร็ว ใช้กับ pop-up เกือบทุกงาน\n\n" +
      "อันดับ 3: ผ้า canvas รีไซเคิล (recycled PET) — แบรนด์ลูกค้าหลายรายตอนนี้บังคับว่าต้องใช้วัสดุที่ recycled ส่วนนี้เลยขยายตัวเร็วมาก\n\n" +
      "อันดับ 4: Mild steel tube — สำหรับงานที่ต้องการความแข็งแรงและราคาควบคุมได้\n\n" +
      "อันดับ 5: LED strip + diffuser acrylic — แสงเป็นส่วนสำคัญของทุก installation",
    coverImage:
      "https://images.unsplash.com/photo-1565462900737-7c19eb8d9d75?w=1600&q=80&auto=format&fit=crop",
    layout: "sidebar",
    categorySlug: "process",
    order: 6,
  },
  {
    slug: "brand-narrative-workshop",
    title: "Workshop กับลูกค้า — วิธีหา narrative ของแบรนด์",
    excerpt:
      "เรา run workshop ครึ่งวันกับทุกโครงการใหญ่ — นี่คือสิ่งที่เรียนรู้จาก 60+ sessions",
    body:
      "Workshop ไม่ใช่ meeting — เป็นช่วงที่เราทำให้ทีมการตลาดของลูกค้าหลุดออกจากภาษา marketing แล้วบรรยายว่าอยากให้ลูกค้ารู้สึกอย่างไรในแบบของมนุษย์ทั่วไป\n\n" +
      "เครื่องมือที่เราใช้บ่อยที่สุดคือ 'moodboard ที่ไม่ใช่รูป' — ขอให้ลูกค้าเขียนเป็นคำหรือประโยคที่อธิบายความรู้สึก แล้วค่อยให้ทีมเราแปลเป็น visual\n\n" +
      "อีกแบบฝึกหัดคือ 'visitor journey' — ลากเส้นทางตั้งแต่ก้าวเข้าประตูจนกลับออก พร้อมจุดที่อยากให้ผู้ชมรู้สึกอะไรเป็นพิเศษ ใช้เวลาประมาณ 90 นาที\n\n" +
      "ผลลัพธ์ที่ได้จาก workshop ครึ่งวันมักช่วยให้กระบวนการออกแบบเร็วขึ้น 30-40% เพราะทุกฝ่ายเห็นภาพเดียวกันตั้งแต่ต้น",
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80&auto=format&fit=crop",
    layout: "classic",
    categorySlug: "process",
    order: 7,
  },
  {
    slug: "festival-stage-design-lessons",
    title: "Festival Stage Design — บทเรียน 3 ปีที่ผ่านมา",
    excerpt:
      "เราออกแบบเวที music festival มา 14 งาน — นี่คือสิ่งที่ต้องเช็คก่อนเริ่มทุกครั้ง",
    body:
      "Stage design ของ festival เป็นโปรเจกต์ที่ technical สูงที่สุดในบรรดางานของเรา — เพราะต้องผสม visual, structure, lighting, sound เข้าด้วยกันโดยมี deadline ที่บังคับ\n\n" +
      "checklist พื้นฐานที่เราทำทุกครั้ง:\n" +
      "1. wind load — เวที outdoor ต้องผ่าน calculation ที่ pole + canopy ทุกชิ้น\n" +
      "2. power budget — รวม LED, lighting, sound, video wall, fog machines\n" +
      "3. emergency egress — ทางออกอย่างน้อย 2 ทิศ\n" +
      "4. truss height — ตรวจสอบความสูง clearance ก่อนสั่งอุปกรณ์\n" +
      "5. weather backup plan — ทุกชิ้นต้องระบุว่าทนน้ำได้ระดับใด\n\n" +
      "นอกจาก checklist เรายังเก็บ post-mortem ทุกงาน — สิ่งที่ work, ไม่ work, และ surprise — เป็น knowledge base ที่ทีมใหม่อ่านก่อนเริ่มโครงการแรก",
    coverImage:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80&auto=format&fit=crop",
    layout: "technical",
    categorySlug: "behind-the-scenes",
    order: 8,
  },
  {
    slug: "inspiration-7-things",
    title: "Inspiration — 7 สิ่งที่ทำให้ทีมเรา fresh เสมอ",
    excerpt:
      "หนังสือ podcast บัญชี IG และร้านกาแฟที่ทีมเราชอบไปนั่งดู",
    body:
      "1. หนังสือ 'The Shape of Design' ของ Frank Chimero — อ่านซ้ำได้เรื่อยๆ\n\n" +
      "2. Podcast 'Design Better' — interview กับ design lead จากบริษัทใหญ่ๆ\n\n" +
      "3. Instagram @ignant — collected work ของศิลปินทั่วโลก\n\n" +
      "4. ร้านกาแฟ Roots ที่ Thonglor — เปลี่ยน interior ทุก 3 เดือน เป็นแหล่งดูวัสดุใหม่ๆ\n\n" +
      "5. Vimeo channel ของ Universal Everything\n\n" +
      "6. Sketchbook อันที่ 47 ที่ทีมเปลี่ยนทุกเดือน — ทุกคนจดอะไรก็ได้ที่เห็นแล้วชอบ\n\n" +
      "7. การเดินเล่นในสวนรถไฟตอนเช้าตรู่ — ที่ที่ทีมหลายคนคิดงานออก",
    coverImage:
      "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1600&q=80&auto=format&fit=crop",
    layout: "compact",
    categorySlug: "inspiration",
    order: 9,
  },
];

/**
 * NavBar overrides — top-level + nested children (dropdowns).
 * Items are inserted in two passes so children can reference their parent id.
 */
interface NavSeed {
  label: string;
  kind: string;
  target: string;
  order: number;
  requireAuth?: boolean;
  adminOnly?: boolean;
  openInNew?: boolean;
  /** Children render as a dropdown under this top-level item. */
  children?: Array<Omit<NavSeed, "children">>;
}

const NAV_ITEMS: NavSeed[] = [
  { label: "Docs", kind: "page", target: "/docs", order: 0 },
  {
    // Dropdown parent with no own link — pure menu host.
    label: "Services",
    kind: "page",
    target: "",
    order: 1,
    children: [
      {
        label: "Brand Experience",
        kind: "article",
        target: "brand-experience-1200-sqm",
        order: 0,
      },
      {
        label: "Sculpture & Permanent Art",
        kind: "article",
        target: "stainless-sculpture-process",
        order: 1,
      },
      {
        label: "Pop-up & Exhibition",
        kind: "article",
        target: "popup-narrative-first",
        order: 2,
      },
      {
        label: "Stage Design",
        kind: "article",
        target: "festival-stage-design-lessons",
        order: 3,
      },
      {
        label: "Sustainable Design",
        kind: "article",
        target: "sustainable-event-design",
        order: 4,
      },
    ],
  },
  {
    label: "Articles",
    kind: "page",
    target: "/articles",
    order: 2,
    children: [
      {
        label: "เบื้องหลังงาน",
        kind: "category",
        target: "behind-the-scenes",
        order: 0,
      },
      {
        label: "บันทึกการออกแบบ",
        kind: "category",
        target: "design-notes",
        order: 1,
      },
      { label: "ข่าวสตูดิโอ", kind: "category", target: "studio-updates", order: 2 },
      { label: "กระบวนการทำงาน", kind: "category", target: "process", order: 3 },
      { label: "แรงบันดาลใจ", kind: "category", target: "inspiration", order: 4 },
    ],
  },
  { label: "Careers", kind: "page", target: "/careers", order: 3 },
  { label: "About", kind: "page", target: "/about", order: 4 },
];

function isNew(model: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.[model]?.findMany;
}

async function seedCategoriesAndArticles() {
  if (!isNew("category") || !isNew("article")) {
    console.log("✓ Category/Article tables not ready — skip new-content seed");
    return;
  }

  const existingCats = await prisma.category.count();
  let catBySlug: Map<string, string>;
  if (existingCats === 0) {
    await prisma.category.createMany({ data: CATEGORIES });
    const created = await prisma.category.findMany();
    catBySlug = new Map(created.map((c) => [c.slug, c.id]));
    console.log(`✓ Seeded ${CATEGORIES.length} categories`);
  } else {
    const existing = await prisma.category.findMany();
    catBySlug = new Map(existing.map((c) => [c.slug, c.id]));
    console.log(`✓ Categories table already has ${existingCats} rows — skipping`);
  }

  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const now = new Date();
    await prisma.article.createMany({
      data: NEW_ARTICLES.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        coverImage: a.coverImage,
        layout: a.layout,
        categoryId: catBySlug.get(a.categorySlug) ?? null,
        isPublished: true,
        publishedAt: new Date(now.getTime() - a.order * 86_400_000 * 3), // stagger 3 days apart
        order: a.order,
      })),
    });
    console.log(`✓ Seeded ${NEW_ARTICLES.length} articles (across 10 layouts)`);
  } else {
    console.log(`✓ Article table already has ${articleCount} rows — skipping`);
  }
}

async function seedNavItems() {
  if (!isNew("navItem")) {
    console.log("✓ NavItem table not ready — skip nav seed");
    return;
  }
  // Always wipe existing nav rows so the seed reflects the latest hard-coded
  // structure (order changes, new dropdowns, renamed items, etc).
  const existing = await prisma.navItem.count();
  if (existing > 0) {
    await prisma.navItem.deleteMany({});
    console.log(`✓ Removed ${existing} existing NavItem rows before re-seed`);
  }

  // Pass 1: create all top-level items, remember their ids by label.
  const topIds = new Map<string, string>();
  let topCount = 0;
  let childCount = 0;
  for (const it of NAV_ITEMS) {
    const created = await prisma.navItem.create({
      data: {
        label: it.label,
        kind: it.kind,
        target: it.target,
        order: it.order,
        requireAuth: it.requireAuth ?? false,
        adminOnly: it.adminOnly ?? false,
        openInNew: it.openInNew ?? false,
        isPublished: true,
      },
    });
    topIds.set(it.label, created.id);
    topCount++;
  }
  // Pass 2: create children referencing their parent.
  for (const it of NAV_ITEMS) {
    if (!it.children) continue;
    const parentId = topIds.get(it.label);
    if (!parentId) continue;
    for (const c of it.children) {
      await prisma.navItem.create({
        data: {
          label: c.label,
          kind: c.kind,
          target: c.target,
          parentId,
          order: c.order,
          requireAuth: c.requireAuth ?? false,
          adminOnly: c.adminOnly ?? false,
          openInNew: c.openInNew ?? false,
          isPublished: true,
        },
      });
      childCount++;
    }
  }
  console.log(`✓ Seeded ${topCount} top-level + ${childCount} child nav items`);
}

/* ─── Platform / super-admin bootstrap ─── */

async function seedPlatformAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(prisma as any)?.platformAdmin?.findUnique) {
    console.log("✓ PlatformAdmin table not ready — skip platform seed");
    return;
  }
  const email = (process.env.PLATFORM_ADMIN_EMAIL ?? "platform@example.com").toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD ?? "Platform@1234";
  const name = process.env.PLATFORM_ADMIN_NAME ?? "Platform Operator";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (prisma as any).platformAdmin.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ PlatformAdmin already exists: ${email}`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).platformAdmin.create({
    data: { email, name, passwordHash, isActive: true },
  });
  console.log(`✓ Created platform admin: ${email}`);
  console.log(`  password: ${password}`);
  console.log("  Sign in at /super-admin and change the password immediately.");
}

async function main() {
  await seedAdmin();
  await seedAbout();
  await seedCategoriesAndArticles();
  await seedNavItems();
  await seedPlatformAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
