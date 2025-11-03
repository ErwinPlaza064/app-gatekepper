# 📱 Endpoints API para Aplicación Móvil

## ✅ Endpoints Creados

### 🔐 Autenticación

#### `POST /api/mobile/login`
Login para aplicación móvil que devuelve un token Sanctum.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "phone": "4641226304",
    "address": "Calle 123",
    "rol": "residente",
    "whatsapp_notifications": true,
    "email_notifications": true
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

---

#### `POST /api/mobile/register`
Registro de nuevo usuario desde la app móvil.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "4641226304",
  "address": "Calle 123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "phone": "4641226304",
    "address": "Calle 123",
    "rol": "residente",
    "whatsapp_notifications": false,
    "email_notifications": false
  }
}
```

---

#### `POST /api/mobile/logout`
Cerrar sesión y revocar el token actual.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

#### `GET /api/user`
Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "phone": "4641226304",
    "address": "Calle 123",
    "rol": "residente",
    "whatsapp_notifications": true,
    "email_notifications": true
  }
}
```

---

### 📱 Notificaciones Push

#### `POST /api/push/subscribe`
Registrar token de Expo Push Notifications.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "endpoint": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token de notificaciones push registrado exitosamente"
}
```

---

### 👥 Visitantes

#### `GET /api/user/visitors`
Obtener lista de visitantes del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (opcional): Buscar por nombre o documento
- `dateFrom` (opcional): Fecha desde (YYYY-MM-DD)
- `dateTo` (opcional): Fecha hasta (YYYY-MM-DD)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "María García",
    "id_document": "12345678",
    "vehicle_plate": "ABC-123",
    "entry_time": "2024-11-03T10:00:00.000000Z",
    "approval_status": "approved",
    "qr_code_id": 1,
    "qr_code": {
      "id": 1,
      "qr_id": "QR-ABC123",
      "qr_type": "single_use"
    }
  }
]
```

---

### 📱 Códigos QR

#### `GET /api/user/qr-codes`
Obtener códigos QR del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "qr_id": "QR-ABC123",
    "visitor_name": "María García",
    "document_id": "12345678",
    "vehicle_plate": "ABC-123",
    "qr_type": "single_use",
    "valid_until": "2024-11-10T23:59:59.000000Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "status": "active"
  }
]
```

---

#### `POST /api/qr-codes`
Crear un nuevo código QR.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "visitor_name": "María García",
  "document_id": "12345678",
  "vehicle_plate": "ABC-123",
  "qr_type": "single_use",
  "valid_until": "2024-11-10T23:59:59",
  "max_uses": 1
}
```

**Response (201):**
```json
{
  "message": "QR creado correctamente",
  "qr_code": {
    "id": 1,
    "qr_id": "QR-ABC123",
    "visitor_name": "María García",
    "document_id": "12345678",
    "vehicle_plate": "ABC-123",
    "qr_type": "single_use",
    "valid_until": "2024-11-10T23:59:59.000000Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true
  }
}
```

---

### ✅ Aprobaciones

#### `GET /api/approval/pending`
Obtener visitantes pendientes de aprobación.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "visitors": [
    {
      "id": 1,
      "name": "María García",
      "id_document": "12345678",
      "vehicle_plate": "ABC-123",
      "resident": "Juan Pérez",
      "apartment": "Calle 123",
      "requested_at": "2024-11-03T10:00:00.000000Z",
      "timeout_minutes": 7,
      "expires_at": "2024-11-03T10:07:00.000000Z",
      "minutes_remaining": 5,
      "is_expired": false
    }
  ]
}
```

---

#### `POST /api/approval/approve`
Aprobar un visitante pendiente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "visitor_id": 1,
  "notes": "Aprobado desde la app móvil"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Visitante María García aprobado correctamente",
  "visitor": {
    "id": 1,
    "name": "María García",
    "approval_status": "approved",
    "approval_responded_at": "2024-11-03T10:05:00.000000Z"
  }
}
```

---

#### `POST /api/approval/reject`
Rechazar un visitante pendiente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "visitor_id": 1,
  "reason": "No esperado"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Visitante María García rechazado",
  "visitor": {
    "id": 1,
    "name": "María García",
    "approval_status": "rejected",
    "approval_responded_at": "2024-11-03T10:05:00.000000Z"
  }
}
```

---

### 📝 Quejas

#### `GET /api/complaints`
Obtener quejas del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "message": "Problema con el sistema",
    "created_at": "2024-11-03T10:00:00.000000Z"
  }
]
```

---

#### `POST /api/complaints`
Crear una nueva queja.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "message": "Problema con el sistema de notificaciones"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Queja enviada correctamente",
  "complaint": {
    "id": 1,
    "message": "Problema con el sistema de notificaciones",
    "created_at": "2024-11-03T10:00:00.000000Z"
  }
}
```

---

## 🔒 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer {token}
```

El token se obtiene al hacer login exitosamente y debe incluirse en todas las requests subsiguientes.

## 📊 Códigos de Estado

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Solicitud inválida
- `401` - No autenticado
- `403` - No autorizado
- `404` - No encontrado
- `422` - Error de validación
- `500` - Error del servidor

## 🚀 Próximos Pasos

1. Ejecutar la migración para agregar el campo `expo_push_token`:
```bash
php artisan migrate
```

2. Probar los endpoints con Postman o similar

3. Verificar que las notificaciones push funcionen correctamente

