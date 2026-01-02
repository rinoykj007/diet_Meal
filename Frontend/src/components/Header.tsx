import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown, User, Store, Truck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Diet Restaurants", path: "/diet-restaurants" },
    { label: "Contact", path: "/contact" },
    { label: "Choose Plan", path: "/plans" },
  ];

  const loginOptions = [
    { label: "User Login", path: "/login", icon: User },
    { label: "Restaurant Login", path: "/login?role=restaurant", icon: Store },
    { label: "Delivery Partner Login", path: "/login?role=delivery-partner", icon: Truck },
  ];

  const signUpOptions = [
    { label: "User Sign Up", path: "/register", icon: User },
    { label: "Restaurant Sign Up", path: "/provider/register", icon: Store },
    { label: "Delivery Partner Sign Up", path: "/delivery-partner/register", icon: Truck },
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

          {/* Login Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="nav" size="sm" className="gap-1">
                Login
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {loginOptions.map((option) => (
                <DropdownMenuItem key={option.path} asChild>
                  <Link to={option.path} className="flex items-center gap-2 cursor-pointer">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sign Up Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="nav" size="sm" className="gap-1">
                Sign Up
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {signUpOptions.map((option) => (
                <DropdownMenuItem key={option.path} asChild>
                  <Link to={option.path} className="flex items-center gap-2 cursor-pointer">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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

            {/* Login Options in Mobile */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                Login As
              </p>
              {loginOptions.map((option) => (
                <Link key={option.path} to={option.path} onClick={closeMobileMenu}>
                  <Button
                    variant="nav"
                    size="sm"
                    className="w-full justify-start text-left gap-2"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Sign Up Options in Mobile */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                Sign Up As
              </p>
              {signUpOptions.map((option) => (
                <Link key={option.path} to={option.path} onClick={closeMobileMenu}>
                  <Button
                    variant="nav"
                    size="sm"
                    className="w-full justify-start text-left gap-2"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                </Link>
              ))}
            </div>
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
