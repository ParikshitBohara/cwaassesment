import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/rooms
export async function GET() {
  const rooms = await prisma.room.findMany({
    include: { stages: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rooms);
}

// POST /api/rooms
// Body: { title: string, timer: number, bgImage: string, stages: Array<{title,type,question?,correctAnswer?,hotspotX?,hotspotY?}> }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, timer, bgImage, stages } = body;

  if (!title || !Number.isFinite(timer) || !bgImage || !Array.isArray(stages)) {
    return NextResponse.json(
      { error: "title, timer, bgImage, stages[] are required" },
      { status: 400 }
    );
  }

  const room = await prisma.room.create({
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

  return NextResponse.json(room, { status: 201 });
}
