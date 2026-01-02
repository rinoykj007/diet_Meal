import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const intendedRole = searchParams.get("role");

    if (token) {
      localStorage.setItem("token", token);

      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data._id) {
            localStorage.setItem("user", JSON.stringify(data));

            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google.",
            });

            // Redirect based on INTENDED role from OAuth state
            if (intendedRole === "admin") {
              navigate("/admin/dashboard");
            } else if (intendedRole === "restaurant") {
              navigate("/restaurant/dashboard");
            } else if (intendedRole === "delivery-partner") {
              navigate("/delivery-partner/dashboard");
            } else {
              // Fallback: use actual user role
              if (data.roles?.includes("admin")) {
                navigate("/admin/dashboard");
              } else if (data.roles?.includes("restaurant")) {
                navigate("/restaurant/dashboard");
              } else if (data.roles?.includes("delivery-partner")) {
                navigate("/delivery-partner/dashboard");
              } else {
                navigate("/dashboard");
              }
            }
          } else {
            throw new Error("Failed to fetch user data");
          }
        })
        .catch(() => {
          toast({
            title: "Authentication Error",
            description: "Failed to complete Google sign-in.",
            variant: "destructive",
          });
          navigate("/login");
        });
    } else {
      toast({
        title: "Authentication Error",
        description: "No token received from Google.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          Completing Google sign-in...
        </p>
      </div>
    </div>
  );
}
