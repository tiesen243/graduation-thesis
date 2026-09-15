import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

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
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

function UpdateScheduleFormSubmit({
  id,
  children,
}: Readonly<{ id: ScheduleId; children: React.ReactNode }>) {
  const formId = updateScheduleForm.useValue((s) => s.formId)
  const isPending = updateScheduleForm.useValue((s) => s.isPending)

  const queryClient = useQueryClient()

  const handleSubmit = updateScheduleForm.useSubmit(
    (payload) => api.schedule.update.mutate({ params: { id }, payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.schedule.show.getQueryKey({ params: { id } }),
        })
        toast.success('Schedule updated successfully')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldSet disabled={isPending}>{children}</FieldSet>
    </form>
  )
}

export default function ScheduleEditPage({ params }: Route.ComponentProps) {
  const { data, isLoading, isError } = useQuery(
    api.schedule.show.queryOptions({ params: params as never })
  )

  if (isLoading || isError || !data?.data) return <div>Loading...</div>

  return (
    <updateScheduleForm.Provider defaultValues={data.data}>
      <UpdateScheduleFormSubmit id={data.data.id}>
        <FieldLegend>Update Schedule</FieldLegend>
        <FieldDescription>
          Update the schedule for the device. You can change the date, time, and
          items to be scheduled. Please note that changing the date or time may
          affect the execution of the schedule.
        </FieldDescription>

        <FieldGroup>
          <updateScheduleForm.Field
            name='date'
            render={({
              field: { value, ...field },
              meta,
              helpers: { handleChange },
            }) => {
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
                        onSelect={(date) =>
                          handleChange(formatDateString(date))
                        }
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
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Time</FieldLabel>
                <Input
                  {...field}
                  type='time'
                  step={300}
                  onChange={(e) => handleChange(e.target.value)}
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
            <Button type='submit'>Save Changes</Button>
          </Field>
        </FieldGroup>
      </UpdateScheduleFormSubmit>
    </updateScheduleForm.Provider>
  )
}
