import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { backlogItemSchema } from "@/lib/validations/backlog";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId");
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  // Get all backlog items for the user's contexts
  const userContextIds = await prisma.context.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const userOpportunityIds = await prisma.opportunity.findMany({
    where: { contextId: { in: userContextIds.map((c) => c.id) } },
    select: { id: true },
  });

  const items = await prisma.backlogItem.findMany({
    where: {
      opportunityId: opportunityId
        ? opportunityId
        : { in: userOpportunityIds.map((o) => o.id) },
      status: status || undefined,
      type: type || undefined,
    },
    include: {
      opportunity: {
        select: { id: true, title: true, context: { select: { name: true } } },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: items });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = backlogItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Verify opportunity ownership if provided
  if (result.data.opportunityId) {
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id: result.data.opportunityId,
        context: { userId: session.user.id },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }
  }

  const item = await prisma.backlogItem.create({
    data: result.data,
  });

  return NextResponse.json({ data: item }, { status: 201 });
}
