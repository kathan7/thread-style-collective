import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard/seller")({
  component: SellerRedirect,
});

function SellerRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/shop", replace: true }); }, [navigate]);
  return null;
}
