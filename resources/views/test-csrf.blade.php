<!DOCTYPE html>
<html>
<head>
    <title>Test CSRF</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <h1>Test CSRF - GateKepper</h1>

    <div id="status"></div>

    <h2>1. Información de sesión:</h2>
    <pre id="session-info"></pre>

    <h2>2. Test formulario tradicional:</h2>
    <form method="POST" action="/test-post">
        @csrf
        <button type="submit">Enviar POST tradicional</button>
    </form>

    <h2>3. Test AJAX:</h2>
    <button id="ajax-test">Enviar POST vía AJAX</button>

    <script>
        // Configurar CSRF para AJAX
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        // Cargar información de sesión
        fetch('/debug-full')
            .then(response => response.json())
            .then(data => {
                document.getElementById('session-info').textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                document.getElementById('session-info').textContent = 'Error: ' + error;
            });

        // Test AJAX
        $('#ajax-test').click(function() {
            $.post('/test-post', {})
                .done(function(data) {
                    $('#status').html('<div style="color: green;">AJAX funcionó: ' + JSON.stringify(data) + '</div>');
                })
                .fail(function(xhr) {
                    $('#status').html('<div style="color: red;">AJAX falló: ' + xhr.status + ' ' + xhr.responseText + '</div>');
                });
        });
    </script>
</body>
</html>
