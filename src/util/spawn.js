import { spawn } from 'child-process-promise'

export default (command, args, options) => {
  const process = spawn(command, args, options)
  let output = ''

  process.childProcess.stdout.on('data', data => { output += data.toString() })
  process.childProcess.stderr.on('data', data => { output += data.toString() })

  return process.then(
    () => Promise.resolve(output),
    (err) => Promise.reject(err)
  )
}
