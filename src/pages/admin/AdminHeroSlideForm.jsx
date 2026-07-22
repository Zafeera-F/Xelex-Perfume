import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { Field, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getAdminHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  uploadHeroSlideImage,
} from "../../lib/adminHeroSlides";
import { PATHS } from "../../routes/paths";

const EMPTY_FORM = {
  imageUrl: "",
  heading: "",
  description: "",
  buttonText: "",
  buttonLink: "",
  isEnabled: true,
};

export default function AdminHeroSlideForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    getAdminHeroSlide(id)
      .then((slide) => {
        setForm({
          imageUrl: slide.imageUrl,
          heading: slide.heading,
          description: slide.description || "",
          buttonText: slide.buttonText || "",
          buttonLink: slide.buttonLink || "",
          isEnabled: slide.isEnabled,
        });
      })
      .catch((err) => setError(err.message || "Unable to load this slide."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  function handleField(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const url = await uploadHeroSlideImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      imageUrl: form.imageUrl,
      heading: form.heading,
      description: form.description || undefined,
      buttonText: form.buttonText || undefined,
      buttonLink: form.buttonLink || undefined,
      isEnabled: form.isEnabled,
    };

    try {
      if (isEditMode) {
        await updateHeroSlide(id, payload);
      } else {
        await createHeroSlide(payload);
      }
      navigate(PATHS.admin.heroSlides);
    } catch (err) {
      if (err.errors?.length) {
        setFieldErrors(Object.fromEntries(err.errors.map((e) => [e.field, e.message])));
      }
      setError(err.message || "Unable to save this slide.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-ivory">{isEditMode ? "Edit Hero Slide" : "Add Hero Slide"}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Image</h2>

          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="mb-4 h-40 w-full max-w-sm object-cover" />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelected}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={15} className="mr-2" />
            {isUploading ? "Uploading…" : form.imageUrl ? "Replace Image" : "Upload Image"}
          </Button>
          {fieldErrors.imageUrl && <p className="mt-2 text-xs text-error">{fieldErrors.imageUrl}</p>}
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Content</h2>
          <div className="space-y-5">
            <Field label="Heading" error={fieldErrors.heading}>
              <Input required value={form.heading} onChange={handleField("heading")} />
            </Field>

            <Field label="Description (Optional)" error={fieldErrors.description}>
              <textarea
                value={form.description}
                onChange={handleField("description")}
                rows={3}
                className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Button Text (Optional)" error={fieldErrors.buttonText}>
                <Input value={form.buttonText} onChange={handleField("buttonText")} placeholder="Shop Now" />
              </Field>
              <Field label="Button Link (Optional)" error={fieldErrors.buttonLink}>
                <Input value={form.buttonLink} onChange={handleField("buttonLink")} placeholder="/shop" />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={handleField("isEnabled")}
                className="h-4 w-4 accent-[var(--color-gold)]"
              />
              Enabled (visible on storefront)
            </label>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting || !form.imageUrl}>
            {isSubmitting ? "Saving…" : isEditMode ? "Save Changes" : "Create Slide"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate(PATHS.admin.heroSlides)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
