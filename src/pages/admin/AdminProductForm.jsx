import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUp, ArrowDown, X, ImagePlus } from "lucide-react";
import { Field, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getAdminProduct,
  getProductFormMeta,
  createProduct,
  updateProduct,
  uploadImage,
} from "../../lib/adminProducts";
import { PATHS } from "../../routes/paths";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  stockQuantity: "0",
  categoryId: "",
  collectionId: "",
  brandLine: "",
  badge: "",
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  images: [],
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [meta, setMeta] = useState({ categories: [], collections: [] });
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getProductFormMeta().then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    getAdminProduct(id)
      .then((product) => {
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
          sku: product.sku || "",
          stockQuantity: String(product.stockQuantity),
          categoryId: product.categoryId || "",
          collectionId: product.collectionId || "",
          brandLine: product.brandLine || "",
          badge: product.badge || "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          images: product.images,
        });
        setSlugTouched(true); // never auto-regenerate an existing product's slug from its name
      })
      .catch((err) => setError(err.message || "Unable to load this product."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  function handleField(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "name" && !slugTouched) {
          next.slug = slugify(value);
        }
        return next;
      });
    };
  }

  function handleSlugChange(e) {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, images: [...prev.images, { url, altText: "" }] }));
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function updateImage(index, patch) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, ...patch } : img)),
    }));
  }

  function removeImage(index) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  function moveImage(index, direction) {
    setForm((prev) => {
      const images = [...prev.images];
      const target = index + direction;
      if (target < 0 || target >= images.length) return prev;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      sku: form.sku || undefined,
      stockQuantity: Number(form.stockQuantity),
      categoryId: form.categoryId,
      collectionId: form.collectionId || undefined,
      brandLine: form.brandLine || undefined,
      badge: form.badge || undefined,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      images: form.images,
    };

    try {
      if (isEditMode) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate(PATHS.admin.products);
    } catch (err) {
      if (err.errors?.length) {
        setFieldErrors(Object.fromEntries(err.errors.map((e) => [e.field, e.message])));
      }
      setError(err.message || "Unable to save this product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-ivory">{isEditMode ? "Edit Product" : "Add Product"}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Basic Details</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Name" error={fieldErrors.name}>
                <Input required value={form.name} onChange={handleField("name")} />
              </Field>
              <Field label="Slug" error={fieldErrors.slug}>
                <Input required value={form.slug} onChange={handleSlugChange} />
              </Field>
            </div>

            <Field label="Description" error={fieldErrors.description}>
              <textarea
                required
                value={form.description}
                onChange={handleField("description")}
                rows={4}
                className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Category" error={fieldErrors.categoryId}>
                <select
                  required
                  value={form.categoryId}
                  onChange={handleField("categoryId")}
                  className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
                >
                  <option value="">Select a category</option>
                  {meta.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Collection (Optional)">
                <select
                  value={form.collectionId}
                  onChange={handleField("collectionId")}
                  className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
                >
                  <option value="">None</option>
                  {meta.collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Brand Line (Optional)">
                <Input value={form.brandLine} onChange={handleField("brandLine")} placeholder="XeleX Signature" />
              </Field>
              <Field label="Badge (Optional)">
                <Input value={form.badge} onChange={handleField("badge")} placeholder="New, Limited, Best Seller…" />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Pricing &amp; Stock</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Price (₹)" error={fieldErrors.price}>
              <Input required type="number" min="0" step="0.01" value={form.price} onChange={handleField("price")} />
            </Field>
            <Field label="Compare-at Price (₹)" error={fieldErrors.compareAtPrice}>
              <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={handleField("compareAtPrice")} />
            </Field>
            <Field label="Stock Quantity" error={fieldErrors.stockQuantity}>
              <Input required type="number" min="0" value={form.stockQuantity} onChange={handleField("stockQuantity")} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="SKU (Optional)">
              <Input value={form.sku} onChange={handleField("sku")} />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-ivory/80">
              <input type="checkbox" checked={form.isActive} onChange={handleField("isActive")} className="h-4 w-4 accent-[var(--color-gold)]" />
              Active (visible on storefront)
            </label>
            <label className="flex items-center gap-2 text-sm text-ivory/80">
              <input type="checkbox" checked={form.isFeatured} onChange={handleField("isFeatured")} className="h-4 w-4 accent-[var(--color-gold)]" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-ivory/80">
              <input type="checkbox" checked={form.isBestSeller} onChange={handleField("isBestSeller")} className="h-4 w-4 accent-[var(--color-gold)]" />
              Best Seller
            </label>
          </div>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Images</h2>

          <div className="space-y-4">
            {form.images.map((img, index) => (
              <div key={img.url + index} className="flex items-center gap-4 border border-border p-3">
                <img src={img.url} alt="" className="h-16 w-16 flex-shrink-0 object-cover" />
                <Input
                  value={img.altText || ""}
                  onChange={(e) => updateImage(index, { altText: e.target.value })}
                  placeholder="Alt text (optional)"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="text-ivory/60 hover:text-gold disabled:opacity-30" aria-label="Move up">
                    <ArrowUp size={15} />
                  </button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1} className="text-ivory/60 hover:text-gold disabled:opacity-30" aria-label="Move down">
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" onClick={() => removeImage(index)} className="text-ivory/60 hover:text-error" aria-label="Remove image">
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

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
            className="mt-4"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={15} className="mr-2" />
            {isUploading ? "Uploading…" : "Add Image"}
          </Button>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEditMode ? "Save Changes" : "Create Product"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate(PATHS.admin.products)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
