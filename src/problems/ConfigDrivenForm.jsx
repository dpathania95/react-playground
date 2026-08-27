// ─────────────────────────────────────────────────────────────────────────────
// Problem 6 – Config-Driven Form
//
// Build a <ConfigDrivenForm> component that renders a complete, validated form
// entirely from a JSON config — no hardcoded JSX fields anywhere.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS PATTERN?
//
//   In real products, forms are defined in backends, CMS tools, or feature
//   flags — not hardcoded in the UI. A config-driven form lets you add, remove,
//   or reorder fields without touching React code.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONFIG SCHEMA
//
//  FORM_CONFIG = {
//    title:    string                        — form heading
//    fields:   FieldConfig[]                 — ordered list of fields
//    onSubmit: (values: object) => void      — called with { fieldId: value, ... }
//  }
//
//  FieldConfig = {
//    id:          string          — unique key, used as the key in submitted values
//    type:        FieldType       — see supported types below
//    label:       string          — <label> text
//    placeholder: string?         — input placeholder (text / email / password / number / textarea)
//    options:     Option[]?       — required for 'select' and 'radio'
//                                   Option = { value: string, label: string }
//    validation:  Validation?     — see rules below
//    showWhen:    Condition?      — conditional visibility (see below)
//  }
//
//  FieldType  = 'text' | 'email' | 'password' | 'number'
//             | 'textarea' | 'select' | 'checkbox' | 'radio'
//
//  Validation = {
//    required:   boolean?
//    minLength:  number?          — for string fields
//    maxLength:  number?          — for string fields
//    min:        number?          — for number fields
//    max:        number?          — for number fields
//    pattern:    RegExp?          — tested against string value
//    validate:   (value) => string | null   — custom: return error string or null
//  }
//
//  Condition (showWhen) = {
//    field:  string               — id of another field
//    value:  any                  — show this field only when that field === value
//  }
//
// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS
//
//   ✅ Render every FieldType listed above
//   ✅ Validate on submit — show inline error messages under failing fields
//   ✅ Required fields show an error if empty on submit
//   ✅ minLength / maxLength checked for text-like fields
//   ✅ min / max checked for number fields
//   ✅ pattern checked against the current value
//   ✅ Custom validate() function called and its return value shown as the error
//   ✅ Conditional fields — a field with showWhen is mounted/unmounted based
//      on the current value of the referenced field
//   ✅ When a conditional field is hidden its value is removed from submission
//   ✅ onSubmit called with { id: value } map only when ALL visible fields pass
//
// BONUS
//   ⭐ Validate on blur (per-field), not only on submit
//   ⭐ Disable the Submit button while any visible required field is empty
//   ⭐ Show a success banner after submission instead of just console.log
//   ⭐ Support a 'date' field type
//   ⭐ Support field-level defaultValue in the config
//
// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE CONFIG  (use this to test your implementation)
// ─────────────────────────────────────────────────────────────────────────────

export const FORM_CONFIG = {
  title: 'User Registration',
  fields: [
    {
      id: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Jane',
      validation: { required: true, minLength: 2, maxLength: 50 },
    },
    {
      id: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Doe',
      validation: { required: true, minLength: 2, maxLength: 50 },
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'jane@example.com',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    {
      id: 'password',
      type: 'password',
      label: 'Password',
      placeholder: '••••••••',
      validation: {
        required: true,
        minLength: 8,
        validate: (val) =>
          /[A-Z]/.test(val) ? null : 'Must contain at least one uppercase letter',
      },
    },
    {
      id: 'age',
      type: 'number',
      label: 'Age',
      placeholder: '25',
      validation: { required: true, min: 18, max: 120 },
    },
    {
      id: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'developer', label: 'Developer' },
        { value: 'designer',  label: 'Designer'  },
        { value: 'manager',   label: 'Manager'   },
        { value: 'other',     label: 'Other'     },
      ],
      validation: { required: true },
    },
    {
      id: 'roleDescription',
      type: 'text',
      label: 'Describe your role',
      placeholder: 'e.g. Front-end lead',
      showWhen: { field: 'role', value: 'other' },   // ← only visible when role = 'other'
      validation: { required: true, maxLength: 100 },
    },
    {
      id: 'plan',
      type: 'radio',
      label: 'Plan',
      options: [
        { value: 'free',       label: 'Free'       },
        { value: 'pro',        label: 'Pro'        },
        { value: 'enterprise', label: 'Enterprise' },
      ],
      validation: { required: true },
    },
    {
      id: 'company',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Acme Corp',
      showWhen: { field: 'plan', value: 'enterprise' }, // ← only visible when plan = 'enterprise'
      validation: { required: true },
    },
    {
      id: 'bio',
      type: 'textarea',
      label: 'Short Bio',
      placeholder: 'Tell us a little about yourself…',
      validation: { maxLength: 300 },
    },
    {
      id: 'acceptTerms',
      type: 'checkbox',
      label: 'I accept the Terms & Conditions',
      validation: {
        validate: (val) => val === true ? null : 'You must accept the terms',
      },
    },
  ],
  onSubmit: (values) => {
    console.log('Form submitted:', values)
    alert('Submitted! Check the console for values.')
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  YOUR IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export default function ConfigDrivenForm() {

}
