export const COMMANDS = {
  help: 'help',
  link: 'link',
  unlink: 'unlink',
  ask: 'ask',
} as const

export const parseCommand = (text: string) => {
  const match = /^\/(?<command>\w+)(?:\s+(?<args>[\s\S]*))?$/u.exec(text.trim())

  if (!match?.groups?.command) return null

  return {
    command: match.groups.command.toLowerCase(),
    args: match.groups.args?.trim() ?? '',
  }
}
