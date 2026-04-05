import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { opportunitySchema } from "@/lib/validations/opportunity";
import { calculatePriorityScore } from "@/lib/utils/scoring";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
    include: {
      context: true,
      backlogItems: { orderBy: { createdAt: "asc" } },
      mvpSpec: true,
    },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: opportunity });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const existing = await prisma.opportunity.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

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

  const opportunity = await prisma.opportunity.update({
    where: { id: params.id },
    data: { ...result.data, priorityScore },
  });

  return NextResponse.json({ data: opportunity });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.opportunity.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

  await prisma.opportunity.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Opportunity deleted" });
}
