import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/logger"; 

export const runtime = "nodejs"; // force Node runtime on Vercel

type Params = { params: { id: string } };

// ================================================================
// GET /api/rooms/:id
// ================================================================
export async function GET(_: Request, { params }: Params) {
  logEvent("GET /api/rooms/:id called", { id: params.id });

  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    if (!room) {
      logEvent("GET /api/rooms/:id not found", { id: params.id });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    logEvent("GET /api/rooms/:id success", {
      id: params.id,
      stages: room.stages.length,
    });
    return NextResponse.json(room);
  } catch (e: any) {
    logEvent("GET /api/rooms/:id error", { error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ================================================================
// PUT /api/rooms/:id
// ================================================================
export async function PUT(req: Request, { params }: Params) {
  logEvent("PUT /api/rooms/:id called", { id: params.id });

  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const bgImage = String(body?.bgImage ?? "").trim();
    const timerNum = Number(body?.timer);
    const stagesIn = Array.isArray(body?.stages) ? body.stages : [];

    if (!title || !bgImage || !Number.isFinite(timerNum)) {
      logEvent("PUT /api/rooms/:id invalid data", {
        id: params.id,
        title,
        timerNum,
        bgImage,
      });
      return NextResponse.json(
        { error: "title, timer, bgImage are required" },
        { status: 400 }
      );
    }

    // delete old stages before recreating new ones
    await prisma.stage.deleteMany({ where: { roomId: params.id } });
    logEvent("Deleted old stages", { id: params.id });

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

    logEvent("PUT /api/rooms/:id success", {
      id: updated.id,
      stages: updated.stages.length,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    logEvent("PUT /api/rooms/:id error", { id: params.id, error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ================================================================
// DELETE /api/rooms/:id
// ================================================================
export async function DELETE(_: Request, { params }: Params) {
  logEvent("DELETE /api/rooms/:id called", { id: params.id });

  try {
    await prisma.stage.deleteMany({ where: { roomId: params.id } });
    await prisma.room.delete({ where: { id: params.id } });

    logEvent("DELETE /api/rooms/:id success", { id: params.id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    logEvent("DELETE /api/rooms/:id error", { id: params.id, error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
