import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { projectSchema, type ProjectFormValues } from '@/lib/schemas/project'
import { CURRENCIES, PRICING_TIER_AMOUNTS, PRICING_TIERS, PROJECT_STATUSES } from '@/lib/constants'
import { toDateInputValue } from '@/lib/format'
import { useClients } from '@/hooks/useClients'
import { useProfiles } from '@/hooks/useProfiles'
import type { PricingTier, Project } from '@/types/database'

const emptyForm: ProjectFormValues = {
  client_id: '',
  name: '',
  description: '',
  status: 'Discovery',
  pricing_tier: 'Starter',
  budget: String(PRICING_TIER_AMOUNTS.Starter),
  currency: 'AED',
  start_date: '',
  target_delivery_date: '',
  owner_id: '',
}

export function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  project,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: ProjectFormValues) => void
  project?: Project | null
  submitting?: boolean
}) {
  const { data: clients } = useClients()
  const { data: profiles } = useProfiles()

  const [values, setValues] = useState<ProjectFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (project) {
      setValues({
        client_id: project.client_id,
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        pricing_tier: project.pricing_tier,
        budget: String(project.budget),
        currency: project.currency,
        start_date: toDateInputValue(project.start_date),
        target_delivery_date: toDateInputValue(project.target_delivery_date),
        owner_id: project.owner_id ?? '',
      })
    } else {
      setValues(emptyForm)
    }
    setErrors({})
  }, [open, project])

  function handlePricingTierChange(tier: PricingTier) {
    setValues((v) => ({
      ...v,
      pricing_tier: tier,
      budget: tier === 'Custom' ? v.budget : String(PRICING_TIER_AMOUNTS[tier]),
    }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = projectSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof ProjectFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'Add project'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client" error={errors.client_id}>
            <Select
              value={values.client_id}
              onChange={(e) => setValues((v) => ({ ...v, client_id: e.target.value }))}
            >
              <option value="">Choose a client</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project name" error={errors.name}>
            <Input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="Website redesign"
            />
          </Field>
          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({ ...v, status: e.target.value as ProjectFormValues['status'] }))
              }
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pricing tier">
            <Select
              value={values.pricing_tier}
              onChange={(e) => handlePricingTierChange(e.target.value as PricingTier)}
            >
              {PRICING_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Budget" error={errors.budget} hint={values.pricing_tier !== 'Custom' ? 'Set by pricing tier' : undefined}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={values.budget}
              disabled={values.pricing_tier !== 'Custom'}
              onChange={(e) => setValues((v) => ({ ...v, budget: e.target.value }))}
            />
          </Field>
          <Field label="Currency">
            <Select
              value={values.currency}
              onChange={(e) =>
                setValues((v) => ({ ...v, currency: e.target.value as ProjectFormValues['currency'] }))
              }
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date">
            <Input
              type="date"
              value={values.start_date}
              onChange={(e) => setValues((v) => ({ ...v, start_date: e.target.value }))}
            />
          </Field>
          <Field label="Target delivery">
            <Input
              type="date"
              value={values.target_delivery_date}
              onChange={(e) => setValues((v) => ({ ...v, target_delivery_date: e.target.value }))}
            />
          </Field>
          <Field label="Owner">
            <Select
              value={values.owner_id}
              onChange={(e) => setValues((v) => ({ ...v, owner_id: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            rows={3}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="What this project covers"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {project ? 'Save changes' : 'Add project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
