import { createServer } from 'http'
import next from 'next'
import { WebSocketServer, WebSocket } from 'ws'
import * as pty from 'node-pty'
import { sessions } from './src/infrastructure/docker/sessions.store'
import { cacheService, CACHE_KEYS } from './src/infrastructure/cache'
// NOT a top-level import: `src/repositories` transitively imports `@/lib/prisma`, which builds its
// PrismaPg connection pool from `process.env.DATABASE_URL` at module-evaluation time. Top-level
// imports execute before `app.prepare()` below runs Next's own .env loading, so importing it here
// would permanently bake in an undefined connection string for the life of this process (every
// query would fail with a Postgres SASL auth error). Importing it lazily, after `app.prepare()`
// has resolved, guarantees env vars are already loaded.
type CommandLogRepo = typeof import('./src/repositories').commandLogRepo
let commandLogRepoPromise: Promise<CommandLogRepo> | null = null
function getCommandLogRepo(): Promise<CommandLogRepo> {
  if (!commandLogRepoPromise) commandLogRepoPromise = import('./src/repositories').then((m) => m.commandLogRepo)
  return commandLogRepoPromise
}

// Best-effort command journal: buffers raw keystrokes into lines, stripping the common ANSI
// escape sequences (arrow keys, etc.) so history/tab-completion navigation doesn't pollute the
// log. It won't perfectly reconstruct what a real terminal emulator would show (e.g. mid-line
// edits via arrow keys still append rather than splice), but it captures typed commands well
// enough for a post-session review.
function createLineBuffer(sessionId: string) {
  let buffer = ''
  return {
    feed(chunk: string) {
      let i = 0
      while (i < chunk.length) {
        const char = chunk[i]
        if (char === '\x1b') {
          // Skip a CSI/escape sequence: ESC '[' ... <letter>, or a single-char escape otherwise.
          i++
          if (chunk[i] === '[') {
            i++
            while (i < chunk.length && !/[A-Za-z~]/.test(chunk[i])) i++
            i++
          }
          continue
        }
        if (char === '\r' || char === '\n') {
          const command = buffer.trim()
          buffer = ''
          if (command.length > 0) {
            getCommandLogRepo()
              .then((repo) => repo.create(sessionId, command))
              .catch((err) => console.error('[CommandLog] Failed to persist:', err))
          }
        } else if (char === '\x7f' || char === '\b') {
          buffer = buffer.slice(0, -1)
        } else if (char === '\x03') {
          buffer = ''
        } else if (char >= ' ') {
          buffer += char
        }
        i++
      }
    },
  }
}

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000')
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // The third (parsedUrl) argument is optional — Next parses req.url itself when omitted.
    // Passing it via the legacy `url.parse()` triggers Node's DEP0169 warning for no benefit here.
    handle(req, res)
  })

  // `noServer: true` is required: attaching a ws.WebSocketServer directly to `server` (via
  // `{ server }`) makes it the ONLY 'upgrade' listener, which silently swallows every upgrade
  // request that isn't ours — including Next's own HMR websocket (/_next/webpack-hmr). That
  // breaks Fast Refresh (forcing full-page reloads) and can leave the client desynced enough
  // that event handlers stop firing. Instead we handle 'upgrade' ourselves below and forward
  // anything that isn't our terminal path to Next's upgrade handler.
  const wss = new WebSocketServer({ noServer: true })
  const nextUpgradeHandler = app.getUpgradeHandler()

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url!, 'http://localhost')
    if (pathname === '/ws/terminal') {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
    } else {
      nextUpgradeHandler(req, socket, head).catch(() => socket.destroy())
    }
  })

  wss.on('connection', async (ws: WebSocket, req) => {
    const url = new URL(req.url!, 'http://localhost')
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      ws.close(1008, 'sessionId required')
      return
    }

    const session = sessions.get(sessionId)
    if (!session) {
      ws.close(1008, `Session ${sessionId} not found`)
      return
    }

    // The session could be a lab or a TP — EXPIRE is a no-op on a key that doesn't exist, so
    // refreshing both is harmless and avoids needing to know which type this session is.
    await cacheService.expire(CACHE_KEYS.labSession(sessionId), 7200)
    await cacheService.expire(CACHE_KEYS.tpSession(sessionId), 7200)

    // `docker exec` spawns the LOCAL `docker` CLI on the host running this server, not a shell
    // inside the container — so `cwd` here would set the working directory for that host-side
    // process, not the container's. On Windows there is no `/root`, which makes node-pty's
    // CreateProcess call fail *synchronously* with error 267 ("invalid directory"). Since this ran
    // unguarded, the exception aborted the handler before `term.onData`/`ws.on('message')` were
    // ever wired up — the socket stayed open (greeting already sent) but the terminal was dead:
    // nothing typed ever reached anything. Dropping `cwd` (docker exec sets its own inside the
    // container) and wrapping the spawn fixes it and surfaces future failures instead of hiding them.
    let term: pty.IPty
    try {
      term = pty.spawn('docker', ['exec', '-it', session.kaliId, 'bash'], {
        name: 'xterm-256color',
        cols: parseInt(url.searchParams.get('cols') ?? '120'),
        rows: parseInt(url.searchParams.get('rows') ?? '40'),
        env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' } as { [key: string]: string },
      })
    } catch (err) {
      console.error('[Terminal] Failed to spawn docker exec:', err)
      ws.send(`\r\n\x1b[31m[Nyx]\x1b[0m Impossible de démarrer le terminal : ${(err as Error).message}\r\n`)
      ws.close(1011, 'pty spawn failed')
      return
    }

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data)
    })

    term.onExit(({ exitCode }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\r\n\x1b[31m[Nyx]\x1b[0m Session terminal terminée (code ${exitCode}).\r\n`)
      }
    })

    const lineBuffer = createLineBuffer(sessionId)

    ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString())
        if (msg.type === 'resize') {
          term.resize(msg.cols, msg.rows)
          return
        }
      } catch {}
      const text = data.toString()
      lineBuffer.feed(text)
      term.write(text)
    })

    ws.on('close', () => term.kill())
    ws.on('error', () => term.kill())

    const timeout = setTimeout(
      () => {
        ws.close(1001, 'Session timeout')
        term.kill()
      },
      parseInt(process.env.LAB_SESSION_TIMEOUT_HOURS ?? '2') * 3600 * 1000
    )

    ws.on('close', () => clearTimeout(timeout))
  })

  server.listen(port, () => {
    console.log(`> Nyx ready on http://localhost:${port}`)
    console.log(`> WebSocket terminal on ws://localhost:${port}/ws/terminal`)
  })

  const shutdown = async () => {
    console.log('> Shutting down...')
    server.close()
    process.exit(0)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
