import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="page-wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-black opacity-80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 18h20" />
                  <path d="M3 18l5-8 5 8" />
                  <path d="M10 18l3-5 6 5" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold">
                Wonder<span className="text-primary">Stay</span>
              </span>
            </Link>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/listings" className="hover:text-foreground transition-colors">All Listings</Link></li>
              <li><Link to="/listings?category=Mountain" className="hover:text-foreground transition-colors">Mountains</Link></li>
              <li><Link to="/listings?category=BeachFront" className="hover:text-foreground transition-colors">Beaches</Link></li>
              <li><Link to="/listings?category=Treehouse" className="hover:text-foreground transition-colors">Treehouses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 WonderStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
