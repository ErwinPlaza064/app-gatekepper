<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
    <style>
        @media (max-width: 600px) {
            .sm-h-8 {
                height: 32px !important
            }
        }
    </style>
</head>

<body style="margin: 0; width: 100%; padding: 0; -webkit-font-smoothing: antialiased; word-break: break-word">
    <div role="article" aria-roledescription="email">
        <section
            style="margin-left: auto; margin-right: auto; max-width: 600px; background-color: #fff; padding: 32px 24px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #000">
            <header style="text-align: center; margin-bottom: 24px">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1f2937">
                    @if(isset($isConfirmation) && $isConfirmation)
                        ✅ Confirmación de Mensaje Enviado
                    @else
                        Nuevo Mensaje de Contacto
                    @endif
                </h1>
                <p style="margin-top: 8px; color: #6b7280">
                    @if(isset($isConfirmation) && $isConfirmation)
                        Hemos recibido tu mensaje correctamente
                    @else
                        Recibido desde el formulario web
                    @endif
                </p>
            </header>

            <main style="margin-top: 32px">
                @if(isset($isConfirmation) && $isConfirmation)
                <!-- Mensaje de Confirmación -->
                <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; text-align: center">
                    <p style="margin: 0; color: #fff; font-size: 16px; font-weight: 600">
                        ¡Gracias por contactarnos, {{ $data['fullname'] }}!
                    </p>
                    <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px">
                        Revisaremos tu mensaje y te responderemos pronto.
                    </p>
                </div>
                @endif

                <!-- Nombre -->
                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #000000; border-radius: 8px">
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase">👤 Nombre Completo</h3>
                    <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937">{{ $data['fullname'] }}</p>
                </div>

                <!-- Email -->
                @if(isset($data['email']) && $data['email'])
                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #8b5cf6; border-radius: 8px">
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase">📧 Correo Electrónico</h3>
                    <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937">
                        <a href="mailto:{{ $data['email'] }}" style="color: #3b82f6; text-decoration: none">{{ $data['email'] }}</a>
                    </p>
                </div>
                @endif

                <!-- Asunto -->
                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 8px">
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase">📋 Asunto</h3>
                    <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937">{{ $data['subject'] }}</p>
                </div>

                <!-- Mensaje -->
                <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #10b981; border-radius: 8px">
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase">💬 Mensaje</h3>
                    <p style="margin: 8px 0 0 0; line-height: 1.6; color: #374151; white-space: pre-wrap">{{ $data['message'] }}</p>
                </div>

                <!-- Ubicación -->
                @if(isset($data['location']) && $data['location'])
                <div style="margin-bottom: 24px; padding: 16px; background-color: #f0f9ff; border-left: 4px solid #f59e0b; border-radius: 8px">
                    <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase">📍 Ubicación</h3>
                    <p style="margin: 8px 0 4px 0; color: #374151"><strong>Dirección:</strong> {{ $data['location']['address'] }}</p>
                    <p style="margin: 4px 0; color: #6b7280; font-size: 14px">
                        <strong>Coordenadas:</strong> {{ number_format($data['location']['lat'], 6) }}, {{ number_format($data['location']['lng'], 6) }}
                    </p>

                    <!-- Google Maps Link -->
                    <a href="https://www.google.com/maps?q={{ $data['location']['lat'] }},{{ $data['location']['lng'] }}"
                       target="_blank"
                       style="display: inline-block; margin-top: 12px; padding: 8px 16px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px">
                        Ver en Google Maps 🗺️
                    </a>

                    <!-- Google Maps Static Image -->
                    <div style="margin-top: 16px; border-radius: 8px; overflow: hidden">
                        <img src="https://maps.googleapis.com/maps/api/staticmap?center={{ $data['location']['lat'] }},{{ $data['location']['lng'] }}&zoom=15&size=600x300&markers=color:red%7C{{ $data['location']['lat'] }},{{ $data['location']['lng'] }}&key={{ env('GOOGLE_MAPS_API_KEY') }}"
                             alt="Mapa de ubicación"
                             style="width: 100%; height: auto; display: block">
                    </div>
                </div>
                @endif

                <!-- Call to Action -->
                <div style="margin-top: 32px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center">
                    <p style="margin: 0; color: #fff; font-size: 14px; font-weight: 500">
                        @if(isset($isConfirmation) && $isConfirmation)
                            Recibirás una respuesta en las próximas 24-48 horas
                        @else
                            Responde este mensaje lo antes posible para brindar un excelente servicio al cliente
                        @endif
                    </p>
                </div>
            </main>
            <footer
                style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af">
                <p style="margin: 0">Todos los derechos reservados &copy; 2025 por GateKeeper</p>
                <p style="margin: 8px 0 0 0">Este correo fue generado automáticamente desde el formulario de contacto</p>
            </footer>
        </section>
    </div>
</body>

</html>
