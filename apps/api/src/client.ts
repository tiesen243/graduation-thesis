import readline from 'node:readline'

const ws = new WebSocket('ws://localhost:3000/ws?topic=sensor')

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
})

ws.addEventListener('open', () => {
  console.log('Connected to WebSocket server')
  reader.prompt()
})

ws.addEventListener('message', (event) => {
  console.log(`\n< ${event.data}`)
  reader.prompt()
})

ws.addEventListener('error', (event) => {
  console.error('\nWebSocket error:', event)
})

ws.addEventListener('close', (event) => {
  console.log(`\nDisconnected (code: ${event.code})`)
  reader.close()
  process.exit(0)
})

reader.on('line', (line) => {
  const message = line.trim()

  if (!message) {
    reader.prompt()
    return
  }

  if (ws.readyState !== WebSocket.OPEN) {
    console.log('WebSocket is not connected')
    return
  }

  ws.send(message)
  reader.prompt()
})

reader.on('close', () => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})

process.on('SIGINT', () => {
  reader.close()

  if (ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})
