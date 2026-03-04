import { supabase, hasSupabaseEnv, ensureSupabaseConnectivity } from "./supabase";
import { mockListings, mockReviews } from "./mock-data";
import type { Listing, Review } from "./types";
import { mockBookings, type Booking } from "./bookings";

function normalizeGallery<T extends { image: string; gallery?: string[] }>(items: T[]): T[] {
  return items.map((l) => {
    const g = Array.isArray(l.gallery) ? l.gallery.filter(Boolean) : [];
    let gallery = g.length ? g : [l.image];
    while (gallery.length < 5) gallery.push(l.image);
    if (gallery.length > 20) gallery = gallery.slice(0, 20);
    return { ...l, gallery };
  });
}

export async function getListings(): Promise<Listing[]> {
  if (!hasSupabaseEnv || !supabase) return mockListings;
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return mockListings;
  const { data, error } = await supabase.from("resorts").select("*").order("created_at", { ascending: false });
  if (error || !data) return mockListings;
  return normalizeGallery(data as unknown as Listing[]);
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!hasSupabaseEnv || !supabase) return mockListings.find((l) => l.id === id) ?? null;
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return mockListings.find((l) => l.id === id) ?? null;
  const { data, error } = await supabase.from("resorts").select("*").eq("id", id).maybeSingle();
  if (error) return mockListings.find((l) => l.id === id) ?? null;
  const item = (data as unknown as Listing) ?? null;
  return item ? normalizeGallery([item])[0] as Listing : null;
}

export async function getReviews(listingId: string): Promise<Review[]> {
  if (!hasSupabaseEnv || !supabase) return mockReviews[listingId] ?? [];
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return mockReviews[listingId] ?? [];
  const { data, error } = await supabase.from("reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  if (error || !data) return mockReviews[listingId] ?? [];
  return data as unknown as Review[];
}

export async function getBookings(): Promise<Booking[]> {
  if (!hasSupabaseEnv || !supabase) return mockBookings;
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return mockBookings;
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error || !data) return mockBookings;
  return data as unknown as Booking[];
}

export async function createBooking(payload: Omit<Booking, "id" | "status"> & { status?: Booking["status"] }): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: payload.listingId,
        start_date: payload.startDate,
        end_date: payload.endDate,
        guests: payload.guests,
        total: payload.total,
        status: payload.status ?? "upcoming",
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.status === 201) {
      return { ok: true, id: j.id };
    }
    if (res.status === 409) {
      return { ok: false, error: j.error || "booking_conflict" };
    }
    return { ok: false, error: j.error || "booking_failed" };
  } catch (e: any) {
    return { ok: false, error: "booking_failed" };
  }
}

export async function sendBookingRequest(input: { listing_id: string; check_in: string; check_out: string; guests: number }): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseEnv || !supabase) return { ok: false, error: "supabase_not_configured" };
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return { ok: false, error: "supabase_unreachable" };
  const { error } = await supabase.from("booking_requests").insert([input]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
