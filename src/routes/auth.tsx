import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — THREADMARKET" },
      { name: "description", content: "Sign in or create your account on THREADMARKET." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { login, register, currentUser } = useMarketplace();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (currentUser) {
    if (currentUser.role === "admin") {
      navigate({ to: "/dashboard/admin" });
    } else {
      navigate({ to: "/shop" });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Welcome back!");
        const savedUser = localStorage.getItem("tm_user");
        const role = savedUser ? JSON.parse(savedUser).role : "customer";
        navigate({ to: role === "admin" ? "/dashboard/admin" : "/shop" });
      } else {
        toast.error(result.error || "Invalid credentials.");
      }
    } else {
      if (!name.trim()) {
        toast.error("Please enter your name.");
        setIsLoading(false);
        return;
      }
      const result = await register(email, password, name);
      if (result.success) {
        toast.success("Account created! Start shopping.");
        navigate({ to: "/shop" });
      } else {
        toast.error(result.error || "Registration failed.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-paper border border-ink/5 p-8 md:p-10 rounded-2xl shadow-editorial">
          <div className="flex justify-center mb-8">
            <span className="eyebrow border border-ink/10 rounded-full px-4 py-1.5 bg-bone/50 text-[10px]">
              {isLogin ? "Sign In" : "Create Account"}
            </span>
          </div>

          <h1 className="font-display text-3xl text-center font-medium tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Join Threadmarket"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            {isLogin ? "Sign in to shop and track your orders." : "Create an account to shop and checkout."}
          </p>

          <div className="grid grid-cols-2 border-b border-ink/5 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-3 text-[12px] font-semibold uppercase tracking-widest transition-colors ${isLogin ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-3 text-[12px] font-semibold uppercase tracking-widest transition-colors ${!isLogin ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="eyebrow text-[10px] text-muted-foreground block mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="eyebrow text-[10px] text-muted-foreground block mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="eyebrow text-[10px] text-muted-foreground block mb-2">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 inline-flex items-center justify-center rounded-full bg-ink text-bone font-semibold text-[11px] uppercase tracking-widest transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Processing..." : (
                <span className="flex items-center gap-1">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="size-3.5" />
                </span>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 border-t border-ink/5 pt-6">
              <p className="eyebrow text-[9px] text-muted-foreground text-center mb-3">Admin access</p>
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const result = await login("admin@threadmarket.com", "admin123");
                  if (result.success) {
                    toast.success("Admin logged in");
                    navigate({ to: "/dashboard/admin" });
                  } else {
                    toast.error("Admin login failed. Run seed-db.js first.");
                  }
                  setIsLoading(false);
                }}
                className="h-9 w-full flex items-center justify-center gap-2 rounded-lg bg-bone text-[11px] font-medium border border-ink/5 hover:border-ink/20 transition-all"
              >
                <ShieldCheck className="size-3.5" />
                Admin Sign In
              </button>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
