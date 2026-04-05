import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evidenceSchema } from "@/lib/validations/evidence";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const evidence = await prisma.evidence.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
  });

  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  return NextResponse.json({ data: evidence });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const existing = await prisma.evidence.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  const evidence = await prisma.evidence.update({
    where: { id: params.id },
    data: {
      ...result.data,
      url: result.data.url || null,
    },
  });

  return NextResponse.json({ data: evidence });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.evidence.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  await prisma.evidence.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Evidence deleted" });
}
