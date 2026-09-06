import { ScheduleItemSchema } from '@rozumari/contract/schedule/schemas/schedule-item.schema'
import * as Schema from 'effect/Schema'

export class ScheduleItem extends Schema.TaggedClass<ScheduleItem>()(
  'schedule/domain/ScheduleItem',
  ScheduleItemSchema
) {
  public update(props: Partial<Pick<ScheduleItem, 'slot' | 'quantity'>>) {
    return ScheduleItem.make({
      ...structuredClone(this),
      ...props,
    })
  }
}
