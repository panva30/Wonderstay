import listingMountain from "@/assets/listing-mountain.jpg";
import listingBeach from "@/assets/listing-beach.jpg";
import listingDesert from "@/assets/listing-desert.jpg";
import listingIsland from "@/assets/listing-island.jpg";
import listingTreehouse from "@/assets/listing-treehouse.jpg";
import listingHillstation from "@/assets/listing-hillstation.jpg";
import type { Listing, Review } from "./types";

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Alpine Panorama Lodge",
    description: "A breathtaking mountain retreat with floor-to-ceiling windows overlooking snow-capped peaks. Perfect for winter adventures and cozy evenings by the fireplace. Features a private hot tub and direct trail access.",
    image: listingMountain,
    gallery: [listingMountain, listingMountain, listingMountain, listingMountain, listingMountain],
    price: 8500,
    location: "Manali",
    country: "India",
    category: "Mountain",
    season: "Winter",
    amenities: ["WiFi", "Fireplace", "Kitchen", "Parking", "TV"],
    capacity: { guests: 6, beds: 3, baths: 2 },
    avgRating: 4.8,
    reviewCount: 124,
    owner: { name: "Rahul Sharma" },
    coordinates: [77.1892, 32.2396],
    transportInfo: {
      railway: "Joginder Nagar Railway Station (165 km)",
      bus: "Manali Bus Stand (2.5 km)",
      airport: "Kullu-Manali Airport (Bhuntar) (50 km)"
    }
  },
  {
    id: "2",
    title: "Coral Bay Beach Villa",
    description: "Wake up to the sound of waves in this stunning beachfront villa with infinity pool. Pristine white sand beach just steps from your door. Enjoy spectacular sunsets from the private terrace.",
    image: listingBeach,
    gallery: [listingBeach, listingBeach, listingBeach, listingBeach, listingBeach],
    price: 15000,
    location: "Goa",
    country: "India",
    category: "BeachFront",
    season: "All",
    amenities: ["WiFi", "AC", "Pool", "Breakfast", "Parking", "TV", "Kitchen"],
    capacity: { guests: 8, beds: 4, baths: 3 },
    avgRating: 4.9,
    reviewCount: 203,
    owner: { name: "Priya Patel" },
    coordinates: [73.7577, 15.5004],
    transportInfo: {
      railway: "Madgaon Junction (35 km)",
      bus: "Panjim Bus Stand (12 km)",
      airport: "Dabolim Airport (28 km)"
    }
  },
  {
    id: "3",
    title: "Sahara Starlight Camp",
    description: "An extraordinary glamping experience under the stars. This luxury desert tent combines traditional Rajasthani hospitality with modern comfort. Includes camel safaris and cultural evenings.",
    image: listingDesert,
    gallery: [listingDesert, listingDesert, listingDesert, listingDesert, listingDesert],
    price: 6500,
    location: "Jaisalmer",
    country: "India",
    category: "Desert",
    season: "Winter",
    amenities: ["Breakfast", "AC", "WiFi"],
    capacity: { guests: 2, beds: 1, baths: 1 },
    avgRating: 4.7,
    reviewCount: 89,
    owner: { name: "Vikram Singh" },
    coordinates: [70.9083, 26.9157],
    transportInfo: {
      railway: "Jaisalmer Railway Station (15 km)",
      bus: "Jaisalmer Bus Stand (14 km)",
      airport: "Jaisalmer Airport (25 km)"
    }
  },
  {
    id: "4",
    title: "Turquoise Lagoon Overwater Suite",
    description: "Experience paradise in this overwater bungalow surrounded by crystal-clear lagoon. Glass floor panels let you watch marine life from your room. Includes private deck with ocean access.",
    image: listingIsland,
    gallery: [listingIsland, listingIsland, listingIsland, listingIsland, listingIsland],
    price: 22000,
    location: "Lakshadweep",
    country: "India",
    category: "Island",
    season: "Summer",
    amenities: ["WiFi", "AC", "Breakfast", "Spa", "Pool"],
    capacity: { guests: 4, beds: 2, baths: 2 },
    avgRating: 4.95,
    reviewCount: 67,
    owner: { name: "Ananya Nair" },
    coordinates: [72.6358, 10.5667],
    transportInfo: {
      railway: "N/A (Island Access only)",
      bus: "N/A",
      airport: "Agatti Airport (by boat/helicopter)"
    }
  },
  {
    id: "5",
    title: "Enchanted Canopy Retreat",
    description: "Live among the treetops in this magical treehouse nestled in a lush rainforest. Connected by rope bridges and adorned with fairy lights. Wake up to birdsong and misty forest views.",
    image: listingTreehouse,
    gallery: [listingTreehouse, listingTreehouse, listingTreehouse, listingTreehouse, listingTreehouse],
    price: 9800,
    location: "Wayanad",
    country: "India",
    category: "Treehouse",
    season: "Monsoon",
    amenities: ["WiFi", "Breakfast", "Garden", "Pet Friendly"],
    capacity: { guests: 4, beds: 2, baths: 1 },
    avgRating: 4.85,
    reviewCount: 156,
    owner: { name: "Meera Krishnan" },
    coordinates: [76.0324, 11.6854],
    transportInfo: {
      railway: "Kozhikode Railway Station (85 km)",
      bus: "Kalpetta Bus Stand (15 km)",
      airport: "Calicut International Airport (95 km)"
    }
  },
  {
    id: "6",
    title: "Heritage Tea Garden Cottage",
    description: "A charming colonial-era cottage surrounded by rolling tea gardens and misty hills. Enjoy morning tea plucking experiences and evening walks through aromatic plantations.",
    image: listingHillstation,
    gallery: [listingHillstation, listingHillstation, listingHillstation, listingHillstation, listingHillstation],
    price: 7200,
    location: "Darjeeling",
    country: "India",
    category: "Hill Station",
    season: "Summer",
    amenities: ["WiFi", "Breakfast", "Kitchen", "Garden", "Fireplace", "Parking"],
    capacity: { guests: 5, beds: 3, baths: 2 },
    avgRating: 4.6,
    reviewCount: 98,
    owner: { name: "Tenzing Dorji" },
    coordinates: [88.2636, 27.0360],
    transportInfo: {
      railway: "New Jalpaiguri (NJP) (70 km)",
      bus: "Darjeeling Bus Stand (3 km)",
      airport: "Bagdogra Airport (75 km)"
    }
  },
];

export const mockReviews: Record<string, Review[]> = {
  "1": [
    { id: "r1", comment: "Absolutely magical! The views from the lodge are indescribable. We spent hours just staring at the mountains.", rating: 5, author: { name: "Aisha Khan" }, createdAt: "2025-12-15" },
    { id: "r2", comment: "Great location, cozy interiors. The fireplace was perfect for cold evenings. Will definitely come back!", rating: 4, author: { name: "Rohan Gupta" }, createdAt: "2025-11-28" },
    { id: "r3", comment: "The host was incredibly welcoming. Fresh mountain air and home-cooked meals made our stay memorable.", rating: 5, author: { name: "Sanya Mehta" }, createdAt: "2025-10-05" },
  ],
  "2": [
    { id: "r4", comment: "Paradise found! The infinity pool blending into the ocean was surreal. Best vacation of my life.", rating: 5, author: { name: "Dev Kapoor" }, createdAt: "2026-01-20" },
    { id: "r5", comment: "Spacious villa, beautiful beach. Breakfast by the pool was a highlight. Highly recommended.", rating: 5, author: { name: "Nisha Reddy" }, createdAt: "2025-12-10" },
  ],
  "5": [
    { id: "r6", comment: "Like living in a fairy tale! The rope bridges and fairy lights create such a magical atmosphere.", rating: 5, author: { name: "Arjun Das" }, createdAt: "2026-02-01" },
    { id: "r7", comment: "Unique experience. Waking up to birdsong in the canopy was incredible. A must-visit!", rating: 5, author: { name: "Kavya Iyer" }, createdAt: "2026-01-15" },
  ],
};
