package com.buildiq.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Respuesta común para los endpoints que se terminan en la Fase 3 (12 de noviembre). */
final class Pendiente {

    private Pendiente() {
    }

    static ResponseStatusException fase3() {
        return new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Pendiente: se implementa en la Fase 3.");
    }
}
