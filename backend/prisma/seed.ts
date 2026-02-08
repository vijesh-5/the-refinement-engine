import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create templates
  const templates = [
    {
      name: "Blog Post",
      description: "Generate engaging blog posts on any topic",
      category: "Blog",
      prompt:
        "Write a comprehensive blog post about {topic}. Include an introduction, main points, and conclusion.",
      icon: "📝",
    },
    {
      name: "Product Description",
      description: "Create compelling product descriptions that sell",
      category: "E-commerce",
      prompt:
        "Write a product description for {product}. Highlight key features, benefits, and why customers should buy it.",
      icon: "🛍️",
    },
    {
      name: "Social Media Post",
      description: "Craft attention-grabbing social media content",
      category: "Social Media",
      prompt:
        "Create an engaging social media post about {topic}. Keep it concise, impactful, and include relevant hashtags.",
      icon: "📱",
    },
    {
      name: "Email Newsletter",
      description: "Write professional email newsletters",
      category: "Email",
      prompt:
        "Write an email newsletter about {topic}. Include a catchy subject line, introduction, main content, and call-to-action.",
      icon: "📧",
    },
    {
      name: "Ad Copy",
      description: "Generate high-converting ad copy",
      category: "Advertising",
      prompt:
        "Create compelling ad copy for {product/service}. Focus on benefits, create urgency, and include a strong call-to-action.",
      icon: "📣",
    },
    {
      name: "Video Script",
      description: "Write engaging video scripts",
      category: "Video",
      prompt:
        "Write a video script about {topic}. Include hook, main content, and call-to-action. Keep it engaging and conversational.",
      icon: "🎬",
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }

  console.log(`✅ Created ${templates.length} templates`);
  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
