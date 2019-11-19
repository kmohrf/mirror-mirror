import os
import uuid

from django.conf import settings
from django.contrib.auth.models import User
from django.core import validators
from django.db import models

from .ssh_key import get_key_metadata, generate_key


class GitURLField(models.CharField):
    default_validators = [validators.URLValidator(schemes=('http', 'https', 'git', 'ssh'))]


class Timestamped(models.Model):
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class SSHKey(Timestamped):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=30)
    private_key = models.TextField()
    public_key = models.TextField()
    fingerprint = models.CharField(max_length=255)
    bits = models.IntegerField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def _update_key_data(self):
        self.private_key = self.private_key.strip().replace('\r', '') + '\n'
        metadata = get_key_metadata(self.private_key)
        self.type = metadata.type
        self.public_key = metadata.public_key
        self.fingerprint = metadata.fingerprint
        self.bits = metadata.bits

    def save(self, *args, **kwargs):
        self._update_key_data()
        super().save(*args, **kwargs)

    @classmethod
    def generate_new(cls):
        private_key = generate_key()
        new_key = cls(private_key=private_key)
        new_key.save()
        return new_key

    def __str__(self):
        return f'{self.name} ({self.type}-{self.bits})'


class Repository(Timestamped):
    name = models.CharField(max_length=255)
    url = GitURLField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    access_key: SSHKey = models.ForeignKey(
        SSHKey, null=True, on_delete=models.SET_NULL, related_name='+')

    def __str__(self):
        return f'{self.name} ({self.url})'

    @property
    def directory(self):
        return os.path.join(settings.REPOSITORY_DIR, f'repo_{self.id}')


class Mirror(Timestamped):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    source_repository: Repository = models.ForeignKey(
        Repository, null=True, on_delete=models.SET_NULL, related_name='+')
    target_repository: Repository = models.ForeignKey(
        Repository, null=True, on_delete=models.SET_NULL, related_name='+')


class Synchronization(models.Model):
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField()
    mirror: Mirror = models.ForeignKey(Mirror, on_delete=models.CASCADE, related_name='+')
    reverse = models.BooleanField()
    was_successful = models.BooleanField()
    log = models.TextField(null=True)
