<?php

namespace App\Exceptions;

use Exception;

class EmailAlreadySentException extends Exception
{
    public function __construct($message = "Email already sent by custom service", $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }

    /**
     * Render the exception (don't show this to users)
     */
    public function render()
    {
        // No mostrar error al usuario, es una excepción de control
        return null;
    }

    /**
     * Report the exception (don't log this as error)
     */
    public function report()
    {
        // No reportar como error, es comportamiento esperado
        return false;
    }
}
