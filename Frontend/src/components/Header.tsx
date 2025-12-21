import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Diet Restaurants", path: "/diet-restaurants" },
    { label: "Contact", path: "/contact" },
    { label: "Choose Plan", path: "/plans" },
    { label: "Login", path: "/login" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full py-4 px-6 md:px-12 lg:px-20 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center z-50">
          <span className="text-2xl font-bold">
            <span className="text-navy">Meal</span>
            <span className="text-lime">plan</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Desktop CTA Button */}
        <Link to="/contact" className="hidden md:block">
          <Button variant="default" size="default">
            Contact Us
          </Button>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-50 p-2 hover:bg-card rounded-lg transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-navy" />
          ) : (
            <Menu className="w-6 h-6 text-navy" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Navigation Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-[280px] bg-card shadow-2xl z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-6">
          {/* Mobile Nav Items */}
          <div className="flex flex-col space-y-2 flex-1">
            {navItems.map((item) => (
              <Link key={item.label} to={item.path} onClick={closeMobileMenu}>
                <Button
                  variant={location.pathname === item.path ? "nav-active" : "nav"}
                  size="sm"
                  className="w-full justify-start text-left"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile CTA Button */}
          <Link to="/contact" onClick={closeMobileMenu} className="mt-4">
            <Button variant="default" size="default" className="w-full">
              Contact Us
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
