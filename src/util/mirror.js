import { stat, writeFile, unlink } from 'fs'
import mkdir from 'mkdirp'
import { exec } from 'child-process-promise'
import Q from 'q'

function sshEnv (keyFile) {
  return `GIT_SSH_COMMAND="ssh -i '${keyFile.path}' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"`
}

async function createDir (dir) {
  return await Q.nfcall(mkdir, dir)
}

async function existsDir (dir) {
  try {
    const stats = await Q.nfcall(stat, dir)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

async function tempKey (key, targetDirectory) {
  const keyFile = `${targetDirectory}/key:${key.id}`
  await Q.nfcall(writeFile, keyFile, key.content, { encoding: 'utf-8', mode: 0o600 })
  return {
    path: keyFile,
    remove: () => Q.nfcall(unlink, keyFile)
  }
}

async function fetch (repo, targetDirectory) {
  const repoDir = `${targetDirectory}/repo:${repo.id}`
  const repoExists = await existsDir(repoDir)
  const key = await repo.getAccessKey()
  const keyFile = await tempKey(key, targetDirectory)

  try {
    if (repoExists) {
      await exec(`cd "${repoDir}"; ${sshEnv(keyFile)} git remote update origin`)
    } else {
      await exec(`${sshEnv(keyFile)} git clone --mirror "${repo.url}" "${repoDir}"`)
    }
  } finally {
    await keyFile.remove()
  }

  return repoDir
}

async function push (repo, repoDir, targetDirectory) {
  const key = await repo.getAccessKey()
  const keyFile = await tempKey(key, targetDirectory)

  try {
    const command = `cd "${repoDir}"; ${sshEnv(keyFile)} git push --mirror "${repo.url}"`
    await exec(command)
  } finally {
    await keyFile.remove()
  }

  return true
}

export async function sync (mirror, repositoryDir) {
  await createDir(`${repositoryDir}`)
  const srcRepo = await mirror.getSourceRepository()
  const destRepo = await mirror.getTargetRepository()
  const srcRepoDir = await fetch(srcRepo, repositoryDir)
  return await push(destRepo, srcRepoDir, repositoryDir)
}
