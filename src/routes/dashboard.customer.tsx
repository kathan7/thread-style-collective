import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard/customer")({
  component: CustomerRedirect,
});

function CustomerRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/account", replace: true }); }, [navigate]);
  return null;
}
