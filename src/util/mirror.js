import { stat } from 'fs'
import mkdir from 'mkdirp'
import Q from 'q'
import spawn from './spawn'

const git = (key, args, opts) => {
  return spawn('git', args, Object.assign({}, opts, {
    env: {
      GIT_SSH_COMMAND: `ssh -F /dev/null -i '${key}' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no`
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

function RepositoryIO (keyIO) {
  async function fetch (targetDirectory, repo) {
    const repoExists = await existsDir(targetDirectory)
    const key = await repo.getAccessKey()

    return await keyIO.storeTemp(key, async keyFile => {
      if (repoExists) {
        return await git(keyFile, ['remote', '--verbose', 'update', 'origin'], { cwd: targetDirectory })
      } else {
        return await git(keyFile, ['clone', '--verbose', '--mirror', repo.url, targetDirectory])
      }
    })
  }

  async function push (sourceDirectory, destRepo) {
    const key = await destRepo.getAccessKey()

    return await keyIO.storeTemp(key, async keyFile => {
      return await git(keyFile, ['push', '--verbose', '--mirror', destRepo.url], { cwd: sourceDirectory })
    })
  }

  return { fetch, push }
}

export default function MirrorControl (workingDirectory, keyIO, Synchronization) {
  const repoIO = RepositoryIO(keyIO)

  const repoDir = repo => `${workingDirectory}/repo:${repo.id}`
  const syncFlow = (reverse, repos) => reverse ? repos.reverse() : repos

  const log = async init => {
    let result
    const syncLog = Synchronization.build({
      startedOn: new Date()
    })

    try {
      result = await init(syncLog)
      syncLog.log = result
    } catch (e) {
      syncLog.log = e.message.trim()
      syncLog.wasSuccessful = false
    } finally {
      syncLog.finishedOn = new Date()
      await syncLog.save()
    }

    return syncLog
  }

  const sync = (mirror, reverse = false) => {
    return log(async syncLog => {
      await createDir(`${workingDirectory}`)
      const [srcRepo, destRepo] = syncFlow(reverse, [
        await mirror.getSourceRepository(),
        await mirror.getTargetRepository()
      ])
      const dir = repoDir(srcRepo)
      let output = ''

      syncLog.set({
        description: `${srcRepo.name} → ${destRepo.name}`,
        sourceUrl: srcRepo.url,
        targetUrl: destRepo.url,
        userId: mirror.userId
      })

      try {
        output += await repoIO.fetch(dir, srcRepo) + '\n'
        output += await repoIO.push(dir, destRepo) + '\n'
        syncLog.wasSuccessful = true
      } catch (e) {
        output += e.message.trim() + '\n'
        syncLog.wasSuccessful = false
      }

      return output
    })
  }

  return { sync }
}
