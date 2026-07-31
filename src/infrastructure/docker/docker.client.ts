import Docker from 'dockerode'

declare global {
  var dockerGlobal: Docker | undefined
}

// Inside the containerized deployment (docker-compose.yml mounts the host's Linux socket at this
// path) DOCKER_SOCKET should stay unset or explicitly "/var/run/docker.sock". When running the app
// directly on a Windows host (e.g. `npm run dev` outside Docker), Docker Desktop exposes its API
// through a named pipe instead — there is no /var/run/docker.sock to connect to.
function defaultSocketPath(): string {
  return process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'
}

export function getDockerClient(): Docker {
  if (!globalThis.dockerGlobal) {
    globalThis.dockerGlobal = new Docker({ socketPath: process.env.DOCKER_SOCKET || defaultSocketPath() })
  }
  return globalThis.dockerGlobal
}
