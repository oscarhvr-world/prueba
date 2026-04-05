import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evidenceSchema } from "@/lib/validations/evidence";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contextId = searchParams.get("contextId");

  const evidences = await prisma.evidence.findMany({
    where: {
      contextId: contextId || undefined,
      context: { userId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: evidences });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = evidenceSchema.safeParse(body);

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

  const evidence = await prisma.evidence.create({
    data: {
      ...result.data,
      url: result.data.url || null,
    },
  });

  return NextResponse.json({ data: evidence }, { status: 201 });
}
