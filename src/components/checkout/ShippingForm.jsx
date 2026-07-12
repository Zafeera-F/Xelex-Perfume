import { Field, Input } from "../ui/Input";

/**
 * ShippingForm — controlled form fields, validated via native HTML
 * `required` attributes for now. Submission itself is handled by the parent
 * (Checkout.jsx) since that's where the "place order" action belongs.
 */
export default function ShippingForm({ values, onChange }) {
  function handleChange(field) {
    return (e) => onChange({ ...values, [field]: e.target.value });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name">
          <Input required value={values.fullName} onChange={handleChange("fullName")} placeholder="Zafeera Faisa" />
        </Field>
        <Field label="Phone Number">
          <Input
            required
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            placeholder="+91 98765 43210"
          />
        </Field>
      </div>

      <Field label="Address Line 1">
        <Input required value={values.address1} onChange={handleChange("address1")} placeholder="House no., street" />
      </Field>

      <Field label="Address Line 2 (Optional)">
        <Input value={values.address2} onChange={handleChange("address2")} placeholder="Landmark, apartment" />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="City">
          <Input required value={values.city} onChange={handleChange("city")} placeholder="Kumbakonam" />
        </Field>
        <Field label="State">
          <Input required value={values.state} onChange={handleChange("state")} placeholder="Tamil Nadu" />
        </Field>
        <Field label="Pincode">
          <Input required value={values.pincode} onChange={handleChange("pincode")} placeholder="612001" />
        </Field>
      </div>
    </div>
  );
}
