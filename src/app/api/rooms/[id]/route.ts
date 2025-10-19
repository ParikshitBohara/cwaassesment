import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // force Node runtime on Vercel

type Params = { params: { id: string } };

// GET /api/rooms/:id
export async function GET(_: Request, { params }: Params) {
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!room)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(room);
}

// PUT /api/rooms/:id
// Body same shape as POST /api/rooms
export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const bgImage = String(body?.bgImage ?? "").trim();
    const timerNum = Number(body?.timer); // coerce to number
    const stagesIn = Array.isArray(body?.stages) ? body.stages : [];

    if (!title || !bgImage || !Number.isFinite(timerNum)) {
      return NextResponse.json(
        { error: "title, timer, bgImage are required" },
        { status: 400 }
      );
    }

    // delete old stages before recreating new ones
    await prisma.stage.deleteMany({ where: { roomId: params.id } });

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
        title,
        timer: Math.max(0, Math.floor(timerNum)),
        bgImage,
        stages: {
          create: stagesIn.map((s: any, i: number) => ({
            order: Number.isFinite(s?.order) ? s.order : i,
            title: String(s?.title ?? `Stage ${i + 1}`),
            type: String(s?.type ?? "question"),
            question: s?.question ?? null,
            correctAnswer: s?.correctAnswer ?? null,
            hotspotX: s?.hotspotX ?? null,
            hotspotY: s?.hotspotY ?? null,
          })),
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PUT /api/rooms error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/rooms/:id
export async function DELETE(_: Request, { params }: Params) {
  try {
    await prisma.stage.deleteMany({ where: { roomId: params.id } });
    await prisma.room.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/rooms error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
