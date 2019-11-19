import contextlib
import os
import subprocess
from shlex import quote

from django.utils import timezone

from .ssh_key import store_key
from .models import Mirror, Repository, Synchronization


class _Undefined:
    pass


def join(tokens):
    # TODO: remove once Python 3.8 is prevalent (see shlex.join)
    return ' '.join(quote(arg) for arg in tokens)


def run_git(*args, key_file: str = None, **process_args):
    command = ['git']
    command.extend(args)
    return subprocess.run(
        command,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        env={
            'GIT_SSH_COMMAND': join(['ssh',
                                     '-F', '/dev/null',
                                     '-i', key_file or '/dev/null',
                                     '-o', 'UserKnownHostsFile=/dev/null',
                                     '-o', 'StrictHostKeyChecking=no'])
        }, **process_args)


def git_fetch(repo: Repository):
    with store_key(getattr(repo.access_key, 'private_key', None)) as key_path:
        if os.path.isdir(repo.directory):
            yield run_git('remote', '--verbose', 'set-url', 'origin', repo.url)
            yield run_git('remote', '--verbose', 'update', 'origin',
                          key_file=key_path, cwd=repo.directory)
        else:
            yield run_git('clone', '--verbose', '--mirror', repo.url, repo.directory,
                          key_file=key_path)


def git_push(repo: Repository, source_dir: str):
    with store_key(getattr(repo.access_key, 'private_key', None)) as key_path:
        yield run_git('push', '--verbose', '--mirror', repo.url,
                      key_file=key_path, cwd=source_dir)


@contextlib.contextmanager
def record_synchronization(mirror, reverse):
    sync_process = Synchronization()
    sync_process.started_at = timezone.now()
    sync_process.was_successful = _Undefined
    sync_process.log = _Undefined
    sync_process.mirror = mirror
    sync_process.reverse = reverse
    was_successful = True
    log = None

    try:
        yield sync_process
    except subprocess.CalledProcessError as exc:
        was_successful = False
        log = exc.output
        raise
    except Exception as exc:
        was_successful = False
        log = str(exc)
        raise
    finally:
        sync_process.finished_at = timezone.now()
        if sync_process.was_successful == _Undefined:
            sync_process.was_successful = was_successful
        if sync_process.log == _Undefined:
            sync_process.log = log
        elif log:
            sync_process.log += log
        sync_process.save()


def synchronize(mirror: Mirror, reverse: bool = False):
    source, target = mirror.source_repository, mirror.target_repository
    if reverse:
        source, target = target, source
    with record_synchronization(mirror, reverse) as sync_process:
        def _sync():
            yield from git_fetch(source)
            yield from git_push(target, source.directory)
        sync_process.log = ''
        for process in _sync():
            sync_process.log += process.stdout.decode() + '\n'
    return sync_process
