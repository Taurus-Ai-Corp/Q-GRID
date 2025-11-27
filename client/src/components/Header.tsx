import { Home, Users, Grid3x3, LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Hide header on Q-Grid landing page
  if (location === "/") {
    return null;
  }

  const navItems = [
    { path: "/app", icon: Home, label: "HOME" },
    { path: "/app/accounts", icon: Users, label: "ACCOUNTS" },
    { path: "/app/services", icon: Grid3x3, label: "SERVICES" },
  ];

  const handleLogout = () => {
    if (confirm("Sign out of Q_GRID platform?")) {
      window.location.href = "/api/logout";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black text-accent">Q-GRID™</div>
            <div className="hidden md:block text-gray-500 text-[13px]">Taurus AI Corp.</div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase transition-all border-2 ${
                  location === item.path
                    ? "bg-accent text-black border-accent"
                    : "bg-black text-white border-gray-700 hover:border-accent hover:text-accent"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 px-3 py-2 border-2 border-accent text-accent text-sm">
                {(user as UserType).profileImageUrl ? (
                  <img
                    src={(user as UserType).profileImageUrl!}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                    data-testid="user-profile-image"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="hidden sm:inline font-bold" data-testid="user-name-display">
                  {(user as UserType).firstName || (user as UserType).email?.split("@")[0] || "User"}
                </span>
              </div>
            ) : null}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase bg-red-900 text-white border-2 border-red-700 hover:bg-red-800 transition-all"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
