import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Diet Restaurants", path: "/diet-restaurants" },
    { label: "Contact", path: "/contact" },
    { label: "Choose Plan", path: "/plans" },
    { label: "Login", path: "/login" },
  ];

  return (
    <header className="w-full py-4 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="text-navy">Meal</span>
            <span className="text-lime">plan</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center bg-card rounded-full px-2 py-2 shadow-soft">
          {navItems.map((item) => (
            <Link key={item.label} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "nav-active" : "nav"}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <Link to="/contact">
          <Button variant="default" size="default">
            Contact Us
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
