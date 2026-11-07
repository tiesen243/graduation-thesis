export const HELP_MESSAGE = `
Available commands:

/help
  Show available commands and AI tools.

/link {userId}
  Link this thread to your account.

/unlink
  Unlink this thread from your account.

/ask {message}
  Ask AI a question.

Available AI tools:

User:
  getUserInfo
    Retrieve your account information.

Devices:
  getDeviceList
    List all your devices.

  getDeviceInfo
    Get information about a specific device.

Schedules:
  getScheduleList
    List schedules, optionally filtered by device or date.

  getScheduleInfo
    Get details about a specific schedule.

Utils:
  getTodayDate
    Get today's date (YYYY-MM-DD).

Messenger:
  AI can interact with Messenger using available chat tools.
  Actions requiring approval will ask for your confirmation.

Examples:

/link your-user-id
/ask Show me all my devices.
/ask What schedules do I have today?
`.trim()

export const LINK_REQUIRED_MESSAGE =
  'Your account is not linked yet.\n\nPlease use: /link {userId}'

export const INVALID_COMMAND_MESSAGE = HELP_MESSAGE
