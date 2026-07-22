import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import {
  getAdminHeroSlides,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "../../lib/adminHeroSlides";
import { PATHS } from "../../routes/paths";

export default function AdminHeroSlideList() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAdminHeroSlides()
      .then((res) => {
        if (!cancelled) setSlides(res);
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleEnabled(slide) {
    const updated = await updateHeroSlide(slide.id, { isEnabled: !slide.isEnabled });
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isEnabled: updated.isEnabled } : s)));
  }

  async function handleDelete(slide) {
    if (!window.confirm(`Delete "${slide.heading}"? This can't be undone from here.`)) return;
    await deleteHeroSlide(slide.id);
    setSlides((prev) => prev.filter((s) => s.id !== slide.id));
  }

  async function handleMove(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSlides(reordered);
    await reorderHeroSlides(reordered.map((s) => s.id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ivory">Hero Slider</h1>
        <Button as={Link} to={PATHS.admin.newHeroSlide} variant="primary" size="sm">
          <Plus size={15} className="mr-1" />
          Add Slide
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Slide</th>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : slides.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title="No hero slides yet"
                    description="Add one to replace the default homepage hero image."
                  />
                </td>
              </tr>
            ) : (
              slides.map((slide, index) => (
                <tr key={slide.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden bg-background-soft">
                        {slide.imageUrl ? (
                          <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff size={16} className="text-muted" />
                        )}
                      </div>
                      <div>
                        <p className="text-ivory">{slide.heading}</p>
                        {slide.buttonText && <p className="text-xs text-muted">{slide.buttonText}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="text-ivory/60 transition-colors hover:text-gold disabled:opacity-30"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === slides.length - 1}
                        aria-label="Move down"
                        className="text-ivory/60 transition-colors hover:text-gold disabled:opacity-30"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {slide.isEnabled ? (
                      <Badge tone="success">Enabled</Badge>
                    ) : (
                      <Badge tone="muted">Disabled</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={PATHS.admin.editHeroSlide(slide.id)}
                        aria-label={`Edit ${slide.heading}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleToggleEnabled(slide)}
                        aria-label={slide.isEnabled ? `Disable ${slide.heading}` : `Enable ${slide.heading}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        {slide.isEnabled ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleDelete(slide)}
                        aria-label={`Delete ${slide.heading}`}
                        className="text-ivory/60 transition-colors hover:text-error"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
