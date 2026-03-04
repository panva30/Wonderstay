insert into public.resorts (title, description, image, gallery, price, location, country, category, season, amenities, capacity_guests, capacity_beds, capacity_baths, avg_rating, review_count, owner_name, coordinates)
values
('Alpine Panorama Lodge', 'Mountain retreat with panoramic views', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', array[
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429'
], 8500, 'Manali', 'India', 'Mountain', 'Winter', array['WiFi','Fireplace','Kitchen','Parking','TV'], 6, 3, 2, 4.8, 124, 'Rahul Sharma', array[77.1892,32.2396]),
('Coral Bay Beach Villa', 'Beachfront villa with infinity pool', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', array[
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1493558103817-58b2924bce98',
  'https://images.unsplash.com/photo-1493558103817-58b2924bce98?ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef'
], 15000, 'Goa', 'India', 'BeachFront', 'All', array['WiFi','AC','Pool','Breakfast','Parking','TV','Kitchen'], 8, 4, 3, 4.9, 203, 'Priya Patel', array[73.7577,15.5004]),
('Sahara Starlight Camp', 'Luxury desert glamping under the stars', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', array[
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429'
], 6500, 'Jaisalmer', 'India', 'Desert', 'Winter', array['Breakfast','AC','WiFi'], 2, 1, 1, 4.7, 89, 'Vikram Singh', array[70.9083,26.9157]),
('Turquoise Lagoon Overwater Suite', 'Overwater bungalow in turquoise lagoon', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429', array[
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef',
  'https://images.unsplash.com/photo-1493558103817-58b2924bce98',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
], 22000, 'Lakshadweep', 'India', 'Island', 'Summer', array['WiFi','AC','Breakfast','Spa','Pool'], 4, 2, 2, 4.95, 67, 'Ananya Nair', array[72.6358,10.5667]),
('Enchanted Canopy Retreat', 'Treehouse among lush rainforest canopy', 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef', array[
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429'
], 9800, 'Wayanad', 'India', 'Treehouse', 'Monsoon', array['WiFi','Breakfast','Garden','Pet Friendly'], 4, 2, 1, 4.85, 156, 'Meera Krishnan', array[76.0324,11.6854]);

insert into public.reviews (listing_id, author_name, comment, rating)
select r.id, 'Aisha Khan', 'Magical lodge with breathtaking views', 5 from public.resorts r where r.title = 'Alpine Panorama Lodge';
insert into public.reviews (listing_id, author_name, comment, rating)
select r.id, 'Rohan Gupta', 'Cozy interiors and perfect fireplace', 4 from public.resorts r where r.title = 'Alpine Panorama Lodge';
insert into public.reviews (listing_id, author_name, comment, rating)
select r.id, 'Dev Kapoor', 'Paradise villa, surreal infinity pool', 5 from public.resorts r where r.title = 'Coral Bay Beach Villa';
insert into public.reviews (listing_id, author_name, comment, rating)
select r.id, 'Nisha Reddy', 'Beautiful beach and great breakfast', 5 from public.resorts r where r.title = 'Coral Bay Beach Villa';

-- Seed bookings demonstrating adjacency (no overlap) and conflict attempts
-- Adjacent: 2026-03-10..15 and 2026-03-15..19 for the same listing
insert into public.bookings (listing_id, start_date, end_date, guests, total, status)
select r.id, '2026-03-10', '2026-03-15', 2, 30000, 'upcoming' from public.resorts r where r.title = 'Alpine Panorama Lodge';
insert into public.bookings (listing_id, start_date, end_date, guests, total, status)
select r.id, '2026-03-15', '2026-03-19', 2, 36000, 'upcoming' from public.resorts r where r.title = 'Alpine Panorama Lodge';
-- Attempted conflict (will be blocked by exclusion constraint if applied)
insert into public.bookings (listing_id, start_date, end_date, guests, total, status)
select r.id, '2026-03-14', '2026-03-16', 2, 24000, 'upcoming' from public.resorts r where r.title = 'Alpine Panorama Lodge';
