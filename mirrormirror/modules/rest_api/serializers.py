from rest_framework import serializers

from mirrormirror.modules.core.models import (GitURLField, Mirror, Repository, SSHKey,
                                              Synchronization)


class TimestampedSerializer:
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class MirrorSerializer(serializers.HyperlinkedModelSerializer, TimestampedSerializer):
    class Meta:
        model = Mirror
        fields = (
            'created_at',
            'updated_at',
            'id',
            'name',
            'source_repository',
            'target_repository',
        )


class RepositorySerializer(serializers.HyperlinkedModelSerializer, TimestampedSerializer):
    class Meta:
        model = Repository
        fields = (
            'created_at',
            'updated_at',
            'id',
            'name',
            'url',
            'access_key',
        )


class SSHKeySerializer(serializers.HyperlinkedModelSerializer, TimestampedSerializer):
    type = serializers.CharField(read_only=True)
    public_key = serializers.CharField(read_only=True)
    fingerprint = serializers.CharField(read_only=True)
    bits = serializers.IntegerField(read_only=True)

    class Meta:
        model = SSHKey
        fields = (
            'created_at',
            'updated_at',
            'id',
            'name',
            'type',
            'private_key',
            'public_key',
            'fingerprint',
            'bits',
        )


class SynchronizationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Synchronization
        fields = (
            'id',
            'started_at',
            'finished_at',
            'mirror',
            'reverse',
            'was_successful',
            'log',
        )
