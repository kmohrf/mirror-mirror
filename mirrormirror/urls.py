from django.contrib import admin
from django.urls import path, include

from mirrormirror.modules.rest_api import urls as api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api.router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
