import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { clientSchema, type ClientFormValues } from '@/lib/schemas/client'
import { COUNTRIES, CLIENT_STATUSES, CURRENCIES } from '@/lib/constants'
import type { Client } from '@/types/database'

const emptyForm: ClientFormValues = {
  company_name: '',
  primary_contact_name: '',
  email: '',
  phone: '',
  country: 'UAE',
  city: '',
  trn: '',
  billing_currency: 'AED',
  billing_address: '',
  status: 'Active',
  notes: '',
}

export function ClientFormModal({
  open,
  onClose,
  onSubmit,
  client,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: ClientFormValues) => void
  client?: Client | null
  submitting?: boolean
}) {
  const [values, setValues] = useState<ClientFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (client) {
      setValues({
        company_name: client.company_name,
        primary_contact_name: client.primary_contact_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        country: client.country,
        city: client.city ?? '',
        trn: client.trn ?? '',
        billing_currency: client.billing_currency,
        billing_address: client.billing_address ?? '',
        status: client.status,
        notes: client.notes ?? '',
      })
    } else {
      setValues(emptyForm)
    }
    setErrors({})
  }, [open, client])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = clientSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof ClientFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Edit client' : 'Add client'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errors.company_name}>
            <Input
              value={values.company_name}
              onChange={(e) => setValues((v) => ({ ...v, company_name: e.target.value }))}
              placeholder="Acme LLC"
            />
          </Field>
          <Field label="Primary contact name">
            <Input
              value={values.primary_contact_name}
              onChange={(e) => setValues((v) => ({ ...v, primary_contact_name: e.target.value }))}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              placeholder="client@company.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              placeholder="+971 50 000 0000"
            />
          </Field>
          <Field label="Country">
            <Select
              value={values.country}
              onChange={(e) =>
                setValues((v) => ({ ...v, country: e.target.value as ClientFormValues['country'] }))
              }
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'other' ? 'Other' : c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Input
              value={values.city}
              onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
              placeholder="Dubai"
            />
          </Field>
          <Field label="TRN" hint="Tax registration number, UAE entities">
            <Input
              value={values.trn}
              onChange={(e) => setValues((v) => ({ ...v, trn: e.target.value }))}
              placeholder="100000000000003"
            />
          </Field>
          <Field label="Billing currency">
            <Select
              value={values.billing_currency}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  billing_currency: e.target.value as ClientFormValues['billing_currency'],
                }))
              }
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({ ...v, status: e.target.value as ClientFormValues['status'] }))
              }
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Billing address">
          <Textarea
            rows={2}
            value={values.billing_address}
            onChange={(e) => setValues((v) => ({ ...v, billing_address: e.target.value }))}
            placeholder="Street, building, city, country"
          />
        </Field>
        <Field label="Notes">
          <Textarea
            rows={3}
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            placeholder="Anything the team should know about this client"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {client ? 'Save changes' : 'Add client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
