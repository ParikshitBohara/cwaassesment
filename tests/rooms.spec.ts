import { test, expect } from '@playwright/test';

const now = Date.now();
const examples = [
  { title: `Room A ${now}`, timer: 60,  bgImage: '/test.png', stages: [] },
  { title: `Room B ${now}`, timer: 120, bgImage: '/test.png', stages: [] },
  { title: `Room C ${now}`, timer: 180, bgImage: '/test.png', stages: [] },
];

test('generate three rooms via API and verify list', async ({ request, baseURL }) => {
  const base = baseURL!;

  // create 3 rooms
  for (const room of examples) {
    const res = await request.post(`${base}/api/rooms`, { data: room });
    expect(res.status(), 'POST /api/rooms status').toBe(201);
  }

  // fetch all rooms
  const list = await request.get(`${base}/api/rooms`);
  expect(list.status(), 'GET /api/rooms status').toBe(200);

  const rooms = await list.json();
  const titles = rooms.map((r: any) => r.title);
  for (const ex of examples) {
    expect(titles).toContain(ex.title);
  }
});

// (optional) tidy up so DB doesn't bloat
test.afterAll(async ({ request, baseURL }) => {
  const base = baseURL!;
  const list = await request.get(`${base}/api/rooms`);
  if (list.ok()) {
    const rooms = await list.json();
    const ids = rooms
      .filter((r: any) => examples.some((e) => e.title === r.title))
      .map((r: any) => r.id);
    for (const id of ids) {
      await request.delete(`${base}/api/rooms/${id}`);
    }
  }
});
