import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contextSchema } from "@/lib/validations/context";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await prisma.context.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      evidences: { orderBy: { createdAt: "desc" } },
      opportunities: {
        orderBy: { priorityScore: "desc" },
        include: { _count: { select: { backlogItems: true } }, mvpSpec: true },
      },
    },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  return NextResponse.json({ data: context });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = contextSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.context.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  const context = await prisma.context.update({
    where: { id: params.id },
    data: result.data,
  });

  return NextResponse.json({ data: context });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.context.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  await prisma.context.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Context deleted" });
}
