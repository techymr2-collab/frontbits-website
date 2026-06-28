import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, CardBody, CardHeader, Field, Input, Select, Skeleton } from '@/components/ui'
import { useCompanySettings, useUpdateCompanySettings } from '@/hooks/useCompanySettings'
import { companySettingsSchema, type CompanySettingsFormValues } from '@/lib/schemas/companySettings'
import { CURRENCIES } from '@/lib/constants'
import { emptyToNull } from '@/lib/utils'

const emptyForm: CompanySettingsFormValues = {
  company_name: '',
  address: '',
  trn: '',
  default_currency: 'AED',
}

export default function Settings() {
  const { data: settings, isLoading } = useCompanySettings()
  const updateSettings = useUpdateCompanySettings()

  const [values, setValues] = useState<CompanySettingsFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanySettingsFormValues, string>>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!settings) return
    setValues({
      company_name: settings.company_name,
      address: settings.address ?? '',
      trn: settings.trn ?? '',
      default_currency: settings.default_currency,
    })
  }, [settings])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = companySettingsSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof CompanySettingsFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    if (!settings) return

    await updateSettings.mutateAsync({ id: settings.id, input: emptyToNull(parsed.data) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Settings" description="Company profile used across the app." />
        <Skeleton className="h-80 w-full" />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Settings" description="Company profile used across the app." />

      <Card className="max-w-3xl">
        <CardHeader title="Company profile" description="Your company details" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Company name" error={errors.company_name}>
                <Input
                  value={values.company_name}
                  onChange={(e) => setValues((v) => ({ ...v, company_name: e.target.value }))}
                  placeholder="Frontbits LLC"
                />
              </Field>
              <Field label="TRN" hint="Tax registration number">
                <Input
                  value={values.trn}
                  onChange={(e) => setValues((v) => ({ ...v, trn: e.target.value }))}
                  placeholder="100000000000003"
                />
              </Field>
              <Field label="Default currency">
                <Select
                  value={values.default_currency}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      default_currency: e.target.value as CompanySettingsFormValues['default_currency'],
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
            </div>

            <Field label="Address">
              <Input
                value={values.address}
                onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
                placeholder="Dubai, United Arab Emirates"
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-2">
              {saved && <span className="text-sm text-green-600">Saved</span>}
              <Button type="submit" loading={updateSettings.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
