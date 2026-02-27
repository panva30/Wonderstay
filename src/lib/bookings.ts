export type BookingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Booking {
  id: string;
  listingId: string;
  title: string;
  image: string;
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  guests: number;
  total: number;
  status: BookingStatus;
  cancellationReason?: string;
}

import { mockListings } from "./mock-data";

const l1 = mockListings[0];
const l2 = mockListings[1];
const l3 = mockListings[2];
const l4 = mockListings[3];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    listingId: l2.id,
    title: l2.title,
    image: l2.image,
    location: l2.location,
    country: l2.country,
    startDate: "2026-03-15",
    endDate: "2026-03-19",
    guests: 2,
    total: 60000,
    status: "upcoming",
  },
  {
    id: "b2",
    listingId: l1.id,
    title: l1.title,
    image: l1.image,
    location: l1.location,
    country: l1.country,
    startDate: "2026-02-20",
    endDate: "2026-02-25",
    guests: 4,
    total: 42000,
    status: "ongoing",
  },
  {
    id: "b3",
    listingId: l3.id,
    title: l3.title,
    image: l3.image,
    location: l3.location,
    country: l3.country,
    startDate: "2025-12-10",
    endDate: "2025-12-12",
    guests: 2,
    total: 15000,
    status: "completed",
  },
  {
    id: "b4",
    listingId: l4.id,
    title: l4.title,
    image: l4.image,
    location: l4.location,
    country: l4.country,
    startDate: "2026-01-10",
    endDate: "2026-01-15",
    guests: 2,
    total: 90000,
    status: "cancelled",
    cancellationReason: "Change of plans",
  },
];
