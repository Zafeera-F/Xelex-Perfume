import { Link } from "react-router-dom";
import { InstagramIcon, FacebookIcon, XIcon } from "../ui/SocialIcons";
import Logo from "../ui/Logo";
import SectionDivider from "../ui/SectionDivider";
import { PATHS } from "../../routes/paths";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "All Fragrances", to: PATHS.shop },
      { label: "Best Sellers", to: `${PATHS.shop}?filter=best-sellers` },
      { label: "New Arrivals", to: `${PATHS.shop}?filter=new-arrivals` },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: PATHS.about },
      { label: "Contact", to: PATHS.contact },
      { label: "Track Order", to: PATHS.trackOrder },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", to: PATHS.faq },
      { label: "Shipping Policy", to: PATHS.shippingPolicy },
      { label: "Return Policy", to: PATHS.returnPolicy },
      { label: "Privacy Policy", to: PATHS.privacyPolicy },
      { label: "Terms & Conditions", to: PATHS.terms },
    ],
  },
  {
    heading: "Category",
    // Real category names in the DB today are Men/Unisex/Women (see
    // GET /api/products/facets) — lowercase in the URL, resolved
    // case-insensitively against the real facet names by Shop.jsx.
    links: [
      { label: "Men", to: `${PATHS.shop}?category=men` },
      { label: "Women", to: `${PATHS.shop}?category=women` },
      { label: "Unisex", to: `${PATHS.shop}?category=unisex` },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/xelex_perfume?igsh=eHBjdW5rNDh2OThn", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "X (Twitter)", href: "#", icon: XIcon },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-soft">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Inspired fragrances, crafted for those who appreciate the art of scent.
            </p>
            <div className="mt-5 flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-muted transition-colors hover:text-gold"
                  {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <Icon size={17} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 font-display text-sm tracking-[0.15em] text-gold">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-muted transition-colors hover:text-ivory"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <SectionDivider className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} XeleX Perfume. All rights reserved.</p>
          <p>UDYAM-TN-38-0037122 · Tamil Nadu, India</p>
          <p>xelexventure@gmail.com · +91 9843172143</p>
        </div>
      </div>
    </footer>
  );
}