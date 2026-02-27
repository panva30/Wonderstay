import { motion } from "framer-motion";
import { 
  Bell, 
  ChevronRight, 
  Settings, 
  HelpCircle, 
  User, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  FileText, 
  LogOut, 
  Briefcase, 
  Heart, 
  Search, 
  MessageSquare 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthUser } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function ProfileHeader() {
  const { user, profile } = useAuthUser();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const metaName = typeof meta.full_name === "string" ? (meta.full_name as string) : undefined;
  const name = profile?.full_name || metaName || user?.email || "Guest";
  const initial = (name?.trim()?.charAt(0) || "G").toUpperCase();
  const role = user ? "Member" : "Guest";
  return (
    <CardContent className="p-6 flex flex-col items-center text-center">
      <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-md">
        <AvatarImage src={profile?.avatar_url || ""} />
        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initial}</AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-muted-foreground">{role}</p>
    </CardContent>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: <Settings className="w-5 h-5" />, label: "Account settings", to: "/profile/settings" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Get help", to: "/help" },
    { icon: <User className="w-5 h-5" />, label: "View profile", to: "/profile/view" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Privacy", to: "/privacy" },
    { icon: <UserPlus className="w-5 h-5" />, label: "Refer a host", to: "/refer" },
    { icon: <Users className="w-5 h-5" />, label: "Find a co-host", to: "/co-host" },
    { icon: <FileText className="w-5 h-5" />, label: "Legal", to: "/legal" },
    { icon: <LogOut className="w-5 h-5 text-destructive" />, label: "Log out", to: "/login", isDestructive: true, isLogout: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Profile</h1>
        <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
      </header>

        <div className="page-wrapper py-8 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <ProfileHeader />
          </Card>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Card className="border-none shadow-sm rounded-2xl h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Badge className="absolute top-2 right-2 bg-primary/10 text-primary border-none text-[10px] px-1.5 py-0 font-bold">NEW</Badge>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold">Past trips</span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Card className="border-none shadow-sm rounded-2xl h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Badge className="absolute top-2 right-2 bg-primary/10 text-primary border-none text-[10px] px-1.5 py-0 font-bold">NEW</Badge>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold">Connections</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Become a Host Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="border-none shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Become a host</h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  It's easy to start hosting and earn extra income.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-border/50">
          {menuItems.map((item, index) => (
            item.isLogout ? (
              <button
                key={item.label}
                onClick={async () => {
                  if (supabase) {
                    await supabase.auth.signOut().catch(() => {});
                  }
                  toast.success("Signed out");
                  navigate("/login");
                }}
                className={`w-full text-left flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-destructive">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-destructive">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-destructive/50" />
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={item.isDestructive ? "text-destructive" : "text-foreground"}>
                    {item.icon}
                  </span>
                  <span className={`text-sm font-medium ${item.isDestructive ? "text-destructive" : "text-foreground"}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${item.isDestructive ? "text-destructive/50" : "text-muted-foreground"}`} />
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Bottom Nav Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-6 py-3 flex items-center justify-between md:hidden">
        <Link to="/listings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        <Link to="/favorites" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Wishlists</span>
        </Link>
        <Link to="/bookings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium">Trips</span>
        </Link>
        <Link to="/messages" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-primary transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
