export const Footer = () => {
  return (
    <footer className="w-full px-6 md:px-12 lg:px-20 py-12 mt-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold">
              <span className="text-navy">Meal</span>
              <span className="text-lime">plan</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Home</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Services</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 Mealplan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
