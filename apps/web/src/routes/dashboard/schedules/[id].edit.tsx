import { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import { Button } from '@rozumari/ui/components/button'
import { Calendar } from '@rozumari/ui/components/calendar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@rozumari/ui/components/field'
import { ChevronDownIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@rozumari/ui/components/popover'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'
import { ItemField } from '@/routes/dashboard/schedules/_components/item-field'

import type { Route } from './+types/[id].edit'

const updateScheduleForm = FormBuilder.empty
  .add('date', UpdateScheduleDto.Input.fields.date)
  .add('time', UpdateScheduleDto.Input.fields.time)
  .add('items', UpdateScheduleDto.Input.fields.items)
  .make()

const parseLocalDate = (dateStr?: string) => {
  if (!dateStr) return
  const [year = 0, month = 0, day = 0] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateString = (date?: Date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ScheduleEditPage({ params }: Route.ComponentProps) {
  const { data, isLoading, isError, refetch } = useQuery(
    api.schedule.show.queryOptions({ params: params as never })
  )

  if (isLoading || isError || !data?.data) return <div>Loading...</div>

  return (
    <updateScheduleForm.Root
      defaultValues={{
        date: data.data.date,
        time: data.data.time,
        items: data.data.items,
      }}
      render={({ meta: { formId }, handleSubmit }) => (
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(
              (payload) =>
                api.schedule.update.mutateEffect({
                  params: data.data,
                  payload,
                }),
              {
                onSuccess: async () => {
                  await refetch()
                  toast.add({
                    type: 'success',
                    title: 'Schedule updated successfully',
                  })
                },
                onError: (error) =>
                  toast.add({
                    type: 'error',
                    title: 'Failed to update schedule',
                    description: error.message,
                  }),
              }
            )
          }}
        />
      )}
    >
      <FieldSet>
        <FieldLegend>Update Schedule</FieldLegend>
        <FieldDescription>
          Update the schedule for the device. You can change the date, time, and
          items to be scheduled. Please note that changing the date or time may
          affect the execution of the schedule.
        </FieldDescription>

        <FieldGroup>
          <updateScheduleForm.Field
            name='date'
            render={({ field: { value, onChange, ...field }, meta }) => {
              const selectedDate = parseLocalDate(value)

              return (
                <Field data-invalid={meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.id}>Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant='outline'
                          data-empty={!value}
                          className='justify-between text-left font-normal data-[empty=true]:text-muted-foreground'
                          {...field}
                        >
                          {selectedDate ? (
                            selectedDate.toLocaleDateString()
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <ChevronDownIcon data-icon='inline-end' />
                        </Button>
                      }
                    />
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={(date) => onChange(formatDateString(date))}
                        defaultMonth={selectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError id={meta.errorId} errors={meta.errors} />
                </Field>
              )
            }}
          />

          <updateScheduleForm.Field
            name='time'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Time</FieldLabel>
                <Input
                  {...field}
                  type='time'
                  step={300}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <updateScheduleForm.Field
            name='items'
            render={(props) => (
              <ItemField {...props} deviceId={data.data.device.id} />
            )}
          />

          <Field>
            <updateScheduleForm.Submit
              render={({ meta }) => (
                <Button
                  type='submit'
                  form={meta.formId}
                  disabled={meta.isPending}
                >
                  {meta.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
    </updateScheduleForm.Root>
  )
}
