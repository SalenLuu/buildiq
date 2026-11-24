package com.buildiq.controller;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Convierte los errores en { "message": "..." }, que es lo que muestra el frontend.
@RestControllerAdvice
public class ManejoErrores {

    // Falló una validación de @Valid.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> datosInvalidos(MethodArgumentNotValidException e) {
        String detalle = e.getBindingResult().getFieldErrors().stream()
                .map(campo -> campo.getField() + ": " + campo.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Map.of("message", detalle);
    }

    // MySQL rechazó la operación (valor repetido o registro en uso).
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflicto(DataIntegrityViolationException e) {
        return Map.of("message", "La base de datos rechazó la operación: valor repetido o registro en uso.");
    }
}
