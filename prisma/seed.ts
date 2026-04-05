import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { calculatePriorityScore } from "../src/lib/utils/scoring";
import { generateMvpSpec } from "../src/lib/ai/spec-generator";

// Load env
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.mvpSpec.deleteMany();
  await prisma.backlogItem.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.context.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const hashedPassword = await bcrypt.hash("contextops2024", 12);
  const user = await prisma.user.create({
    data: {
      email: "ops@contextops.dev",
      password: hashedPassword,
      name: "Ops Manager",
    },
  });

  // Create user settings
  await prisma.settings.create({
    data: {
      userId: user.id,
      impactWeight: 0.35,
      urgencyWeight: 0.20,
      confidenceWeight: 0.15,
      painWeight: 0.20,
      effortWeight: 0.10,
    },
  });

  // --- CONTEXT 1: Consultoría Local ---
  const context1 = await prisma.context.create({
    data: {
      userId: user.id,
      name: "Consultoría Local - Optimización Ops",
      userType: "Freelance Consultant",
      city: "Madrid",
      mainActivity: "Business process consulting for SMEs",
      sector: "Consulting",
      previousExperience:
        "10 years in operations management at large companies. Now independent consultant helping SMEs optimize their operations and adopt digital tools.",
      currentAssets:
        "Laptop, Notion for notes, Excel for project tracking, email, WhatsApp for client communication. No CRM or formal project management tool.",
      mainPains:
        "Spending 8+ hours per week on admin tasks (invoicing, follow-ups, status reports). Losing track of client proposals. No way to measure which services generate most value.",
      repetitiveTasks:
        "Weekly status emails to clients, monthly invoicing, copying data between Excel sheets, manual proposal generation from templates.",
      detectedOpportunities:
        "Automate client reporting, implement CRM, create proposal generator tool.",
      approxBudget: "€300-500/month for tools, €5k for one-time development",
      urgency: "high",
      digitalChannels: ["email", "LinkedIn", "website"],
      tools: ["Excel", "Notion", "WhatsApp", "Gmail"],
      technicalLevel: "intermediate",
      availableTime: "5-10h/week for implementation",
      objectives:
        "Reduce admin time by 50%. Have clear visibility on pipeline and revenue. Deliver better client experience with less effort.",
      restrictions:
        "Cannot afford enterprise tools. Needs to remain lightweight and easy to use solo. GDPR compliance required for client data.",
      notes: "Strong candidate for automation-first approach.",
      status: "active",
    },
  });

  // Evidences for context 1
  await prisma.evidence.createMany({
    data: [
      {
        contextId: context1.id,
        type: "observation",
        title: "Admin time audit",
        content:
          "Tracked time for 2 weeks. Result: 9.5h/week on non-billable admin. Breakdown: 3h invoicing, 2.5h status emails, 2h data entry, 2h proposal writing.",
        tags: ["time-tracking", "admin", "bottleneck"],
      },
      {
        contextId: context1.id,
        type: "manual_process",
        title: "Monthly invoicing process",
        content:
          "Process: 1) Open each client folder in Notion, 2) Copy hours to Excel, 3) Calculate amount, 4) Create PDF invoice manually, 5) Send via email, 6) Log in separate tracking sheet. Takes 3-4 hours total.",
        tags: ["invoicing", "manual", "automation-candidate"],
      },
      {
        contextId: context1.id,
        type: "finding",
        title: "Lost proposals tracked",
        content:
          "Found 4 proposals sent in last 6 months with no follow-up. Estimated lost revenue: €12,000-18,000. Issue: no system to track proposal status.",
        tags: ["proposals", "revenue-loss", "CRM"],
      },
      {
        contextId: context1.id,
        type: "competitor",
        title: "Competitor analysis: solo consultants tools",
        content:
          "Researched 5 competitor consultants. 3 of 5 use HubSpot Free CRM. 2 use Pipedrive. All mentioned automated invoicing (FreshBooks, Wave) as key timesaver. Suggests clear market norm.",
        url: "https://www.hubspot.com/products/crm",
        tags: ["competitors", "CRM", "market-research"],
      },
      {
        contextId: context1.id,
        type: "idea",
        title: "Proposal auto-generator idea",
        content:
          "Idea: Create a simple web form that captures project parameters and generates a formatted proposal PDF automatically. Could save 2h per proposal. Would need: templates, PDF generation, client data storage.",
        tags: ["proposal", "automation", "idea"],
      },
      {
        contextId: context1.id,
        type: "note",
        title: "Client feedback on reporting",
        content:
          'Three clients mentioned they struggle to understand project status from weekly emails. One client said: "I need a dashboard, not another email." This suggests a client-facing reporting tool would add value.',
        tags: ["client-feedback", "reporting", "UX"],
      },
    ],
  });

  // --- CONTEXT 2: E-commerce Artesanía ---
  const context2 = await prisma.context.create({
    data: {
      userId: user.id,
      name: "E-commerce Artesanía",
      userType: "Small Business Owner",
      city: "Barcelona",
      mainActivity: "Online sale of handmade ceramic products",
      sector: "E-commerce / Artisan",
      previousExperience:
        "Ceramist for 8 years, started online store 2 years ago. No tech background but learned to manage Shopify and social media.",
      currentAssets:
        "Shopify store (50 products), Instagram 12k followers, Etsy shop, physical workshop, WhatsApp groups for loyal customers.",
      mainPains:
        "Inventory never matches reality. Oversold products 3 times this month. Can't predict which designs will sell. Order fulfillment tracking is chaotic.",
      repetitiveTasks:
        "Daily: check all platforms for orders, update inventory manually in each, respond to the same questions about delivery times, post to Instagram.",
      detectedOpportunities:
        "Inventory sync across platforms, automated order notifications, content planning tool.",
      approxBudget: "€200/month max for tools",
      urgency: "critical",
      digitalChannels: ["Shopify", "Instagram", "Etsy", "WhatsApp"],
      tools: ["Shopify", "Canva", "WhatsApp", "Google Sheets"],
      technicalLevel: "basic",
      availableTime: "2-3h/week",
      objectives:
        "Zero overselling incidents. Reduce daily ops time by 1 hour. Grow Instagram engagement. Understand which products are most profitable.",
      restrictions:
        "Very limited budget. Must be extremely simple to use. No time for complex setup.",
      notes: "High urgency due to repeated customer issues from overselling.",
      status: "active",
    },
  });

  // Evidences for context 2
  await prisma.evidence.createMany({
    data: [
      {
        contextId: context2.id,
        type: "finding",
        title: "Overselling incidents this month",
        content:
          "3 separate overselling incidents in the last 30 days. Total refunds issued: €340. One customer left a 1-star review mentioning the experience. Root cause: manual inventory across 3 platforms (Shopify, Etsy, physical).",
        tags: ["inventory", "overselling", "revenue-loss", "critical"],
      },
      {
        contextId: context2.id,
        type: "manual_process",
        title: "Daily order management process",
        content:
          "Every morning: 1) Check Shopify orders, 2) Check Etsy orders, 3) Check WhatsApp messages, 4) Update Google Sheet inventory for each platform, 5) Pack orders, 6) Mark as shipped in each platform. Takes 1.5-2h daily.",
        tags: ["inventory", "manual", "daily-ops"],
      },
      {
        contextId: context2.id,
        type: "observation",
        title: "Instagram engagement patterns",
        content:
          "Posts with work-in-progress content get 3x more engagement than product photos. Behind-the-scenes reels average 8k views vs 2k for static product posts. But 90% of posts are still static product photos.",
        tags: ["instagram", "content", "engagement"],
      },
      {
        contextId: context2.id,
        type: "competitor",
        title: "Competitor: ceramics store with 50k followers",
        content:
          "Analyzed top competitor (@ceramicasmiralles). Uses consistent posting schedule (3x/week), always uses same hashtag set, has automated DM responses for FAQs, links to Linktree with all purchase options.",
        url: "https://www.instagram.com",
        tags: ["competitor", "social-media", "automation"],
      },
      {
        contextId: context2.id,
        type: "idea",
        title: "Inventory sync MVP",
        content:
          "Minimal solution: single dashboard that shows total stock per product, with manual sync button to update Shopify and Etsy APIs. Would prevent overselling if used daily. More advanced: webhooks for real-time sync.",
        tags: ["inventory", "integration", "MVP-idea"],
      },
    ],
  });

  // --- OPPORTUNITIES for Context 1 ---
  const opp1 = await prisma.opportunity.create({
    data: {
      contextId: context1.id,
      title: "Automated weekly client reporting system",
      description:
        "Build a system that automatically generates and sends weekly status reports to clients, pulling data from project management tools. Eliminates 2.5h/week of manual email writing.",
      category: "automation",
      impact: 8,
      urgency: 7,
      confidence: 8,
      pain: 9,
      effort: 4,
      priorityScore: calculatePriorityScore(8, 7, 8, 9, 4),
      painResolved:
        "2.5h/week of manual report writing, inconsistent client communication, clients feeling uninformed.",
      valueType: "time_saving",
      affectedChannel: "email",
      solutionProposal:
        "Weekly cron job that pulls Notion data, generates PDF report via template, sends via email API. Dashboard for client to view history.",
      status: "validated",
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      contextId: context1.id,
      title: "CRM + proposal pipeline for solo consultant",
      description:
        "Lightweight CRM system tracking leads, proposals, and client status. Include proposal generator from templates. Recover lost revenue from untracked proposals.",
      category: "sales",
      impact: 9,
      urgency: 8,
      confidence: 7,
      pain: 8,
      effort: 6,
      priorityScore: calculatePriorityScore(9, 8, 7, 8, 6),
      painResolved:
        "Lost proposals worth €12-18k, no pipeline visibility, no follow-up system.",
      valueType: "revenue",
      affectedChannel: "email",
      solutionProposal:
        "Simple kanban pipeline (lead → proposal sent → negotiation → won/lost). Proposal generator with PDF export. Email follow-up reminders.",
      status: "prioritized",
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      contextId: context1.id,
      title: "Automated invoicing and time tracking integration",
      description:
        "Connect time tracking (Toggl/Clockify) with invoicing (Wave/FreshBooks) to eliminate 3h/month of manual invoicing work.",
      category: "automation",
      impact: 7,
      urgency: 6,
      confidence: 9,
      pain: 7,
      effort: 3,
      priorityScore: calculatePriorityScore(7, 6, 9, 7, 3),
      painResolved: "3h/month manual invoicing, calculation errors, late invoices.",
      valueType: "time_saving",
      affectedChannel: "email",
      solutionProposal:
        "Integration between time tracker and invoicing tool. Auto-generate invoice at month end. Send for review before sending to client.",
      status: "identified",
    },
  });

  // --- OPPORTUNITIES for Context 2 ---
  const opp4 = await prisma.opportunity.create({
    data: {
      contextId: context2.id,
      title: "Multi-platform inventory sync dashboard",
      description:
        "Central inventory management that syncs stock levels across Shopify, Etsy, and physical stock in real-time. Eliminates overselling incidents.",
      category: "operations",
      impact: 10,
      urgency: 10,
      confidence: 8,
      pain: 10,
      effort: 6,
      priorityScore: calculatePriorityScore(10, 10, 8, 10, 6),
      painResolved:
        "Overselling incidents (3 in last month), customer refunds €340, negative reviews, daily manual inventory work.",
      valueType: "cost_reduction",
      affectedChannel: "Shopify, Etsy",
      solutionProposal:
        "Dashboard showing unified inventory. Sync with Shopify and Etsy APIs. Alert when stock drops below threshold. Mobile-friendly for workshop use.",
      status: "prioritized",
    },
  });

  const opp5 = await prisma.opportunity.create({
    data: {
      contextId: context2.id,
      title: "Instagram content calendar and scheduling tool",
      description:
        "Simple content planning tool with scheduling capabilities to maintain consistent 3x/week posting and increase engagement.",
      category: "content",
      impact: 6,
      urgency: 5,
      confidence: 7,
      pain: 5,
      effort: 4,
      priorityScore: calculatePriorityScore(6, 5, 7, 5, 4),
      painResolved:
        "Inconsistent posting, reactive content strategy, low engagement from unoptimized timing.",
      valueType: "visibility",
      affectedChannel: "Instagram",
      solutionProposal:
        "Visual calendar with drag-and-drop scheduling, hashtag library, best-time-to-post suggestions based on historical data.",
      status: "identified",
    },
  });

  const opp6 = await prisma.opportunity.create({
    data: {
      contextId: context2.id,
      title: "Automated order status notifications via WhatsApp",
      description:
        "Send automatic WhatsApp messages to customers when order is confirmed, shipped, and delivered. Reduce manual customer service messages.",
      category: "automation",
      impact: 7,
      urgency: 7,
      confidence: 8,
      pain: 6,
      effort: 4,
      priorityScore: calculatePriorityScore(7, 7, 8, 6, 4),
      painResolved:
        "Manual order update messages, customer uncertainty about delivery, repetitive FAQ responses.",
      valueType: "quality",
      affectedChannel: "WhatsApp",
      solutionProposal:
        "WhatsApp Business API integration triggered by Shopify order events. Templates for: order confirmed, shipped (with tracking), delivered. FAQ auto-responses.",
      status: "validated",
    },
  });

  // --- BACKLOG ITEMS ---
  await prisma.backlogItem.createMany({
    data: [
      {
        opportunityId: opp1.id,
        title: "Weekly report template system",
        description:
          "Create configurable report templates that pull data from Notion and generate consistent HTML reports for each client.",
        type: "feature",
        priority: "high",
        status: "ready",
        effort: "m",
        acceptanceCriteria:
          "- Template editor with dynamic fields\n- Preview before sending\n- PDF export option\n- Client-specific branding",
        technicalNotes: "Use Notion API, React PDF library, Node.js cron",
      },
      {
        opportunityId: opp1.id,
        title: "Email delivery integration",
        description:
          "Integrate with SendGrid or similar to reliably send weekly reports with open tracking.",
        type: "integration",
        priority: "medium",
        status: "draft",
        effort: "s",
        acceptanceCriteria:
          "- Reports sent reliably on schedule\n- Delivery confirmation logged\n- Failure alerts",
      },
      {
        opportunityId: opp4.id,
        title: "Shopify inventory sync API integration",
        description:
          "Implement real-time inventory sync with Shopify API. When stock changes in central system, update Shopify automatically.",
        type: "integration",
        priority: "critical",
        status: "ready",
        effort: "m",
        acceptanceCriteria:
          "- Stock updates propagate to Shopify within 60 seconds\n- Failed syncs are retried and alerted\n- Audit log of all sync events",
        technicalNotes: "Use Shopify Admin REST API. Webhook for incoming orders.",
      },
      {
        opportunityId: opp4.id,
        title: "Inventory dashboard UI",
        description:
          "Build the central dashboard showing all products with current stock across channels.",
        type: "feature",
        priority: "critical",
        status: "in_progress",
        effort: "l",
        acceptanceCriteria:
          "- Table view of all products with stock per channel\n- Bulk update capability\n- Low stock indicators\n- Mobile responsive",
      },
      {
        opportunityId: opp2.id,
        title: "CRM pipeline data model and API",
        description:
          "Design and implement the data model for contacts, deals, and pipeline stages. Build CRUD API.",
        type: "feature",
        priority: "high",
        status: "draft",
        effort: "m",
        technicalNotes: "Prisma schema: Contact, Deal, Activity, PipelineStage",
      },
    ],
  });

  // --- MVP SPECS ---
  // Spec for opp4 (inventory sync - highest priority)
  const spec4Data = await generateMvpSpec(
    {
      id: opp4.id,
      title: opp4.title,
      description: opp4.description,
      category: opp4.category,
      solutionProposal: opp4.solutionProposal,
      painResolved: opp4.painResolved,
      valueType: opp4.valueType,
    },
    {
      name: context2.name,
      mainActivity: context2.mainActivity,
      sector: context2.sector,
      userType: context2.userType,
      city: context2.city,
      technicalLevel: context2.technicalLevel,
      objectives: context2.objectives,
    }
  );

  await prisma.mvpSpec.create({
    data: {
      opportunityId: opp4.id,
      problem: spec4Data.problem,
      targetUser: spec4Data.targetUser,
      mvpObjective: spec4Data.mvpObjective,
      scope: spec4Data.scope,
      outOfScope: spec4Data.outOfScope,
      features: JSON.stringify(spec4Data.features),
      mainFlow: spec4Data.mainFlow,
      requiredData: spec4Data.requiredData,
      metrics: spec4Data.metrics,
      risks: spec4Data.risks,
      assumptions: spec4Data.assumptions,
      suggestedStack: spec4Data.suggestedStack,
      nextIteration: spec4Data.nextIteration,
      markdownContent: spec4Data.markdownContent,
      generatedBy: spec4Data.generatedBy,
    },
  });

  // Spec for opp1 (automated reporting)
  const spec1Data = await generateMvpSpec(
    {
      id: opp1.id,
      title: opp1.title,
      description: opp1.description,
      category: opp1.category,
      solutionProposal: opp1.solutionProposal,
      painResolved: opp1.painResolved,
      valueType: opp1.valueType,
    },
    {
      name: context1.name,
      mainActivity: context1.mainActivity,
      sector: context1.sector,
      userType: context1.userType,
      city: context1.city,
      technicalLevel: context1.technicalLevel,
      objectives: context1.objectives,
    }
  );

  await prisma.mvpSpec.create({
    data: {
      opportunityId: opp1.id,
      problem: spec1Data.problem,
      targetUser: spec1Data.targetUser,
      mvpObjective: spec1Data.mvpObjective,
      scope: spec1Data.scope,
      outOfScope: spec1Data.outOfScope,
      features: JSON.stringify(spec1Data.features),
      mainFlow: spec1Data.mainFlow,
      requiredData: spec1Data.requiredData,
      metrics: spec1Data.metrics,
      risks: spec1Data.risks,
      assumptions: spec1Data.assumptions,
      suggestedStack: spec1Data.suggestedStack,
      nextIteration: spec1Data.nextIteration,
      markdownContent: spec1Data.markdownContent,
      generatedBy: spec1Data.generatedBy,
    },
  });

  // Update status for opps with specs
  await prisma.opportunity.update({
    where: { id: opp4.id },
    data: { status: "prioritized" },
  });

  console.log("✅ Seed complete!");
  console.log(`   User: ops@contextops.dev / contextops2024`);
  console.log(`   Contexts: 2`);
  console.log(`   Opportunities: 6`);
  console.log(`   Backlog items: 5`);
  console.log(`   MVP Specs: 2`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
