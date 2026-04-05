import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { backlogItemSchema } from "@/lib/validations/backlog";

interface RouteParams {
  params: { id: string };
}

async function verifyOwnership(
  itemId: string,
  userId: string
): Promise<boolean> {
  const item = await prisma.backlogItem.findUnique({
    where: { id: itemId },
    include: {
      opportunity: { include: { context: { select: { userId: true } } } },
    },
  });

  if (!item) return false;
  if (!item.opportunityId) return true; // Items without opportunity are accessible
  return item.opportunity?.context.userId === userId;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const item = await prisma.backlogItem.findUnique({
    where: { id: params.id },
    include: {
      opportunity: {
        select: { id: true, title: true, context: { select: { name: true } } },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ data: item });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owns = await verifyOwnership(params.id, session.user.id);
  if (!owns) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const result = backlogItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const item = await prisma.backlogItem.update({
    where: { id: params.id },
    data: result.data,
  });

  return NextResponse.json({ data: item });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owns = await verifyOwnership(params.id, session.user.id);
  if (!owns) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const item = await prisma.backlogItem.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ data: item });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owns = await verifyOwnership(params.id, session.user.id);
  if (!owns) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.backlogItem.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Item deleted" });
}
