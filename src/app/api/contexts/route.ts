import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contextSchema } from "@/lib/validations/context";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contexts = await prisma.context.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { evidences: true, opportunities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: contexts });
}

export async function POST(request: NextRequest) {
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

  const context = await prisma.context.create({
    data: {
      ...result.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ data: context }, { status: 201 });
}
