import { describe, it, expect } from "vitest";
import { validateAndInsertAtomic } from "../../app/api/bookings/route";

function makeClient(existing: any[], insertError?: any) {
  return {
    from: (_: string) => ({
      select: (_cols: string) => ({
        eq: (_col: string, _val: any) => ({
          in: (_col: string, _vals: any[]) => ({
            data: existing,
            error: null,
          }),
        }),
      }),
      insert: (_rows: any[]) => ({
        select: (_: string) => ({
          single: () => ({
            data: insertError ? null : { id: "new-id" },
            error: insertError || null,
          }),
        }),
      }),
    }),
  } as any;
}

describe("validateAndInsertAtomic", () => {
  it("rejects invalid input", async () => {
    const res = await validateAndInsertAtomic({ listing_id: "x", start_date: "2026-03-20", end_date: "2026-03-19" }, makeClient([]));
    expect(res.status).toBe(400);
  });

  it("conflict when overlapping", async () => {
    const existing = [{ start_date: "2026-03-15", end_date: "2026-03-19", status: "upcoming" }];
    const res = await validateAndInsertAtomic({ listing_id: "x", start_date: "2026-03-18", end_date: "2026-03-20" }, makeClient(existing));
    expect(res.status).toBe(409);
  });

  it("allow adjacent", async () => {
    const existing = [{ start_date: "2026-03-15", end_date: "2026-03-19", status: "upcoming" }];
    const res = await validateAndInsertAtomic({ listing_id: "x", start_date: "2026-03-19", end_date: "2026-03-21" }, makeClient(existing));
    expect(res.status).toBe(201);
    expect(res.data?.id).toBe("new-id");
  });

  it("handles exclusion violation", async () => {
    const error = { code: "23P01", message: "exclusion constraint violation" };
    const res = await validateAndInsertAtomic({ listing_id: "x", start_date: "2026-03-10", end_date: "2026-03-12" }, makeClient([], error));
    expect(res.status).toBe(409);
  });
});
