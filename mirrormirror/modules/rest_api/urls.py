from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'mirrors', views.MirrorViewSet, basename='mirror')
router.register(r'repositories', views.RepositoryViewSet, basename='repository')
router.register(r'ssh-keys', views.SSHKeyViewSet, basename='sshkey')
router.register(r'synchronizations', views.SynchronizationViewSet, basename='synchronization')

urlpatterns = [
    path('', include(router.urls))
]
