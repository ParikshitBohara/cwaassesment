import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/progress?studentNumber=xxxx
export async function GET(req: NextRequest) {
  const studentNumber = req.nextUrl.searchParams.get("studentNumber");
  if (!studentNumber) {
    return NextResponse.json({ error: "studentNumber required" }, { status: 400 });
  }

  const latest = await prisma.progress.findFirst({
    where: { studentNumber },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(latest ?? null);
}

// POST /api/progress  (create fresh row)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.studentNumber) {
    return NextResponse.json({ error: "studentNumber required" }, { status: 400 });
  }
  const { studentNumber, stage1, stage2, stage3, elapsedSeconds } = body;

  const saved = await prisma.progress.create({
    data: {
      studentNumber,
      stage1: !!stage1,
      stage2: !!stage2,
      stage3: !!stage3,
      elapsedSeconds: Number(elapsedSeconds ?? 0),
    },
  });

  return NextResponse.json(saved, { status: 201 });
}

// PUT /api/progress  (upsert latest row for this studentNumber)
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.studentNumber) {
    return NextResponse.json({ error: "studentNumber required" }, { status: 400 });
  }
  const { studentNumber, stage1, stage2, stage3, elapsedSeconds } = body;

  const existing = await prisma.progress.findFirst({
    where: { studentNumber },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  const saved = existing
    ? await prisma.progress.update({
        where: { id: existing.id },
        data: {
          stage1: !!stage1,
          stage2: !!stage2,
          stage3: !!stage3,
          elapsedSeconds: Number(elapsedSeconds ?? 0),
        },
      })
    : await prisma.progress.create({
        data: {
          studentNumber,
          stage1: !!stage1,
          stage2: !!stage2,
          stage3: !!stage3,
          elapsedSeconds: Number(elapsedSeconds ?? 0),
        },
      });

  return NextResponse.json(saved);
}

// DELETE /api/progress?studentNumber=xxxx  (optional helper)
export async function DELETE(req: NextRequest) {
  const studentNumber = req.nextUrl.searchParams.get("studentNumber");
  if (!studentNumber) {
    return NextResponse.json({ error: "studentNumber required" }, { status: 400 });
  }

  await prisma.progress.deleteMany({ where: { studentNumber } });
  return NextResponse.json({ ok: true });
}
