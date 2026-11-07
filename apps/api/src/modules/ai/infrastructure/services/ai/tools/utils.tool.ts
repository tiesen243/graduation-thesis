import { jsonSchema, tool } from 'ai'

const getTodayDateSchema = jsonSchema<object>({
  type: 'object',
})

export const createUtilsTools = () => ({
  getTodayDate: tool({
    description: 'Get today date in YYYY-MM-DD format',
    inputSchema: getTodayDateSchema,
    execute: () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  }),
})
