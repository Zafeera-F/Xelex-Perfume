import { InstagramIcon, FacebookIcon, XIcon } from "../ui/SocialIcons";
import Logo from "../ui/Logo";
import SectionDivider from "../ui/SectionDivider";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: ["All Fragrances", "Best Sellers", "New Arrivals"],
  },
  {
    heading: "Company",
    links: ["About Us", "Contact", "Track Order"],
  },
  {
    heading: "Support",
    links: ["Shipping", "Returns", "FAQs"],
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "X (Twitter)", href: "#", icon: XIcon },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-soft">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
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
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-ivory"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <SectionDivider className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} XeleX Perfumes. All rights reserved.</p>
          <p>UDYAM-TN-38-0037122 · Tamil Nadu, India</p>
          <p>xelexventure@gmail.com · +91 9843172143</p>
        </div>
      </div>
    </footer>
  );
}