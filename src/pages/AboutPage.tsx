import { motion } from "framer-motion";
import { Heart, Shield, Globe, Award } from "lucide-react";

const values = [
  { icon: <Heart className="w-6 h-6" />, title: "Curated Stays", desc: "Every property is handpicked and verified for quality, comfort, and authentic experiences." },
  { icon: <Shield className="w-6 h-6" />, title: "Secure Booking", desc: "Book with confidence. Secure payments, verified hosts, and 24/7 customer support." },
  { icon: <Globe className="w-6 h-6" />, title: "Local Experiences", desc: "Connect with local hosts who share their culture, cuisine, and hidden gems." },
  { icon: <Award className="w-6 h-6" />, title: "Best Price", desc: "Competitive pricing with no hidden fees. What you see is what you pay." },
];

const members = ["Dev Shanbuag", "Shreyas Sonar", "Pranav Tekade", "Daksh Soni"];

export default function AboutPage() {
  return (
    <div className="page-wrapper py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="section-title text-4xl md:text-5xl mb-4">
          Travel differently with <span className="text-gradient">WonderStay</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We believe every journey should be extraordinary. WonderStay connects travelers with unique, handpicked accommodations across India — from misty mountain lodges to sun-kissed beachfront villas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="booking-card flex gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {v.icon}
            </div>
            <div>
              <h3 className="font-display font-semibold mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-semibold mb-6"
        >
          Project Members
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-5 text-left flex items-center justify-between"
            >
              <span className="font-medium">{name}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Team
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
