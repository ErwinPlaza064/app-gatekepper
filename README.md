# Patrones de Diseño implementados en el proyecto

## 1. Patrón MVC (Modelo-Vista-Controlador)

**Descripción:**
El proyecto utiliza el patrón MVC, separando la lógica de negocio, la presentación y el control de flujo.

-   **Modelos:**
    -   `app/Models/User.php`
    -   `app/Models/Visitor.php`
    -   `app/Models/Complaint.php`
-   **Controladores:**
    -   `app/Http/Controllers/VisitorController.php`
    -   `app/Http/Controllers/DashboardController.php`
    -   `app/Http/Controllers/ProfileController.php`
-   **Vistas:**
    -   Archivos Blade en `resources/views/`
    -   Componentes React en `resources/js/Pages/` y `resources/js/Components/`

**Ejemplo:**

-   Cuando se registra un visitante, el controlador `VisitorController` procesa la petición, el modelo `Visitor` gestiona los datos y la vista muestra la información al usuario.

---

## 2. Patrón Observer (Observador)

**Descripción:**
El patrón Observer se utiliza para notificar automáticamente a los usuarios cuando ocurre un evento relevante, como el registro de un visitante.

-   **Implementación:**
    -   En `app/Models/Visitor.php`, el método `booted` escucha el evento `created` y notifica al usuario relacionado:
        ```php
        protected static function booted()
        {
            static::created(function ($visitor) {
                if ($visitor->user) {
                    $visitor->user->notify(new NewVisitorNotification($visitor));
                }
            });
        }
        ```
    -   Las notificaciones se definen en `app/Notifications/NewVisitorNotification.php`.

**Ejemplo:**

-   Cuando se crea un nuevo visitante, el residente recibe automáticamente una notificación, siguiendo el patrón Observer.

---

## Endpoints principales de la API

A continuación se documentan los endpoints clave del proyecto, útiles para la integración y pruebas.

| Método | Endpoint           | Descripción                                    | Parámetros principales                                | Respuesta esperada                                |
| ------ | ------------------ | ---------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| POST   | /api/scan-qr       | Registrar visitante por QR                     | visitor_name, document_id, resident_id, vehicle_plate | JSON con mensaje y datos del visitante registrado |
| GET    | /api/notifications | Obtener notificaciones del usuario autenticado | (token de autenticación)                              | JSON con lista de notificaciones                  |
| POST   | /login             | Iniciar sesión                                 | email, password                                       | Redirección o JSON con datos de usuario/token     |
| POST   | /register          | Registrar usuario                              | name, email, password, password_confirmation          | Redirección o JSON con datos de usuario           |
| POST   | /send-email        | Enviar mensaje de contacto                     | email, fullname, message                              | Redirección con mensaje de éxito                  |
| POST   | /complaints        | Registrar queja                                | message (requiere autenticación)                      | Redirección con mensaje de éxito                  |

### Ejemplo de uso: Registrar visitante por QR

**POST /api/scan-qr**

```json
{
    "visitor_name": "Juan Pérez",
    "document_id": "ABC123456",
    "resident_id": 5,
    "vehicle_plate": "XYZ-987"
}
```

**Respuesta exitosa:**

```json
{
    "message": "Visitante registrado con éxito",
    "visitor": {
        "id": 10,
        "name": "Juan Pérez",
        "id_document": "ABC123456",
        "user_id": 5,
        "vehicle_plate": "XYZ-987",
        "entry_time": "2025-07-10T12:34:56.000000Z"
    }
}
```
