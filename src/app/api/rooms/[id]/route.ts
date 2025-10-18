import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

// GET /api/rooms/:id
export async function GET(_: Request, { params }: Params) {
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

// PUT /api/rooms/:id
// Body same shape as POST /api/rooms
export async function PUT(req: Request, { params }: Params) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, timer, bgImage, stages } = body;

  if (!title || !Number.isFinite(timer) || !bgImage || !Array.isArray(stages)) {
    return NextResponse.json(
      { error: "title, timer, bgImage, stages[] are required" },
      { status: 400 }
    );
  }

  // Replace stages: delete old ones and recreate (simple + reliable)
  await prisma.stage.deleteMany({ where: { roomId: params.id } });

  const updated = await prisma.room.update({
    where: { id: params.id },
    data: {
      title,
      timer: Math.max(0, timer | 0),
      bgImage,
      stages: {
        create: stages.map((s: any, i: number) => ({
          order: i,
          title: String(s.title ?? `Stage ${i + 1}`),
          type: String(s.type ?? "question"),
          question: s.question ?? null,
          correctAnswer: s.correctAnswer ?? null,
          hotspotX: s.hotspotX ?? null,
          hotspotY: s.hotspotY ?? null,
        })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(updated);
}

// DELETE /api/rooms/:id
export async function DELETE(_: Request, { params }: Params) {
  await prisma.stage.deleteMany({ where: { roomId: params.id } });
  await prisma.room.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
