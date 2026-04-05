import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  impactWeight: z.number().min(0).max(1),
  urgencyWeight: z.number().min(0).max(1),
  confidenceWeight: z.number().min(0).max(1),
  painWeight: z.number().min(0).max(1),
  effortWeight: z.number().min(0).max(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        userId: session.user.id,
        impactWeight: 0.35,
        urgencyWeight: 0.20,
        confidenceWeight: 0.15,
        painWeight: 0.20,
        effortWeight: 0.10,
      },
    });
  }

  return NextResponse.json({ data: settings });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = settingsSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const settings = await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: result.data,
    create: {
      userId: session.user.id,
      ...result.data,
    },
  });

  return NextResponse.json({ data: settings });
}
