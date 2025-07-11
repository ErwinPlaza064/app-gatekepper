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

**Conclusión:**
El proyecto cumple con la consigna de implementar al menos dos patrones de diseño: MVC y Observer.
