import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Checkbox, Field, Input } from '@/components/ui'
import { contactSchema, type ContactFormValues } from '@/lib/schemas/contact'
import type { Contact } from '@/types/database'

const emptyForm: ContactFormValues = {
  name: '',
  role: '',
  email: '',
  phone: '',
  is_primary: false,
}

export function ContactFormModal({
  open,
  onClose,
  onSubmit,
  contact,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: ContactFormValues) => void
  contact?: Contact | null
  submitting?: boolean
}) {
  const [values, setValues] = useState<ContactFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (contact) {
      setValues({
        name: contact.name,
        role: contact.role ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        is_primary: contact.is_primary,
      })
    } else {
      setValues(emptyForm)
    }
    setErrors({})
  }, [open, contact])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof ContactFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={contact ? 'Edit contact' : 'Add contact'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name}>
          <Input
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Role">
          <Input
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            placeholder="Finance lead"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="jane@company.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="+971 50 000 0000"
          />
        </Field>
        <Checkbox
          id="contact-is-primary"
          label="Primary contact for this client"
          checked={values.is_primary}
          onChange={(e) => setValues((v) => ({ ...v, is_primary: e.target.checked }))}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {contact ? 'Save changes' : 'Add contact'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
