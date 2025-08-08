# Sistema de Aprobación de Visitantes - Documentación

## 🎯 Resumen

Se ha implementado un sistema completo de aprobación de visitantes espontáneos que permite a los residentes aprobar o rechazar el acceso de visitantes a través de enlaces de WhatsApp, con un tiempo límite de 7 minutos y aprobación automática en caso de no respuesta.

## 📋 Funcionalidades Implementadas

### 1. **Sistema de Aprobación por Token**
- ✅ Generación de tokens seguros de 64 caracteres
- ✅ Enlaces públicos sin autenticación
- ✅ Validación y expiración automática (7 minutos)
- ✅ Prevención de doble procesamiento

### 2. **Base de Datos**
- ✅ Migración añadida: `approval_token` en tabla `visitors`
- ✅ Índice para optimización de búsquedas por token
- ✅ Campos de auditoría para aprobaciones

### 3. **Modelo Visitor Extendido**
- ✅ `requestApproval()` - Genera token y inicia proceso
- ✅ `approve()` - Aprueba visitante con auditoría
- ✅ `reject()` - Rechaza visitante con motivo
- ✅ `autoApprove()` - Aprobación automática por timeout
- ✅ `findByApprovalToken()` - Búsqueda segura por token
- ✅ Scopes para filtrar visitantes pendientes
- ✅ Validaciones de estado y expiración

### 4. **Controlador de Aprobación**
- ✅ `requestApproval()` - API para solicitar aprobación
- ✅ `approvePublic()` - Enlace público de aprobación
- ✅ `rejectPublic()` - Enlace público de rechazo
- ✅ `pendingVisitors()` - Monitoreo de visitantes pendientes
- ✅ `processExpiredApprovals()` - Procesamiento automático de expirados
- ✅ Integración completa con WhatsApp

### 5. **Rutas Configuradas**
- ✅ API routes con autenticación (`/api/approval/*`)
- ✅ Web routes públicas (`/approval/{token}/approve` y `/approval/{token}/reject`)
- ✅ Nombres de ruta para generación de URLs

### 6. **Integración WhatsApp**
- ✅ `EnviarWhatsAppJob` extendido con nuevos tipos de mensaje
- ✅ `WhatsAppService` con métodos específicos para aprobación
- ✅ Mensajes formateados con enlaces de acción
- ✅ Confirmaciones automáticas de respuesta

### 7. **Interfaz de Usuario (Inertia/React)**
- ✅ `Approval/Success.jsx` - Página de aprobación exitosa
- ✅ `Approval/Rejected.jsx` - Página de rechazo
- ✅ `Approval/Error.jsx` - Página de errores
- ✅ `Approval/AlreadyProcessed.jsx` - Visitante ya procesado
- ✅ Diseño responsive y amigable

## 🔄 Flujo de Trabajo

### Escenario 1: Visitante Espontáneo
1. **Portero registra visitante** sin QR en Filament
2. **Sistema genera token** y envía solicitud al residente
3. **Residente recibe WhatsApp** con enlaces de Aprobar/Rechazar
4. **Residente hace clic** en enlace de su elección
5. **Sistema procesa respuesta** y notifica resultado
6. **Confirmación enviada** por WhatsApp

### Escenario 2: Timeout Automático
1. **Visitante registrado** y solicitud enviada
2. **7 minutos sin respuesta** del residente
3. **Sistema auto-aprueba** el acceso
4. **Notificación enviada** sobre aprobación automática

## 🛡️ Seguridad

- **Tokens únicos** de 64 caracteres por visitante
- **Expiración automática** después de 7 minutos
- **Validación de estado** para prevenir procesamiento múltiple
- **Enlaces de un solo uso** (se invalidan al procesar)
- **Sin autenticación requerida** en enlaces públicos (por diseño)
- **Auditoría completa** de todas las acciones

## 📱 Integración WhatsApp

### Tipos de Mensaje Soportados:
- `solicitud_aprobacion` - Solicitud inicial con enlaces
- `respuesta_aprobacion` - Confirmación de acción tomada

### Formato de Mensaje de Solicitud:
```
🔔 *Solicitud de Visita* 🔔

👤 Visitante: Juan Pérez
🆔 Documento: 12345678
🕐 Solicita acceso a las: 14:30 08/01/2025
🚗 Vehículo: ABC123

⏰ *Tienes 7 minutos para responder*
Si no respondes, el acceso será automáticamente aprobado.

👆 *Opciones de respuesta:*
✅ APROBAR: https://app.com/approval/abc123.../approve
❌ RECHAZAR: https://app.com/approval/abc123.../reject

🏘️ Sistema: Gatekeeper
```

## 📊 Endpoints API

### Autenticados (API)
- `POST /api/approval/request` - Solicitar aprobación
- `GET /api/approval/pending` - Visitantes pendientes
- `POST /api/approval/process-expired` - Procesar expirados

### Públicos (Web)
- `GET /approval/{token}/approve` - Aprobar visitante
- `GET /approval/{token}/reject` - Rechazar visitante

## 🔧 Configuración Requerida

### Variables de Entorno WhatsApp (ya configuradas):
```env
MAYTAPI_API_KEY=tu_api_key
MAYTAPI_PRODUCT_ID=tu_product_id
MAYTAPI_PHONE_ID=tu_phone_id
```

### Cron Job para Auto-aprobación:
```bash
# Procesar visitantes expirados cada minuto
* * * * * cd /var/www/html/app-gatekepper && php artisan schedule:run >> /dev/null 2>&1
```

## 🧪 Testing

Se incluye script de prueba: `tests/approval_system_test.php`

Ejecutar con:
```bash
php artisan tinker < tests/approval_system_test.php
```

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Estructura de base de datos
- [x] Modelos y relaciones
- [x] Controladores y rutas
- [x] Integración WhatsApp
- [x] Interfaces de usuario
- [x] Sistema de seguridad
- [x] Documentación

### 🔄 Próximos Pasos (Opcionales)
- [ ] Dashboard de monitoreo en tiempo real
- [ ] Estadísticas de aprobaciones
- [ ] Notificaciones push adicionales
- [ ] Configuración de timeouts personalizables
- [ ] Integración con otros proveedores de WhatsApp

## 🎉 Resultado

El sistema está **100% funcional** y listo para uso en producción. Los residentes pueden aprobar/rechazar visitantes directamente desde WhatsApp con un sistema seguro, rápido y fácil de usar.

---

*Documentación generada el: 8 de enero de 2025*  
*Sistema: Gatekeeper - Gestión de Visitantes*
