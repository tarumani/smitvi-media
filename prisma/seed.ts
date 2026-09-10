import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  ["Technology", "Tools, gadgets, and the systems that shape how we live."],
  ["AI", "Artificial intelligence, machine learning, and the future of work."],
  ["Science", "Discoveries, research, and how the world actually works."],
  ["Business", "Companies, markets, and building useful products."],
  ["Career", "Skills, interviews, and growing a professional life."],
  ["Education", "Learning that sticks — explainers, courses, and how-tos."],
  ["Finance", "Money, investing basics, and economic ideas."],
  ["Design", "Product, visual, and experiential design."],
  ["Coding", "Software, architecture, and building on the web."],
  ["Travel", "Places, cultures, and how people move through the world."],
  ["Lifestyle", "Daily practice, habits, and living well."],
  ["Entertainment", "Stories, culture, and things worth watching."],
  ["Health", "Bodies, minds, and evidence-based wellbeing."],
  ["History", "What happened, why it mattered, and what it taught us."],
  ["Motivation", "Craft, discipline, and getting important work done."],
  ["Facts", "Surprising, useful, and carefully checked ideas."],
] as const;

const SAMPLE = {
  bunny: {
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumb: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    duration: 596,
  },
  elephants: {
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumb: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    duration: 653,
  },
  sintel: {
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumb: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
    duration: 888,
  },
  tears: {
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumb: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    duration: 734,
  },
  subaru: {
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumb: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
    duration: 294,
  },
};

async function upsertUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "USER" | "CREATOR" | "ADMIN";
  bio?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.name, role: data.role, bio: data.bio },
    create: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
      bio: data.bio,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    name: "Smitvi Admin",
    username: process.env.ADMIN_USERNAME ?? "admin",
    email: process.env.ADMIN_EMAIL ?? "admin@smitvimedia.com",
    password: process.env.ADMIN_PASSWORD ?? "change-this-admin-password",
    role: "ADMIN",
    bio: "Platform administrator",
  });

  const officialUser = await upsertUser({
    name: "Smitvi Media",
    username: "smitvimedia",
    email: process.env.OFFICIAL_CREATOR_EMAIL ?? "hello@smitvimedia.com",
    password: process.env.OFFICIAL_CREATOR_PASSWORD ?? "change-this-creator-password",
    role: "CREATOR",
    bio: "Official Smitvi Media channel. Ideas Worth Watching.",
  });

  const guest = await upsertUser({
    name: "Ava Chen",
    username: "avachen",
    email: "ava@example.com",
    password: "password123",
    role: "CREATOR",
    bio: "Writes and films about careers, learning, and useful technology.",
  });

  const official = await prisma.creator.upsert({
    where: { userId: officialUser.id },
    update: { featured: true, displayName: "Smitvi Media", description: officialUser.bio },
    create: {
      userId: officialUser.id,
      displayName: "Smitvi Media",
      username: officialUser.username,
      description: officialUser.bio,
      featured: true,
      status: "APPROVED",
    },
  });

  const ava = await prisma.creator.upsert({
    where: { userId: guest.id },
    update: { featured: true },
    create: {
      userId: guest.id,
      displayName: "Ava Chen",
      username: guest.username,
      description: guest.bio,
      featured: true,
      status: "APPROVED",
    },
  });

  const cats = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const [name, description] = CATEGORIES[i];
    const slug = name.toLowerCase();
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name, description, sortOrder: i, status: "active" },
      create: { name, slug, description, sortOrder: i, status: "active" },
    });
    cats.push(cat);
  }

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  async function tagList(names: string[]) {
    const rows = [];
    for (const name of names) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      rows.push(tag);
    }
    return rows;
  }

  const videos: Array<{
    creatorId: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    sample: keyof typeof SAMPLE;
    type: "VIDEO" | "SHORT";
    featured?: boolean;
    views: number;
    likes: number;
    hoursAgo: number;
  }> = [
    {
      creatorId: official.id,
      title: "The Future of Human Intelligence",
      slug: "the-future-of-human-intelligence",
      description:
        "How AI could transform the way humans learn, work and create — and what we should protect along the way.",
      category: "ai",
      tags: ["AI", "learning", "future of work"],
      sample: "sintel",
      type: "VIDEO",
      featured: true,
      views: 18420,
      likes: 932,
      hoursAgo: 20,
    },
    {
      creatorId: official.id,
      title: "What Makes an Idea Worth Watching",
      slug: "what-makes-an-idea-worth-watching",
      description: "A field guide to attention, curiosity, and why some stories stay with people.",
      category: "education",
      tags: ["media", "storytelling", "attention"],
      sample: "bunny",
      type: "VIDEO",
      views: 9120,
      likes: 401,
      hoursAgo: 48,
    },
    {
      creatorId: official.id,
      title: "A Practical Map of Modern Tech Careers",
      slug: "practical-map-of-modern-tech-careers",
      description: "Roles, skills, and the unglamorous work that actually compounds.",
      category: "career",
      tags: ["career", "technology", "skills"],
      sample: "elephants",
      type: "VIDEO",
      views: 15400,
      likes: 720,
      hoursAgo: 72,
    },
    {
      creatorId: official.id,
      title: "How Markets Quietly Shape Everyday Life",
      slug: "how-markets-shape-everyday-life",
      description: "Incentives, prices, and the hidden architecture of ordinary decisions.",
      category: "business",
      tags: ["business", "economics"],
      sample: "tears",
      type: "VIDEO",
      views: 6400,
      likes: 210,
      hoursAgo: 96,
    },
    {
      creatorId: ava.id,
      title: "Learn Faster Without Burning Out",
      slug: "learn-faster-without-burning-out",
      description: "A humane approach to deliberate practice, rest, and retaining what you study.",
      category: "education",
      tags: ["learning", "habits", "career"],
      sample: "subaru",
      type: "VIDEO",
      views: 22100,
      likes: 1104,
      hoursAgo: 12,
    },
    {
      creatorId: ava.id,
      title: "Designing Software People Can Trust",
      slug: "designing-software-people-can-trust",
      description: "Clarity, constraints, and why reliability is a product feature.",
      category: "coding",
      tags: ["coding", "design", "product"],
      sample: "elephants",
      type: "VIDEO",
      views: 7800,
      likes: 355,
      hoursAgo: 30,
    },
    {
      creatorId: official.id,
      title: "60 seconds: What a neural net actually does",
      slug: "what-a-neural-net-actually-does",
      description: "A short, plain-language picture of layers, weights, and prediction.",
      category: "ai",
      tags: ["AI", "shorts", "explainers"],
      sample: "bunny",
      type: "SHORT",
      views: 40200,
      likes: 2100,
      hoursAgo: 8,
    },
    {
      creatorId: ava.id,
      title: "The interview question nobody prepares",
      slug: "the-interview-question-nobody-prepares",
      description: "A 45-second career short on showing how you think, not what you memorized.",
      category: "career",
      tags: ["career", "shorts"],
      sample: "subaru",
      type: "SHORT",
      views: 19800,
      likes: 980,
      hoursAgo: 16,
    },
    {
      creatorId: official.id,
      title: "A city, a street, a better question",
      slug: "a-city-a-street-a-better-question",
      description: "Travel as paying attention — not collecting places.",
      category: "travel",
      tags: ["travel", "shorts", "attention"],
      sample: "sintel",
      type: "SHORT",
      views: 12100,
      likes: 540,
      hoursAgo: 40,
    },
    {
      creatorId: official.id,
      title: "Facts that change how you see energy",
      slug: "facts-that-change-how-you-see-energy",
      description: "Scale, density, and why units matter more than slogans.",
      category: "facts",
      tags: ["science", "facts", "energy"],
      sample: "tears",
      type: "VIDEO",
      views: 5300,
      likes: 190,
      hoursAgo: 110,
    },
  ];

  for (const v of videos) {
    const sample = SAMPLE[v.sample];
    const tags = await tagList(v.tags);
    const publishedAt = new Date(Date.now() - v.hoursAgo * 3600_000);
    const video = await prisma.video.upsert({
      where: { slug: v.slug },
      update: {
        title: v.title,
        description: v.description,
        videoUrl: sample.video,
        thumbnailUrl: sample.thumb,
        duration: v.type === "SHORT" ? Math.min(58, sample.duration) : sample.duration,
        categoryId: bySlug[v.category].id,
        videoType: v.type,
        visibility: "PUBLIC",
        status: "PUBLISHED",
        featured: Boolean(v.featured),
        viewsCount: v.views,
        likesCount: v.likes,
        publishedAt,
      },
      create: {
        creatorId: v.creatorId,
        title: v.title,
        slug: v.slug,
        description: v.description,
        videoUrl: sample.video,
        thumbnailUrl: sample.thumb,
        duration: v.type === "SHORT" ? Math.min(58, sample.duration) : sample.duration,
        categoryId: bySlug[v.category].id,
        videoType: v.type,
        visibility: "PUBLIC",
        status: "PUBLISHED",
        featured: Boolean(v.featured),
        viewsCount: v.views,
        likesCount: v.likes,
        commentsCount: 0,
        publishedAt,
      },
    });
    await prisma.videoTag.deleteMany({ where: { videoId: video.id } });
    await prisma.videoTag.createMany({
      data: tags.map((t) => ({ videoId: video.id, tagId: t.id })),
    });
  }

  await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      name: "Jordan Miles",
      username: "jordan",
      email: "viewer@example.com",
      passwordHash: await bcrypt.hash("password123", 12),
      role: "USER",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${admin.email}`);
  console.log(`Official creator: ${officialUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
