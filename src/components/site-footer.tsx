import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-5xl font-medium tracking-tight">Threadmarket</h2>
            <p className="mt-6 max-w-[40ch] text-pretty text-base leading-relaxed text-bone/60">
              The destination for the world's most exceptional designers and boutiques to connect with global collectors. Stockholm — London — Tokyo.
            </p>
            <div className="mt-10 max-w-md">
              <p className="eyebrow text-bone/40">Stay in the archive</p>
              <div className="mt-3 flex border-b border-bone/20 pb-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-transparent text-sm placeholder:text-bone/40 outline-hidden"
                />
                <button className="ml-4 text-[11px] font-medium uppercase tracking-widest">Subscribe →</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterCol title="Shop" links={[["Women", "/shop"], ["Men", "/shop"], ["New Arrivals", "/shop"], ["Designers", "/sellers"]]} />
            <FooterCol title="Marketplace" links={[["Open a Store", "/sell"], ["Seller Dashboard", "/seller"], ["Commission", "/about"], ["Authenticity", "/about"]]} />
            <FooterCol title="Concierge" links={[["Shipping", "/about"], ["Returns", "/about"], ["Sizing", "/about"], ["Contact", "/about"]]} />
            <FooterCol title="Company" links={[["Journal", "/journal"], ["About", "/about"], ["Press", "/about"], ["Legal", "/about"]]} />
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-bone/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/40">
            © 2026 Threadmarket Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-[11px] font-medium uppercase tracking-widest text-bone/60">
            <a href="#">Instagram</a>
            <a href="#">Threads</a>
            <a href="#">Pinterest</a>
            <a href="#">Vogue Business</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-bone/40">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-sm text-bone/80 transition-colors hover:text-bone">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
