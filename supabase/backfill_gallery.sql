-- Ensure at least 5 images and at most 20 images in resorts.gallery
update public.resorts
set gallery = array_fill(image, array[5])
where (gallery is null or array_length(gallery,1) is null or array_length(gallery,1) < 5);

update public.resorts
set gallery = gallery[1:20]
where array_length(gallery,1) > 20;

-- Optional: move hero image to first position in gallery if missing
update public.resorts
set gallery = array_prepend(image, gallery)
where not (gallery @> array[image]);
