import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, DatePicker, Field, Input, Select, Textarea } from '@/components/ui'
import { leadSchema, type LeadFormValues } from '@/lib/schemas/lead'
import { CURRENCIES, LEAD_SOURCES, LEAD_STATUSES } from '@/lib/constants'
import { toDateInputValue } from '@/lib/format'
import type { Lead } from '@/types/database'

const emptyForm: LeadFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: 'inbound',
  status: 'New',
  estimated_value: '',
  currency: 'AED',
  next_follow_up_date: '',
  notes: '',
  lost_reason: '',
}

export function LeadFormModal({
  open,
  onClose,
  onSubmit,
  lead,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: LeadFormValues) => void
  lead?: Lead | null
  submitting?: boolean
}) {
  const [values, setValues] = useState<LeadFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (lead) {
      setValues({
        name: lead.name,
        company: lead.company ?? '',
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        source: lead.source,
        status: lead.status,
        estimated_value: lead.estimated_value != null ? String(lead.estimated_value) : '',
        currency: lead.currency,
        next_follow_up_date: toDateInputValue(lead.next_follow_up_date),
        notes: lead.notes ?? '',
        lost_reason: lead.lost_reason ?? '',
      })
    } else {
      setValues(emptyForm)
    }
    setErrors({})
  }, [open, lead])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = leadSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof LeadFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={lead ? 'Edit lead' : 'Add lead'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            <Input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Company">
            <Input
              value={values.company}
              onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              placeholder="Acme LLC"
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
          <Field label="Source">
            <Select
              value={values.source}
              onChange={(e) =>
                setValues((v) => ({ ...v, source: e.target.value as LeadFormValues['source'] }))
              }
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({ ...v, status: e.target.value as LeadFormValues['status'] }))
              }
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estimated value" error={errors.estimated_value}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={values.estimated_value}
              onChange={(e) => setValues((v) => ({ ...v, estimated_value: e.target.value }))}
              placeholder="0.00"
            />
          </Field>
          <Field label="Currency">
            <Select
              value={values.currency}
              onChange={(e) =>
                setValues((v) => ({ ...v, currency: e.target.value as LeadFormValues['currency'] }))
              }
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Next follow up">
            <DatePicker
              value={values.next_follow_up_date}
              onChange={(e) => setValues((v) => ({ ...v, next_follow_up_date: e.target.value }))}
            />
          </Field>
        </div>
        {values.status === 'Lost' && (
          <Field label="Lost reason" error={errors.lost_reason}>
            <Textarea
              rows={2}
              value={values.lost_reason}
              onChange={(e) => setValues((v) => ({ ...v, lost_reason: e.target.value }))}
              placeholder="e.g. Went with a competitor, budget cut, no response"
            />
          </Field>
        )}
        <Field label="Notes">
          <Textarea
            rows={3}
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            placeholder="Anything the team should know about this lead"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {lead ? 'Save changes' : 'Add lead'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
