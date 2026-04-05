import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { opportunitySchema } from "@/lib/validations/opportunity";
import { calculatePriorityScore } from "@/lib/utils/scoring";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contextId = searchParams.get("contextId");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const opportunities = await prisma.opportunity.findMany({
    where: {
      context: { userId: session.user.id },
      contextId: contextId || undefined,
      category: category || undefined,
      status: status || undefined,
    },
    include: {
      context: { select: { name: true } },
      _count: { select: { backlogItems: true } },
      mvpSpec: { select: { id: true } },
    },
    orderBy: { priorityScore: "desc" },
  });

  return NextResponse.json({ data: opportunities });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = opportunitySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Verify context ownership
  const context = await prisma.context.findFirst({
    where: { id: result.data.contextId, userId: session.user.id },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  // Get user settings for weights
  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  const priorityScore = calculatePriorityScore(
    result.data.impact,
    result.data.urgency,
    result.data.confidence,
    result.data.pain,
    result.data.effort,
    settings || undefined
  );

  const opportunity = await prisma.opportunity.create({
    data: {
      ...result.data,
      priorityScore,
    },
  });

  return NextResponse.json({ data: opportunity }, { status: 201 });
}
