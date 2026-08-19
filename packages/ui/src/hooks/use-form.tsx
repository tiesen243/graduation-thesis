// oxlint-disable react/refs

import type { StandardSchemaV1 } from '@rozumari/lib/standard-schema'

import * as React from 'react'

interface FormError {
  message: string | null
  issues?: StandardSchemaV1.Issue[]
}

type OnChangeParam<TValue> =
  | React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  | TValue

interface FormFieldProps<TName extends keyof TValues, TValues> {
  name: TName
  render: (props: {
    field: {
      id: string
      name: TName
      value: TValues[TName]
      onChange: (params: OnChangeParam<TValues[TName]>) => void
      onBlur: () => void

      // Accessibility attributes
      form: string
      'aria-describedby': string
      'aria-invalid': boolean
    }
    meta: {
      descriptionId: string
      errorId: string
      errors: StandardSchemaV1.Issue[]
      isPending: boolean
    }
  }) => React.ReactNode
}

interface UseFormReturn<TValues, TData, TError extends FormError> {
  formId: string
  Form: React.FC<{ children: React.ReactNode }>
  Field: <TName extends keyof TValues>(
    props: FormFieldProps<TName, TValues>
  ) => React.ReactNode

  handleSubmit: (event?: React.SubmitEvent) => void
  reset: () => void

  state: {
    values: TValues
    data: TData | null
    error: TError | null
    isPending: boolean
  }
}

interface FormContextValue<TValues> {
  formId: string

  formValuesRef: React.RefObject<TValues>
  formErrorRef: React.RefObject<FormError | null>

  setFormValue: <TKey extends keyof TValues>(
    field: TKey,
    value: TValues[TKey]
  ) => void
  validate: (values: TValues) => Promise<TValues>
}

const FormContext = React.createContext<FormContextValue<unknown> | null>(null)
const PendingContext = React.createContext<boolean>(false)

const extractError = (errors: StandardSchemaV1.Issue[], name: string) =>
  errors.filter((issue) => {
    if (!issue.path || issue.path.length === 0) return false
    const [firstPath] = issue.path
    if (typeof firstPath === 'object' && 'key' in firstPath)
      return firstPath.key === name
    return firstPath === name
  })

function FormField<TName extends keyof TValues, TValues>({
  name,
  render,
}: FormFieldProps<TName, TValues>) {
  const id = React.useId()
  const isPending = React.use(PendingContext)

  const formContext = React.use(FormContext)
  if (!formContext)
    throw new Error('FormField must be used within a FormProvider')

  const { formId, formValuesRef, formErrorRef, setFormValue, validate } =
    formContext as FormContextValue<TValues>

  const [value, setValue] = React.useState<TValues[TName]>(
    () => formValuesRef.current?.[name] ?? (undefined as TValues[TName])
  )
  const prevValueRef = React.useRef(value)

  const [errors, setErrors] = React.useState<StandardSchemaV1.Issue[]>(() =>
    extractError(formErrorRef.current?.issues ?? [], name as string)
  )

  const onChange = React.useCallback(
    (param: OnChangeParam<TValues[TName]>) => {
      if (param === null) return

      setErrors([])

      let newValue: unknown
      if (typeof param === 'object' && param !== null && 'target' in param) {
        const target = param.target as HTMLInputElement

        if (target.type === 'checkbox') newValue = target.checked
        else if (target.type === 'number')
          newValue = Number.isNaN(target.valueAsNumber)
            ? 0
            : target.valueAsNumber
        else newValue = target.value
      } else newValue = param

      setValue(newValue as never)
      setFormValue(name, newValue as TValues[TName])
    },
    [name, setFormValue]
  )

  const onBlur = React.useCallback(async () => {
    if (prevValueRef.current === value || !formValuesRef.current) return
    prevValueRef.current = value

    try {
      const result = await validate({
        ...formValuesRef.current,
        [name]: value,
      })
      setFormValue(name, result[name])
    } catch (error) {
      if (!Array.isArray(error)) return
      setErrors(extractError(error, name as string))
    }
  }, [name, value, validate, setFormValue, formValuesRef])

  const descriptionId = `form-${formId}-field-${id}-description`
  const errorId = `form-${formId}-field-${id}-error`

  return render({
    field: {
      id: `form-${formId}-field-${id}`,
      name,
      value,
      onChange,
      onBlur,

      form: `form-${formId}`,
      'aria-describedby':
        errors.length > 0 ? `${descriptionId} ${errorId}` : descriptionId,
      'aria-invalid': errors.length > 0,
    },
    meta: { descriptionId, errorId, errors, isPending },
  })
}

function useForm<
  TValues,
  TData,
  TError extends FormError,
  TSchema extends
    | StandardSchemaV1
    | ((values: TValues) => TResults | Promise<TResults>),
  TResults extends StandardSchemaV1.Result<TValues>,
>(props: {
  defaultValues: TValues
  schema?: TSchema
  onSubmit: (data: TValues) => TData | Promise<TData>
  onSuccess?: (data: TData) => unknown | Promise<unknown>
  onError?: (error: TError) => unknown | Promise<unknown>
}): UseFormReturn<TValues, TData, TError> {
  const { defaultValues, schema, onSubmit, onSuccess, onError } = props

  const formId = React.useId()
  const formValuesRef = React.useRef<TValues>(defaultValues)
  const formDataRef = React.useRef<TData | null>(null)
  const formErrorRef = React.useRef<TError | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const setFormValue = React.useCallback(
    <TKey extends keyof TValues>(field: TKey, value: TValues[TKey]) => {
      formValuesRef.current = { ...formValuesRef.current, [field]: value }
    },
    []
  )

  const validate = React.useCallback(
    async (values: TValues): Promise<TValues> => {
      if (!schema) return values

      const result =
        '~standard' in schema
          ? await schema['~standard'].validate(values)
          : await schema(values)

      if ('issues' in result) throw result.issues
      return (result.value ?? result) as TValues
    },
    [schema]
  )

  const handleSubmit = React.useCallback(
    (event?: React.SubmitEvent) => {
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      formDataRef.current = null
      formErrorRef.current = null

      startTransition(async () => {
        try {
          const validValues = await validate(formValuesRef.current)
          formValuesRef.current = validValues

          const result = await onSubmit(validValues)
          formDataRef.current = result ?? null
          await onSuccess?.(result)
        } catch (error) {
          let issues: FormError['issues']
          if (Array.isArray(error)) issues = error

          let message = 'Validate failed'
          if (error instanceof Error) ({ message } = error)

          formErrorRef.current = { message, issues } as TError
          await onError?.(formErrorRef.current)
        }
      })
    },
    [onSubmit, onSuccess, onError, validate]
  )

  const reset = React.useCallback(
    () =>
      startTransition(() => {
        formValuesRef.current = defaultValues
        formDataRef.current = null
        formErrorRef.current = null
      }),
    [defaultValues]
  )

  const formContextValue = React.useMemo<FormContextValue<TValues>>(
    () => ({
      formId,
      formValuesRef,
      formErrorRef,
      setFormValue,
      validate,
      isPending,
    }),
    [formId, setFormValue, validate, isPending]
  )

  return React.useMemo(
    () => ({
      formId: `form-${formId}`,

      Form: ({ children }: { children: React.ReactNode }) => (
        <FormContext value={formContextValue as never}>{children}</FormContext>
      ),
      Field: FormField,

      handleSubmit,
      reset,

      state: {
        get values() {
          return formValuesRef.current
        },
        get data() {
          return formDataRef.current
        },
        get error() {
          return formErrorRef.current
        },
        get isPending() {
          return isPending
        },
      },
    }),
    [isPending, handleSubmit, reset, formContextValue, formId]
  )
}

export type { UseFormReturn }
export { useForm }
