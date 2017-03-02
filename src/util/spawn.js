import { spawn } from 'child-process-promise'

export default (command, args, options) => {
  const process = spawn(command, args, options)
  let stdout = ''
  let stderr = ''

  process.childProcess.stdout.on('data', data => { stdout += data.toString() })
  process.childProcess.stderr.on('data', data => { stderr += data.toString() })

  return process.then(
    () => Promise.resolve({ stdout, stderr }),
    (err) => Promise.reject(err)
  )
}
