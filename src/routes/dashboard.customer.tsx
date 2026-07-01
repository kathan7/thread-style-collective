import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, Mail, ShieldAlert, ShoppingBag, MapPin, Settings, Plus, Trash2, Home } from "lucide-react";
import { useMarketplace, Address } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/customer")({
  head: () => ({
    meta: [
      { title: "Collector Dashboard — THREADMARKET" },
    ],
  }),
  component: CustomerDashboard,
});

type TabType = "orders" | "addresses" | "profile";

function CustomerDashboard() {
  const { currentUser, orders, updateAddresses, logout } = useMarketplace();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // Address inputs state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrCountry, setAddrCountry] = useState("France");

  // Profile input state
  const [profName, setProfName] = useState(currentUser?.name || "");

  // Redirect if not logged in or wrong role
  if (!currentUser) {
    navigate({ to: "/auth" });
    return null;
  }
  if (currentUser.role !== "customer") {
    navigate({ to: `/dashboard/${currentUser.role}` });
    return null;
  }

  // Filter orders matching this customer
  const customerOrders = orders.filter((o) => o.customerId === currentUser.id);

  const handleLogOut = () => {
    logout();
    toast.success("Successfully logged out.");
    navigate({ to: "/" });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrStreet || !addrCity || !addrPostal || !addrCountry) {
      toast.error("Please fill in all address fields.");
      return;
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      name: addrName,
      street: addrStreet,
      city: addrCity,
      postalCode: addrPostal,
      country: addrCountry,
      isDefault: (currentUser.addresses || []).length === 0,
    };

    const currentAddresses = currentUser.addresses || [];
    const updated = [...currentAddresses, newAddress];
    updateAddresses(updated);
    toast.success("New shipping destination added.");

    // Clear state
    setAddrName("");
    setAddrStreet("");
    setAddrCity("");
    setAddrPostal("");
    setAddrCountry("France");
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    const currentAddresses = currentUser.addresses || [];
    const updated = currentAddresses.filter((a) => a.id !== id);
    // Ensure if we delete default address, we make another one default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    updateAddresses(updated);
    toast.success("Address removed from settings.");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName) {
      toast.error("Name cannot be empty.");
      return;
    }
    // Simple mock update
    currentUser.name = profName;
    localStorage.setItem("tm_user", JSON.stringify(currentUser));
    toast.success("Collector profile updated.");
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-ink/5 pb-8 mb-10">
          <div>
            <p className="eyebrow text-muted-foreground">Collector Profile</p>
            <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mt-2">
              Hello, {currentUser.name}.
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {currentUser.id}</p>
          </div>
          <button
            onClick={handleLogOut}
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 text-red-600 px-6 text-[11px] font-semibold uppercase tracking-widest hover:bg-red-50/50 transition cursor-pointer"
          >
            Log Out Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Side Menu */}
          <div className="lg:col-span-3">
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto border-b lg:border-b-0 border-ink/5 pb-2 lg:pb-0">
              {[
                { type: "orders", label: "Archive Purchases", icon: ShoppingBag },
                { type: "addresses", label: "Shipping Registry", icon: MapPin },
                { type: "profile", label: "Collector Settings", icon: Settings },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.type;
                return (
                  <button
                    key={t.type}
                    onClick={() => setActiveTab(t.type as TabType)}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition whitespace-nowrap cursor-pointer ${active ? "bg-ink text-bone" : "text-muted-foreground hover:text-ink hover:bg-paper/50"
                      }`}
                  >
                    <Icon className="size-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {activeTab === "orders" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Your purchase history</h2>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-16 bg-paper rounded-2xl border border-ink/5 flex flex-col items-center">
                      <ShoppingBag className="size-8 text-muted-foreground/45 mb-3" />
                      <p className="font-display text-lg font-medium text-ink">No purchases registered.</p>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">Authenticated design purchases will reside in your dashboard here.</p>
                      <a href="/shop" className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
                        Browse catalog
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="bg-paper border border-ink/5 rounded-xl p-5 md:p-6 space-y-4">
                          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ink/5 pb-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Order Reference</p>
                              <p className="font-mono text-sm font-semibold mt-0.5">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Placed On</p>
                              <p className="text-sm font-medium mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-1 ${order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                                  order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                {order.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Paid</p>
                              <p className="font-display text-base font-semibold mt-0.5">${order.total.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="divide-y divide-ink/5">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                                <div className="aspect-[3/4] w-12 overflow-hidden rounded bg-bone border border-ink/5">
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.sellerSlug.toUpperCase()}</p>
                                    <h4 className="font-medium text-ink mt-0.5">{item.name}</h4>
                                    <p className="text-muted-foreground mt-0.5">Size {item.size} · Color {item.color} · Qty {item.quantity}</p>
                                  </div>
                                  <span className="font-display font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-medium">Shipping Registry</h2>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="inline-flex h-9 items-center justify-center rounded-full bg-ink px-4 text-[11px] font-semibold uppercase tracking-wider text-bone gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>{showAddAddress ? "Cancel" : "Add Address"}</span>
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="bg-paper border border-ink/5 rounded-xl p-5 md:p-6 mb-6 space-y-4">
                      <h3 className="text-xs uppercase font-bold tracking-wider mb-2">New Destination</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Destination Name (Label)</label>
                          <input
                            type="text"
                            required
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            placeholder="e.g. Home, Office"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Street Address</label>
                          <input
                            type="text"
                            required
                            value={addrStreet}
                            onChange={(e) => setAddrStreet(e.target.value)}
                            placeholder="124 Rue de Grenelle"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            placeholder="Paris"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Postal Code</label>
                            <input
                              type="text"
                              required
                              value={addrPostal}
                              onChange={(e) => setAddrPostal(e.target.value)}
                              placeholder="75007"
                              className="w-full h-10 px-3 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Country</label>
                            <input
                              type="text"
                              required
                              value={addrCountry}
                              onChange={(e) => setAddrCountry(e.target.value)}
                              placeholder="France"
                              className="w-full h-10 px-3 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone mt-2"
                      >
                        Register Destination
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(currentUser.addresses || []).map((addr) => (
                      <div key={addr.id} className="bg-paper border border-ink/5 p-5 rounded-xl flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold uppercase tracking-wider">{addr.name}</h4>
                            {addr.isDefault && (
                              <span className="rounded-full bg-ink text-bone text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {addr.street}<br />
                            {addr.postalCode} {addr.city}, {addr.country}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-muted-foreground hover:text-red-600 transition p-1 cursor-pointer"
                          aria-label="Delete address"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    {(currentUser.addresses || []).length === 0 && (
                      <div className="md:col-span-2 text-center py-10 bg-paper rounded-xl border border-ink/5">
                        <MapPin className="size-6 text-muted-foreground/45 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No destinations registered in your registry.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Collector configuration</h2>
                  <form onSubmit={handleUpdateProfile} className="bg-paper border border-ink/5 p-6 rounded-xl space-y-4 max-w-md">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Full Collector Name</label>
                      <input
                        type="text"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        placeholder="Margot Laurent"
                        className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Authenticated Email</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full h-10 px-4 rounded-md border border-ink/5 bg-bone text-sm opacity-50 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Contact administrators to alter security details.</p>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone mt-2"
                    >
                      Save Configuration
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
