import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, ensureSupabaseConnectivity } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, MapPin, X, Plus, Info, Image as ImageIcon } from "lucide-react";
import { CATEGORIES, SEASONS, AMENITIES } from "@/lib/types";

export default function AddResortPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "Mountain",
    season: "All",
    capacity_guests: 2,
    capacity_beds: 1,
    capacity_baths: 1,
    amenities: [] as string[],
    coordinates: "77.1892, 32.2396", // Default Manali
    railway: "",
    bus: "",
    airport: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 5) {
      toast.error("Please upload at least 5 images");
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Starting resort registration...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      console.log("👤 User session found:", session.user.id);

      const ok = await ensureSupabaseConnectivity();
      if (!ok) throw new Error("Database connection failed. Please check your Supabase credentials.");
      console.log("📡 Database connection confirmed");

      // 1. Upload images
      const imageUrls: string[] = [];
      const resortId = window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      console.log("🆔 Generated Resort ID:", resortId);

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        console.log(`📸 Uploading image ${i + 1}/${images.length}: ${file.name}`);
        const ext = file.name.split(".").pop();
        const path = `${resortId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("resort-images")
          .upload(path, file);

        if (uploadError) {
          console.error(`❌ Upload error for image ${i + 1}:`, uploadError);
          throw uploadError;
        }
        console.log(`✅ Uploaded image ${i + 1} to:`, uploadData?.path);

        const { data } = supabase.storage.from("resort-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      console.log("📝 Inserting resort data into database...");
      // 2. Insert resort data
      const coords = formData.coordinates.split(",").map(c => parseFloat(c.trim()));
      
      const resortPayload = {
        id: resortId,
        owner_id: session.user.id,
        owner_name: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "Owner",
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        location: formData.location,
        category: formData.category,
        season: formData.season,
        capacity_guests: formData.capacity_guests,
        capacity_beds: formData.capacity_beds,
        capacity_baths: formData.capacity_baths,
        amenities: formData.amenities,
        coordinates: coords,
        image: imageUrls[0],
        gallery: imageUrls,
        transport_info: {
          railway: formData.railway,
          bus: formData.bus,
          airport: formData.airport
        }
      };
      console.log("📦 Payload:", resortPayload);

      const { error: insertError } = await supabase.from("resorts").insert(resortPayload);

      if (insertError) {
        console.error("❌ Database insertion error:", insertError);
        throw insertError;
      }

      console.log("🎉 Resort registration successful!");
      toast.success("Resort registered successfully!");
      navigate("/owner/dashboard");
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      toast.error(error.message || "Failed to register resort");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <button 
          onClick={() => navigate("/owner/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="section-title text-3xl mb-1">Register New Resort</h1>
        <p className="text-muted-foreground">Fill in the details to list your property</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info size={20} className="text-primary" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resort Title</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Blue Lagoon Retreat"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price per Night (₹)</label>
              <input 
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="8500"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                required
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your resort, its features, and why guests should stay here..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location (City, State)</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Manali, Himachal Pradesh"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coordinates (Lng, Lat)</label>
              <input 
                required
                name="coordinates"
                value={formData.coordinates}
                onChange={handleChange}
                placeholder="77.1892, 32.2396"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* Categories & Seasons */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Best Season</label>
              <select 
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Capacity
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Guests</label>
              <input 
                type="number"
                name="capacity_guests"
                value={formData.capacity_guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beds</label>
              <input 
                type="number"
                name="capacity_beds"
                value={formData.capacity_beds}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Baths</label>
              <input 
                type="number"
                name="capacity_baths"
                value={formData.capacity_baths}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.amenities.includes(amenity as any)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon size={20} className="text-primary" />
            Photos
          </h2>
          <p className="text-sm text-muted-foreground">Upload at least 5 high-quality photos. The first photo will be your main cover image.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] py-0.5 text-center font-bold">COVER</div>
                )}
              </div>
            ))}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <Plus size={24} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Add Photo</span>
            </button>
          </div>
          <input 
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Transport Info */}
        <div className="booking-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload size={20} className="text-primary" />
            Transport Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nearest Railway Station</label>
              <input 
                name="railway"
                value={formData.railway}
                onChange={handleChange}
                placeholder="Joginder Nagar Station (165 km)"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nearest Bus Stand</label>
              <input 
                name="bus"
                value={formData.bus}
                onChange={handleChange}
                placeholder="Manali Bus Stand (2.5 km)"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nearest Airport</label>
              <input 
                name="airport"
                value={formData.airport}
                onChange={handleChange}
                placeholder="Kullu-Manali Airport (50 km)"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate("/owner/dashboard")}
            className="btn-outline px-8 py-3 rounded-xl"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn-primary px-12 py-3 rounded-xl"
            disabled={loading}
          >
            {loading ? "Registering..." : "List Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
