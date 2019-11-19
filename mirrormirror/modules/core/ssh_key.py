import contextlib
import dataclasses
import os
import subprocess
import tempfile


@dataclasses.dataclass
class SSHKeyMetadata:
    type: str
    public_key: str
    fingerprint: str
    bits: int


@contextlib.contextmanager
def store_key(private_key: str):
    if private_key is None:
        yield None
    else:
        with tempfile.NamedTemporaryFile() as temp_key:
            with open(temp_key.name, 'w', newline='\n') as key_file:
                key_file.write(private_key)
            yield temp_key.name


def get_key_metadata(private_key: str):
    with store_key(private_key) as key_path:
        proc = subprocess.run(['ssh-keygen', '-l', '-E', 'MD5', '-f', key_path],
                              capture_output=True)
        data = proc.stdout.decode().split()
        bits = int(data[0])
        fingerprint = data[1][4:]
        key_type = data[3][1:-1]
        public_key = subprocess.run(
            ['ssh-keygen', '-y', '-f', key_path],
            capture_output=True).stdout.decode()
        return SSHKeyMetadata(key_type, public_key, fingerprint, bits)


def generate_key():
    with tempfile.NamedTemporaryFile() as temp_key:
        subprocess.run(
            ['ssh-keygen', '-t', 'rsa', '-b', '8192', '-N', '', '-C', '', '-f', temp_key.name],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, input='y')
        with open(temp_key.name) as key_file:
            result = key_file.read()
        try:
            os.unlink(f'{temp_key.name}.pub')
        except FileNotFoundError:
            pass
        return result
