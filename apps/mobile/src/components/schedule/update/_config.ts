import { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'

export const updateScheduleForm = FormBuilder.empty
  .add('date', UpdateScheduleDto.Input.fields.date)
  .add('time', UpdateScheduleDto.Input.fields.time)
  .add('items', UpdateScheduleDto.Input.fields.items)
  .make()
