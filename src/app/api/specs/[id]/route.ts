import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spec = await prisma.mvpSpec.findFirst({
    where: {
      id: params.id,
      opportunity: { context: { userId: session.user.id } },
    },
    include: {
      opportunity: {
        select: {
          id: true,
          title: true,
          category: true,
          context: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  return NextResponse.json({ data: spec });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spec = await prisma.mvpSpec.findFirst({
    where: {
      id: params.id,
      opportunity: { context: { userId: session.user.id } },
    },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  await prisma.mvpSpec.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Spec deleted" });
}
