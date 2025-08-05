<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptimizeResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Añadir headers de cache para assets estáticos
        if ($this->isStaticAsset($request)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + 31536000));
        }

        // Comprimir respuesta si es posible
        if ($this->shouldCompress($request, $response)) {
            $content = $response->getContent();
            if ($content && function_exists('gzencode')) {
                $compressed = gzencode($content, 6);
                if ($compressed !== false) {
                    $response->setContent($compressed);
                    $response->headers->set('Content-Encoding', 'gzip');
                    $response->headers->set('Content-Length', strlen($compressed));
                }
            }
        }

        // Headers de seguridad y performance
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        return $response;
    }

    /**
     * Determinar si es un asset estático
     */
    private function isStaticAsset(Request $request): bool
    {
        $path = $request->getPathInfo();
        return preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i', $path);
    }

    /**
     * Determinar si debe comprimirse la respuesta
     */
    private function shouldCompress(Request $request, Response $response): bool
    {
        // No comprimir si ya está comprimido
        if ($response->headers->has('Content-Encoding')) {
            return false;
        }

        // Solo comprimir ciertos tipos de contenido
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'application/json',
            'text/xml',
            'application/xml'
        ];

        foreach ($compressibleTypes as $type) {
            if (strpos($contentType, $type) !== false) {
                return true;
            }
        }

        return false;
    }
}
