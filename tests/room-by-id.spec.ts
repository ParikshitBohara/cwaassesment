import { test, expect } from "@playwright/test";

test("GET /api/rooms/:id returns a valid room with stages", async ({ request, baseURL }) => {
  const base = baseURL!;

  // 1️⃣ Fetch all rooms
  const list = await request.get(`${base}/api/rooms`);
  expect(list.status()).toBe(200);

  const rooms = await list.json();
  expect(Array.isArray(rooms)).toBeTruthy();
  expect(rooms.length).toBeGreaterThan(0);

  // 2️⃣ Pick the first room
  const first = rooms[0];
  expect(first).toHaveProperty("id");
  expect(first).toHaveProperty("title");

  // 3️⃣ Fetch that room by ID
  const single = await request.get(`${base}/api/rooms/${first.id}`);
  expect(single.status()).toBe(200);

  const data = await single.json();
  expect(data).toHaveProperty("id", first.id);
  expect(data).toHaveProperty("title", first.title);
  expect(Array.isArray(data.stages)).toBeTruthy();

  console.log("✅ Room by ID:", data.id, "has", data.stages.length, "stages");
});
