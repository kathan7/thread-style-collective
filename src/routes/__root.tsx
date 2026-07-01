import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MarketplaceProvider } from "../hooks/use-marketplace";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow text-muted-foreground">404 — Off Catalogue</p>
        <h1 className="font-display mt-6 text-6xl font-medium tracking-tighter text-ink">
          This piece is no longer in the archive.
        </h1>
        <a
          href="/"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-medium uppercase tracking-widest text-bone transition hover:opacity-90"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow text-muted-foreground">Something interrupted</p>
        <h1 className="font-display mt-6 text-5xl font-medium tracking-tighter text-ink">
          This page didn't load.
        </h1>
        <div className="mt-10 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-medium uppercase tracking-widest text-bone"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-[11px] font-medium uppercase tracking-widest"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "THREADMARKET — The Archive of Modern Luxury" },
      {
        name: "description",
        content:
          "A curated multi-vendor marketplace for the world's most innovative independent designers and boutiques.",
      },
      { property: "og:title", content: "THREADMARKET — The Archive of Modern Luxury" },
      {
        property: "og:description",
        content:
          "A curated multi-vendor marketplace for the world's most innovative independent designers and boutiques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MarketplaceProvider>
        <Outlet />
      </MarketplaceProvider>
    </QueryClientProvider>
  );
}
