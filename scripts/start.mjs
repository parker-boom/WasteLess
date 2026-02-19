import { spawn } from 'node:child_process'
import process from 'node:process'

function getNpmCommand() {
  if (process.env.npm_execpath) {
    return { command: process.execPath, prefixArgs: [process.env.npm_execpath] }
  }

  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    prefixArgs: [],
  }
}

function parseNodeVersion(version) {
  const [major, minor] = version.split('.').map((value) => Number(value))
  return { major, minor }
}

function isSupportedNodeVersion({ major, minor }) {
  return (major === 20 && minor >= 19) || major >= 22
}

function runNpmStep(args, stepName, helpText, options = {}) {
  return new Promise((resolve, reject) => {
    const npm = getNpmCommand()
    const child = spawn(npm.command, [...npm.prefixArgs, ...args], {
      stdio: 'inherit',
    })

    child.on('error', (error) => {
      reject(
        new Error(
          `${stepName} could not start.\nReason: ${error.message}\nWhat to do: ${helpText}`,
        ),
      )
    })

    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      if (options.allowInterrupt && (code === 130 || signal === 'SIGINT')) {
        resolve()
        return
      }

      reject(
        new Error(
          `${stepName} failed with exit code ${code}.\nWhat to do: ${helpText}`,
        ),
      )
    })
  })
}

async function main() {
  console.log('\nWasteLess start: checking environment...\n')

  const nodeVersion = parseNodeVersion(process.versions.node)
  if (!isSupportedNodeVersion(nodeVersion)) {
    console.error(
      [
        `Unsupported Node.js version: ${process.versions.node}`,
        'Required: ^20.19.0 or >=22.12.0',
        'What to do: install a supported Node LTS version, then rerun `npm start`.',
      ].join('\n'),
    )
    process.exit(1)
  }

  console.log(`Node.js version ${process.versions.node} is supported.\n`)

  console.log('Step 1/3: Installing dependencies...\n')
  await runNpmStep(
    ['install'],
    'Dependency installation',
    'Check your internet connection and package registry access, then retry `npm start`.',
  )

  console.log('\nStep 2/3: Building the app...\n')
  await runNpmStep(
    ['run', 'build'],
    'Build',
    'Read the build errors above, fix the code or config issue, then rerun `npm start`.',
  )

  console.log('\nStep 3/3: Starting the dev server...\n')
  await runNpmStep(
    ['run', 'dev'],
    'Dev server',
    'Ensure port 5173 is free or change the port, then rerun `npm start`.',
    { allowInterrupt: true },
  )
}

main().catch((error) => {
  console.error('\nWasteLess start failed.\n')
  console.error(error.message)
  process.exit(1)
})
