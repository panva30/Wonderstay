import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, ensureSupabaseConnectivity } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Hotel, Star, MessageSquare, Trash2, Edit3, TrendingUp, Users, Calendar, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import type { Listing } from "@/lib/types";

export default function OwnerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    avgRating: 0,
    totalViews: 1240, // Placeholder for views
  });
  const navigate = useNavigate();

  const chartData = [
    { name: "Mon", revenue: 4000, bookings: 24 },
    { name: "Tue", revenue: 3000, bookings: 13 },
    { name: "Wed", revenue: 2000, bookings: 98 },
    { name: "Thu", revenue: 2780, bookings: 39 },
    { name: "Fri", revenue: 1890, bookings: 48 },
    { name: "Sat", revenue: 2390, bookings: 38 },
    { name: "Sun", revenue: 3490, bookings: 43 },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to access the dashboard");
        navigate("/login");
        return;
      }
      loadOwnerData(session.user.id);
    };

    const loadOwnerData = async (userId: string) => {
      if (!supabase) return;
      const ok = await ensureSupabaseConnectivity();
      if (!ok) {
        toast.error("Database connection failed");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("resorts")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch your resorts");
      } else {
        const mappedListings = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          price: d.price,
          avgRating: d.avg_rating,
          reviewCount: d.review_count,
          image: d.image,
          location: d.location
        }));
        setListings(mappedListings as any);

        // Calculate basic stats
        const totalRevenue = mappedListings.reduce((acc: number, curr: any) => acc + (curr.price * 5), 0); // Placeholder: 5 bookings each
        const totalBookings = mappedListings.length * 5;
        const avgRating = mappedListings.length > 0 
          ? mappedListings.reduce((acc: number, curr: any) => acc + curr.avgRating, 0) / mappedListings.length
          : 0;

        setStats({
          totalRevenue,
          totalBookings,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalViews: 1240
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    const { error } = await supabase.from("resorts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete listing");
    } else {
      toast.success("Listing deleted successfully");
      setListings(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="page-wrapper py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="section-title text-3xl mb-1 font-display">Owner Dashboard</h1>
          <p className="text-muted-foreground">Monitor performance and manage listings</p>
        </div>
        <div className="flex gap-3">
          <Link to="/owner/add-resort" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-primary/20">
            <Plus size={20} />
            <span>Add New Resort</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Avg. Rating", value: stats.avgRating, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="booking-card p-6 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 booking-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Revenue Growth
            </h2>
            <select className="bg-muted/50 border-none rounded-lg px-3 py-1 text-xs font-medium focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="booking-card p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            Recent Reviews
          </h2>
          <div className="space-y-4">
            {listings.slice(0, 3).map((l, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star size={16} className="text-primary fill-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{l.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    "Amazing experience! The location was perfect and the host was very welcoming..."
                  </p>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No reviews yet</p>
            )}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
            View All Feedback
          </button>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold mb-6 font-display">Your Properties</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="booking-card overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={listing.image} 
                  alt={listing.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => navigate(`/owner/edit-resort/${listing.id}`)}
                    className="p-2 bg-white/90 dark:bg-black/90 rounded-full text-foreground hover:bg-white dark:hover:bg-black transition-colors shadow-sm"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(listing.id)}
                    className="p-2 bg-white/90 dark:bg-black/90 rounded-full text-destructive hover:bg-white dark:hover:bg-black transition-colors shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{listing.location}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{listing.avgRating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare size={14} />
                      <span>{listing.reviewCount}</span>
                    </div>
                  </div>
                  <p className="font-semibold">₹{listing.price.toLocaleString()}<span className="text-xs text-muted-foreground font-normal"> /night</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <Hotel size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No resorts found</h2>
          <p className="text-muted-foreground mb-6">Start by adding your first hotel or resort to the platform.</p>
          <Link to="/owner/add-resort" className="btn-primary px-8 py-3 inline-flex">
            Add Your First Resort
          </Link>
        </div>
      )}
    </div>
  );
}
