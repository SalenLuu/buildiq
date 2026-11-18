package com.buildiq.controller;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce errores comunes a { "message": "..." }, el formato que lee el frontend.
 * Aplica a todos los controladores.
 */
@RestControllerAdvice
public class ManejoErrores {

    // Falló una validación de @Valid (campo vacío, texto demasiado largo...).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> datosInvalidos(MethodArgumentNotValidException e) {
        String detalle = e.getBindingResult().getFieldErrors().stream()
                .map(campo -> campo.getField() + ": " + campo.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Map.of("message", detalle);
    }

    // Red de seguridad: si MySQL rechaza algo (único o llave foránea) que el servicio no detectó antes.
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflicto(DataIntegrityViolationException e) {
        return Map.of("message", "La base de datos rechazó la operación: valor repetido o registro en uso.");
    }
}
