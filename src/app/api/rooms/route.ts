import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // important on Vercel

// GET /api/rooms
export async function GET() {
  const rooms = await prisma.room.findMany({
    include: { stages: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rooms);
}

// POST /api/rooms
// Body: { title: string, timer: number|string, bgImage: string, stages?: Array<...> }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const bgImage = String(body?.bgImage ?? "").trim();
    const timerNum = Number(body?.timer); // coerce "60" -> 60
    const stagesIn = Array.isArray(body?.stages) ? body.stages : [];

    if (!title || !bgImage || !Number.isFinite(timerNum)) {
      return NextResponse.json(
        { error: "title, timer, bgImage are required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
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

    return NextResponse.json(room, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
