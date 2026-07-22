import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Field, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getAdminCoupon, createCoupon, updateCoupon } from "../../lib/adminCoupons";
import { PATHS } from "../../routes/paths";

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  expiresAt: "",
  usageLimit: "",
  isActive: true,
};

export default function AdminCouponForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    getAdminCoupon(id)
      .then((coupon) => {
        setForm({
          code: coupon.code,
          description: coupon.description || "",
          discountType: coupon.discountType,
          discountValue: String(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : "",
          maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
          expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
          usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
          isActive: coupon.isActive,
        });
      })
      .catch((err) => setError(err.message || "Unable to load this coupon."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  function handleField(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    };

    try {
      if (isEditMode) {
        await updateCoupon(id, payload);
      } else {
        await createCoupon(payload);
      }
      navigate(PATHS.admin.coupons);
    } catch (err) {
      if (err.errors?.length) {
        setFieldErrors(Object.fromEntries(err.errors.map((e) => [e.field, e.message])));
      }
      setError(err.message || "Unable to save this coupon.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-ivory">{isEditMode ? "Edit Coupon" : "Add Coupon"}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Basic Details</h2>
          <div className="space-y-5">
            <Field label="Code" error={fieldErrors.code}>
              <Input
                required
                value={form.code}
                onChange={handleField("code")}
                placeholder="SAVE10"
                className="uppercase"
              />
            </Field>
            <Field label="Description (Optional)" error={fieldErrors.description}>
              <Input value={form.description} onChange={handleField("description")} />
            </Field>
          </div>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Discount</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Discount Type" error={fieldErrors.discountType}>
              <select
                value={form.discountType}
                onChange={handleField("discountType")}
                className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </Field>
            <Field
              label={form.discountType === "PERCENTAGE" ? "Discount Value (%)" : "Discount Value (₹)"}
              error={fieldErrors.discountValue}
            >
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={handleField("discountValue")}
              />
            </Field>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Minimum Order Amount (₹, Optional)" error={fieldErrors.minOrderAmount}>
              <Input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={handleField("minOrderAmount")} />
            </Field>
            {form.discountType === "PERCENTAGE" && (
              <Field label="Maximum Discount (₹, Optional)" error={fieldErrors.maxDiscountAmount}>
                <Input type="number" min="0" step="0.01" value={form.maxDiscountAmount} onChange={handleField("maxDiscountAmount")} />
              </Field>
            )}
          </div>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Limits</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Expiry Date (Optional)" error={fieldErrors.expiresAt}>
              <Input type="date" value={form.expiresAt} onChange={handleField("expiresAt")} />
            </Field>
            <Field label="Usage Limit (Optional)" error={fieldErrors.usageLimit}>
              <Input type="number" min="1" value={form.usageLimit} onChange={handleField("usageLimit")} placeholder="Unlimited" />
            </Field>
          </div>

          <label className="mt-6 flex items-center gap-2 text-sm text-ivory/80">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleField("isActive")}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            Active
          </label>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEditMode ? "Save Changes" : "Create Coupon"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => navigate(PATHS.admin.coupons)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
