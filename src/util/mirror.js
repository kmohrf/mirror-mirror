import { stat } from 'fs'
import mkdir from 'mkdirp'
import Q from 'q'
import spawn from './spawn'

const git = (key, args, opts) => {
  return spawn('git', args, Object.assign({}, opts, {
    env: {
      GIT_SSH_COMMAND: `ssh -i '${key}' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no`
    }
  }))
}

const createDir = async dir => {
  if (!await existsDir(dir)) {
    return await Q.nfcall(mkdir, dir)
  }
}

const existsDir = async dir => {
  try {
    const stats = await Q.nfcall(stat, dir)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

function RepositoryIO (keyIO, targetDirectory) {
  async function fetch (repo) {
    const repoDir = `${targetDirectory}/repo:${repo.id}`
    const repoExists = await existsDir(repoDir)
    const key = await repo.getAccessKey()

    await keyIO.storeTemp(key, async keyFile => {
      if (repoExists) {
        await git(keyFile, ['remote', 'update', 'origin'], { cwd: repoDir })
      } else {
        await git(keyFile, ['clone', '--mirror', repo.url, repoDir])
      }
    })

    return repoDir
  }

  async function push (srcRepoDir, destRepo) {
    const key = await destRepo.getAccessKey()
    await keyIO.storeTemp(key, async keyFile => {
      await git(keyFile, ['push', '--mirror', destRepo.url], { cwd: srcRepoDir })
    })
    return true
  }

  return { fetch, push }
}

export default function MirrorControl (workingDirectory, keyIO) {
  const repoIO = RepositoryIO(keyIO, workingDirectory)

  async function sync (mirror, reverse = false) {
    await createDir(`${workingDirectory}`)
    const srcRepo = await mirror.getSourceRepository()
    const destRepo = await mirror.getTargetRepository()
    const srcRepoDir = await repoIO.fetch(reverse ? destRepo : srcRepo)
    return await repoIO.push(srcRepoDir, reverse ? srcRepo : destRepo)
  }

  return { sync }
}
