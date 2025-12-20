import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const IntegrationSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Dark Integration Card */}
        <div className="bg-navy rounded-3xl p-8 text-navy-foreground">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
            Integration with Calendar & Nutrition Analysis
          </h2>
          
          <div className="flex items-end gap-4">
            {/* Calendar Preview */}
            <div className="bg-card rounded-2xl p-4 w-32 h-28 shadow-card">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${
                      [5, 12, 18, 19, 25].includes(i)
                        ? "bg-lime"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Chart Preview */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-navy-foreground/80">increase nutrition</span>
                <span className="text-lime font-semibold">15%</span>
                <div className="w-5 h-5 bg-lime rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3 text-navy" />
                </div>
              </div>
              
              {/* Simple Line Chart */}
              <svg className="w-full h-16" viewBox="0 0 200 60">
                <path
                  d="M0,50 Q20,45 40,40 T80,35 T120,25 T160,30 T200,20"
                  fill="none"
                  stroke="hsl(68 78% 55%)"
                  strokeWidth="2"
                />
                <circle cx="200" cy="20" r="4" fill="hsl(68 78% 55%)" />
              </svg>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy leading-tight">
            What you need we will provide
          </h2>
          
          <div className="flex items-center gap-3">
            <Button variant="default" size="lg">
              Try for Free
            </Button>
            <Button variant="lime-icon" size="icon">
              <ArrowUpRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
