import { ScheduleSchema } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Schema from 'effect/Schema'

export class Schedule extends Schema.TaggedClass<Schedule>()(
  'schedule/domain/Schedule',
  ScheduleSchema
) {
  public update(props: Partial<Pick<Schedule, 'date' | 'time' | 'status'>>) {
    return Schedule.make({
      ...structuredClone(this),
      ...props,
    })
  }
}
