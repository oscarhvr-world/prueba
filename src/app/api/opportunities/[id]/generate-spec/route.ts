import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateMvpSpec } from "@/lib/ai/spec-generator";

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
    include: { context: true },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

  // Check if spec already exists
  const existingSpec = await prisma.mvpSpec.findUnique({
    where: { opportunityId: params.id },
  });

  if (existingSpec) {
    return NextResponse.json({ data: existingSpec });
  }

  // Generate spec using AI (mocked)
  const specData = await generateMvpSpec(
    {
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      category: opportunity.category,
      solutionProposal: opportunity.solutionProposal,
      painResolved: opportunity.painResolved,
      valueType: opportunity.valueType,
    },
    {
      name: opportunity.context.name,
      mainActivity: opportunity.context.mainActivity,
      sector: opportunity.context.sector,
      userType: opportunity.context.userType,
      city: opportunity.context.city,
      technicalLevel: opportunity.context.technicalLevel,
      objectives: opportunity.context.objectives,
    }
  );

  const spec = await prisma.mvpSpec.create({
    data: {
      opportunityId: params.id,
      problem: specData.problem,
      targetUser: specData.targetUser,
      mvpObjective: specData.mvpObjective,
      scope: specData.scope,
      outOfScope: specData.outOfScope,
      features: JSON.stringify(specData.features),
      mainFlow: specData.mainFlow,
      requiredData: specData.requiredData,
      metrics: specData.metrics,
      risks: specData.risks,
      assumptions: specData.assumptions,
      suggestedStack: specData.suggestedStack,
      nextIteration: specData.nextIteration,
      markdownContent: specData.markdownContent,
      generatedBy: specData.generatedBy,
    },
  });

  // Update opportunity status to prioritized if it's identified
  if (opportunity.status === "identified") {
    await prisma.opportunity.update({
      where: { id: params.id },
      data: { status: "prioritized" },
    });
  }

  return NextResponse.json({ data: spec }, { status: 201 });
}
