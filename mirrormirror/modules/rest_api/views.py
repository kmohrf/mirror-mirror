from django.shortcuts import redirect
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from mirrormirror.modules.core.models import Mirror, Repository, SSHKey, Synchronization
from mirrormirror.modules.core.synchronize import synchronize
from .serializers import (MirrorSerializer, RepositorySerializer, SSHKeySerializer,
                          SynchronizationSerializer)


class SaveOwner:
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class MirrorViewSet(SaveOwner, viewsets.ModelViewSet):
    serializer_class = MirrorSerializer
    permission_classes = {permissions.IsAuthenticated}

    def get_queryset(self):
        user = self.request.user
        return Mirror.objects.filter(owner=user).order_by('name')

    @action(methods=['POST'], detail=True, permission_classes=[])
    def sync(self, request, pk=None):
        # We don’t use self.get_object() here because that would try to
        # resolve the mirror with a user filter as per the default
        # queryset above. We’re fine with the uuid as "authentication".
        mirror = Mirror.objects.get(pk=pk)
        record = synchronize(mirror, request.query_params.get('reverse', '0') == '1')
        return Response(
            SynchronizationSerializer(context={'request': request}).to_representation(record))


class RepositoryViewSet(SaveOwner, viewsets.ModelViewSet):
    serializer_class = RepositorySerializer
    permission_classes = {permissions.IsAuthenticated}

    def get_queryset(self):
        user = self.request.user
        return Repository.objects.filter(owner=user).order_by('name')


class SSHKeyViewSet(SaveOwner, viewsets.ModelViewSet):
    serializer_class = SSHKeySerializer
    permission_classes = {permissions.IsAuthenticated}

    def get_queryset(self):
        user = self.request.user
        return SSHKey.objects.filter(owner=user).order_by('name')


class SynchronizationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SynchronizationSerializer
    permission_classes = {permissions.IsAuthenticated}

    def get_queryset(self):
        user = self.request.user
        return Synchronization.objects.filter(mirror__owner=user).order_by('-finished_at')
