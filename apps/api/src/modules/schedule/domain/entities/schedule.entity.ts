import { ScheduleItemId } from '@rozumari/contract/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Schema from 'effect/Schema'

export class Schedule extends Schema.TaggedClass<Schedule>()(
  'schedule/domain/Schedule',
  ScheduleSchema
) {
  public update(
    props: Partial<
      Pick<Schedule, 'startDate' | 'endDate' | 'daysOfWeek' | 'time'>
    >
  ) {
    return Schedule.make({
      ...structuredClone(this),
      ...props,
    })
  }
}

export class ScheduleItem extends Schema.TaggedClass<ScheduleItem>()(
  'schedule/domain/ScheduleItem',
  {
    id: ScheduleItemId,
    scheduleId: ScheduleSchema.fields.id,
    slot: Schema.String,
    quantity: Schema.Number,
  }
) {
  public update(props: Partial<Pick<ScheduleItem, 'slot' | 'quantity'>>) {
    return ScheduleItem.make({
      ...structuredClone(this),
      ...props,
    })
  }
}
