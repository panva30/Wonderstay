import { supabase, hasSupabaseEnv, ensureSupabaseConnectivity } from "./supabase";

import { mockListings, mockReviews } from "./mock-data";
import type { Listing, Review } from "./types";
import { mockBookings, type Booking } from "./bookings";

function mapResortToListing(data: any): Listing {
  const g = Array.isArray(data.gallery) ? data.gallery.filter(Boolean) : [];
  let gallery = g.length ? g : (data.image ? [data.image] : []);
  
  // Only fill if we have at least one image to replicate
  if (gallery.length > 0) {
    while (gallery.length < 5) gallery.push(gallery[0]);
  }
  
  if (gallery.length > 20) gallery = gallery.slice(0, 20);

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    image: data.image,
    gallery: gallery,
    price: data.price,
    location: data.location,
    country: data.country || "India",
    category: data.category,
    season: data.season,
    amenities: data.amenities || [],
    capacity: {
      guests: data.capacity_guests,
      beds: data.capacity_beds,
      baths: data.capacity_baths,
    },
    avgRating: Number(data.avg_rating) || 0,
    reviewCount: data.review_count || 0,
    owner: {
      name: data.owner_name,
    },
    coordinates: data.coordinates as [number, number],
    transportInfo: data.transport_info,
  };
}

export async function getListings(): Promise<Listing[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return [];
  const { data, error } = await supabase.from("resorts").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapResortToListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!hasSupabaseEnv || !supabase) return null;
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return null;
  const { data, error } = await supabase.from("resorts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapResortToListing(data);
}

export async function getReviews(listingId: string): Promise<Review[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return [];
  const { data, error } = await supabase.from("reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    comment: r.comment,
    rating: r.rating,
    author: { name: r.author_name },
    createdAt: r.created_at,
  }));
}

export async function getBookings(): Promise<Booking[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return [];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*, listing:resorts(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(d => ({
    id: d.id,
    listingId: d.listing_id,
    title: d.listing.title,
    image: d.listing.image,
    location: d.listing.location,
    country: d.listing.country,
    startDate: d.start_date,
    endDate: d.end_date,
    guests: d.guests,
    total: d.total,
    status: d.status
  }));
}

export async function getListingBookings(listingId: string): Promise<Booking[]> {
  if (!hasSupabaseEnv || !supabase) return [];
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return [];
  
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("listing_id", listingId)
    .neq("status", "cancelled");
    
  if (error || !data) return [];
  return data.map(d => ({
    id: d.id,
    listingId: d.listing_id,
    title: "", // Not needed for availability check
    image: "",
    location: "",
    country: "",
    startDate: d.start_date,
    endDate: d.end_date,
    guests: d.guests,
    total: d.total,
    status: d.status
  }));
}

export async function createReview(input: { listing_id: string; author_name: string; comment: string; rating: number }): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseEnv || !supabase) return { ok: false, error: "supabase_not_configured" };
  const ok = await ensureSupabaseConnectivity();
  if (!ok) return { ok: false, error: "supabase_unreachable" };
  
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  const { error } = await supabase.from("reviews").insert([{
    ...input,
    user_id: userId
  }]);
  
  if (error) return { ok: false, error: error.message };
  return { ok: true };
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
