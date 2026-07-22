import { Link } from "react-router-dom";
import { Images, ChevronRight } from "lucide-react";
import Card from "../../components/ui/Card";
import { PATHS } from "../../routes/paths";

// A flat grid of settings sections — add a new entry here (and its own
// route/pages) whenever a future setting needs its own management screen,
// rather than nesting the sidebar.
const SETTINGS_SECTIONS = [
  {
    label: "Hero Slider",
    description: "Manage the homepage hero slideshow — images, headings, and call-to-action buttons.",
    to: PATHS.admin.heroSlides,
    icon: Images,
  },
];

export default function AdminSettings() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Settings</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map(({ label, description, to, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-background-soft text-gold">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-ivory">{label}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
