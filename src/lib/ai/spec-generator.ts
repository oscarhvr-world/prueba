// TODO: Replace mock with OpenAI Responses API call
// Interface is ready - just swap the implementation

import { generateSpecMarkdown } from "@/lib/utils/markdown";
import type { MvpSpecData, OpportunityInput, ContextInput } from "./types";

export async function generateMvpSpec(
  opportunity: OpportunityInput,
  context: ContextInput
): Promise<MvpSpecData> {
  // Mock implementation - generates realistic spec content
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  const features = generateFeatures(opportunity, context);
  const mainFlow = generateMainFlow(opportunity, context);
  const suggestedStack = generateStack(opportunity);

  const specData = {
    problem: `${context.name || "The organization"} faces challenges related to ${opportunity.description.toLowerCase()}. ${opportunity.painResolved ? `This causes: ${opportunity.painResolved}` : "This impacts operational efficiency and growth potential."}`,
    targetUser: `${context.userType || "Business owner"} at ${context.name}${context.city ? ` in ${context.city}` : ""}${context.sector ? `, operating in the ${context.sector} sector` : ""}. Technical level: ${context.technicalLevel || "intermediate"}.`,
    mvpObjective: `Build a minimal viable solution to ${opportunity.title.toLowerCase()} that delivers measurable value within 4-6 weeks. Focus on core functionality that directly addresses the identified pain points.`,
    scope: `The MVP will cover: ${features.slice(0, 3).join(", ")}. Designed for ${context.technicalLevel || "intermediate"} technical users with minimal onboarding required.`,
    outOfScope: `Advanced analytics, third-party integrations beyond core requirements, mobile native apps, and multi-tenant architecture are excluded from this MVP.`,
    features,
    mainFlow,
    requiredData: `- User authentication and session management\n- ${opportunity.category === "reporting" ? "Historical data import (CSV/Excel)" : "Core entity data (CRUD operations)"}\n- Configuration and settings storage\n- Activity logs for audit trail`,
    metrics: `- Time saved per week vs current process\n- ${opportunity.valueType === "revenue" ? "Revenue attributed to feature" : opportunity.valueType === "cost_reduction" ? "Cost reduction percentage" : "User adoption rate"}\n- Error rate reduction\n- User satisfaction score (NPS)\n- Time to complete core task`,
    risks: `- **Technical**: Integration complexity with existing tools may require additional development time\n- **Adoption**: Users may resist changing established workflows - mitigation: phased rollout with training\n- **Data quality**: Existing data may need cleaning before import\n- **Scope creep**: Clear definition of MVP boundaries must be maintained`,
    assumptions: `- Users have basic computer skills and access to a web browser\n- Internet connectivity is available at point of use\n- Existing data can be exported for import into the new system\n- The team has 2-4 hours/week for testing and feedback during development`,
    suggestedStack,
    nextIteration: `After MVP validation:\n1. Advanced reporting and data visualization\n2. Mobile-responsive design improvements\n3. Third-party integrations (${opportunity.affectedChannel || "relevant tools"})\n4. AI-powered recommendations\n5. Multi-user collaboration features`,
  };

  const markdownContent = generateSpecMarkdown({
    title: opportunity.title,
    ...specData,
  });

  return {
    ...specData,
    markdownContent,
    generatedBy: "mock",
  };
}

function generateFeatures(
  opportunity: OpportunityInput,
  context: ContextInput
): string[] {
  void context; // available for future use
  const baseFeatures: Record<string, string[]> = {
    automation: [
      "Automated trigger configuration for repetitive tasks",
      "Visual workflow builder with step-by-step setup",
      "Execution history and error logging",
      "Email/Slack notification on completion or failure",
      "Scheduling with cron-style configuration",
    ],
    reporting: [
      "Dashboard with key metrics and KPIs",
      "Data import from existing sources (CSV/API)",
      "Customizable date range filters",
      "Export to PDF and Excel formats",
      "Scheduled report delivery via email",
    ],
    acquisition: [
      "Lead capture forms with CRM integration",
      "Lead scoring based on behavioral signals",
      "Automated follow-up sequences",
      "Conversion funnel visualization",
      "A/B testing for landing pages",
    ],
    sales: [
      "Sales pipeline board (Kanban-style)",
      "Deal tracking with stages and probability",
      "Contact and account management",
      "Activity log (calls, emails, meetings)",
      "Revenue forecasting dashboard",
    ],
    operations: [
      "Task and project management board",
      "Resource allocation and capacity tracking",
      "Process documentation and SOPs",
      "Team communication and status updates",
      "Performance metrics per team member",
    ],
    digital_presence: [
      "Website/content management interface",
      "SEO metadata management",
      "Social media scheduling integration",
      "Analytics dashboard (Google Analytics/native)",
      "Contact form and inquiry management",
    ],
    digital_product: [
      "User registration and authentication",
      "Core product feature implementation",
      "User onboarding flow",
      "Basic admin panel for management",
      "Usage analytics and events tracking",
    ],
  };

  return (
    baseFeatures[opportunity.category] || [
      "Core feature implementation",
      "User interface and navigation",
      "Data management (CRUD operations)",
      "Basic reporting and export",
      "User settings and configuration",
    ]
  );
}

function generateMainFlow(
  opportunity: OpportunityInput,
  context: ContextInput
): string {
  return `1. **User Access**: ${context.userType || "User"} logs into the system with their credentials
2. **Dashboard Overview**: Main screen shows current status, recent activity, and key metrics
3. **Core Action**: User initiates the primary workflow for ${opportunity.title.toLowerCase()}
4. **Data Entry/Processing**: System processes the input and validates data integrity
5. **Feedback Loop**: System provides immediate feedback on success/failure with actionable next steps
6. **Result Storage**: Data is persisted and available for future reference and reporting
7. **Notification**: Relevant stakeholders receive updates based on configured preferences`;
}

function generateStack(opportunity: OpportunityInput): string {
  const stacks: Record<string, string> = {
    automation: `- **Runtime**: Node.js with TypeScript\n- **Queue**: BullMQ with Redis\n- **Database**: PostgreSQL\n- **Frontend**: Next.js + React\n- **Deployment**: Vercel + Railway`,
    reporting: `- **Frontend**: Next.js + React + Recharts/Chart.js\n- **Database**: PostgreSQL with read replicas\n- **Cache**: Redis for dashboard queries\n- **Export**: Puppeteer for PDF, xlsx library\n- **Deployment**: Vercel + Supabase`,
    digital_product: `- **Framework**: Next.js 14 (App Router)\n- **Database**: PostgreSQL + Prisma\n- **Auth**: NextAuth.js\n- **Styling**: Tailwind CSS\n- **Deployment**: Vercel`,
  };

  return (
    stacks[opportunity.category] ||
    `- **Framework**: Next.js 14 (App Router) with TypeScript\n- **Database**: PostgreSQL with Prisma ORM\n- **Auth**: NextAuth.js\n- **Styling**: Tailwind CSS + shadcn/ui\n- **Deployment**: Vercel + Railway (database)`
  );
}
