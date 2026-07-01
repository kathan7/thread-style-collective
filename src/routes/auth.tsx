import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, UserCheck, Store, Lock } from "lucide-react";
import { useMarketplace, UserRole } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authenticate — THREADMARKET" },
      { name: "description", content: "Sign in or create your curated collector account on THREADMARKET." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { login, register, currentUser } = useMarketplace();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("customer");
  
  // Form values
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard or home
  if (currentUser) {
    navigate({ to: `/dashboard/${currentUser.role}` });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (isLogin) {
        const success = login(email, role);
        if (success) {
          toast.success(`Welcome back to the archive.`);
          navigate({ to: `/dashboard/${role}` });
        } else {
          toast.error("Authentication failed.");
        }
      } else {
        if (!name) {
          toast.error("Please enter your name.");
          setIsLoading(false);
          return;
        }
        if (role === "seller" && !storeName) {
          toast.error("Please enter your brand storefront name.");
          setIsLoading(false);
          return;
        }
        
        const success = register(email, name, role, role === "seller" ? storeName : undefined);
        if (success) {
          toast.success(`Account registered successfully.`);
          navigate({ to: `/dashboard/${role}` });
        } else {
          toast.error("Registration failed.");
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(demoEmail, demoRole);
      toast.success(`Logged in as Demo ${demoRole.toUpperCase()}`);
      navigate({ to: `/dashboard/${demoRole}` });
      setIsLoading(false);
    }, 600003 - 600000); // quick transition
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />
      
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-paper border border-ink/5 p-8 md:p-10 rounded-2xl shadow-editorial relative overflow-hidden">
          
          {/* Logo Badge */}
          <div className="flex justify-center mb-8">
            <span className="eyebrow border border-ink/10 rounded-full px-4 py-1.5 bg-bone/50 text-[10px]">
              Access the Archive
            </span>
          </div>

          <h1 className="font-display text-4xl text-center font-medium tracking-tight mb-8">
            {isLogin ? "Welcome back." : "Create credentials."}
          </h1>

          {/* Tab selector */}
          <div className="grid grid-cols-2 border-b border-ink/5 mb-8">
            <button
              onClick={() => { setIsLogin(true); }}
              className={`pb-3 text-[12px] font-semibold uppercase tracking-widest transition-colors ${isLogin ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); }}
              className={`pb-3 text-[12px] font-semibold uppercase tracking-widest transition-colors ${!isLogin ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
            >
              Register
            </button>
          </div>

          {/* Role selector (Luxury Radio buttons) */}
          <div className="mb-6">
            <label className="eyebrow text-[10px] text-muted-foreground block mb-3">Select Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "customer", label: "Collector", icon: UserCheck },
                { type: "seller", label: "Atelier / Seller", icon: Store },
                { type: "admin", label: "Moderator", icon: ShieldCheck }
              ].map((r) => {
                const Icon = r.icon;
                const active = role === r.type;
                return (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => setRole(r.type as UserRole)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      active 
                        ? "border-ink bg-ink text-bone" 
                        : "border-ink/10 bg-bone/30 hover:border-ink/30"
                    }`}
                  >
                    <Icon className="size-4 mb-1.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="eyebrow text-[10px] text-muted-foreground block mb-2">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Margot Laurent"
                      className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
                    />
                  </div>

                  {role === "seller" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label htmlFor="store" className="eyebrow text-[10px] text-muted-foreground block mb-2">Storefront Brand Name</label>
                      <input
                        id="store"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Atelier Laurent"
                        className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="eyebrow text-[10px] text-muted-foreground block mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. margot@example.com"
                className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone/50 text-sm focus:outline-none focus:border-ink transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 inline-flex items-center justify-center rounded-full bg-ink text-bone font-semibold text-[11px] uppercase tracking-widest transition hover:opacity-90 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin size-3.5 border-2 border-bone/20 border-t-bone rounded-full" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>{isLogin ? "Authenticate" : "Create Account"}</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 border-t border-ink/5 pt-6">
            <p className="eyebrow text-[9px] text-muted-foreground text-center mb-3.5">
              Rapid Demo Shortcuts
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("customer", "customer@threadmarket.com")}
                className="h-9 w-full flex items-center justify-between px-4 rounded-lg bg-bone text-[11px] font-medium tracking-wide border border-ink/5 hover:border-ink/20 transition-all text-ink/80"
              >
                <span className="flex items-center gap-1.5"><UserCheck className="size-3.5" /> Demo Collector (Customer)</span>
                <span className="text-[10px] text-muted-foreground">Select →</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("seller", "seller@threadmarket.com")}
                className="h-9 w-full flex items-center justify-between px-4 rounded-lg bg-bone text-[11px] font-medium tracking-wide border border-ink/5 hover:border-ink/20 transition-all text-ink/80"
              >
                <span className="flex items-center gap-1.5"><Store className="size-3.5" /> Demo Atelier (Seller)</span>
                <span className="text-[10px] text-muted-foreground">Select →</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin", "admin@threadmarket.com")}
                className="h-9 w-full flex items-center justify-between px-4 rounded-lg bg-bone text-[11px] font-medium tracking-wide border border-ink/5 hover:border-ink/20 transition-all text-ink/80"
              >
                <span className="flex items-center gap-1.5"><Lock className="size-3.5" /> Demo Moderator (Admin)</span>
                <span className="text-[10px] text-muted-foreground">Select →</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
