'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import '@xterm/xterm/css/xterm.css'

export function useTerminal(containerRef: React.RefObject<HTMLDivElement | null>, wsUrl: string | null) {
  const termRef = useRef<XTerm | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const searchRef = useRef<SearchAddon | null>(null)

  const connect = useCallback(() => {
    if (!wsUrl || !containerRef.current) return

    const term = new XTerm({
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#3fb950',
        selectionBackground: '#3fb95033',
        black: '#0d1117',
        brightBlack: '#8b949e',
        green: '#3fb950',
        brightGreen: '#56d364',
        blue: '#58a6ff',
        brightBlue: '#79c0ff',
        red: '#f85149',
        yellow: '#e3b341',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
    })

    const fit = new FitAddon()
    const links = new WebLinksAddon()
    const search = new SearchAddon()

    term.loadAddon(fit)
    term.loadAddon(links)
    term.loadAddon(search)
    term.open(containerRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current = fit
    searchRef.current = search

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}${wsUrl}&cols=${term.cols}&rows=${term.rows}`)
    wsRef.current = ws

    ws.onopen = () => term.writeln('\x1b[32m[Nyx]\x1b[0m Terminal connecté. Bon pentest!\r\n')
    ws.onmessage = (e) => term.write(typeof e.data === 'string' ? e.data : new Uint8Array(e.data))
    ws.onclose = () => term.writeln('\r\n\x1b[31m[Nyx]\x1b[0m Connexion fermée.')
    ws.onerror = () => term.writeln('\r\n\x1b[31m[Nyx]\x1b[0m Erreur de connexion.')

    term.onData((data) => ws.readyState === WebSocket.OPEN && ws.send(data))

    const observer = new ResizeObserver(() => {
      fit.fit()
      ws.readyState === WebSocket.OPEN &&
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      ws.close()
      term.dispose()
    }
  }, [wsUrl, containerRef])

  useEffect(() => connect(), [connect])

  return {
    search: (text: string) => searchRef.current?.findNext(text),
    clear: () => termRef.current?.clear(),
    fit: () => fitRef.current?.fit(),
  }
}
