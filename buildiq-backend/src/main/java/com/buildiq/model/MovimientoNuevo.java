package com.buildiq.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

// Datos que manda el frontend para registrar un movimiento.
public record MovimientoNuevo(
        @NotNull Integer idObra,
        @NotNull Integer idMaterial,
        Integer idProveedor,
        @NotNull TipoMovimiento tipo,
        @NotNull @Positive BigDecimal cantidad,
        @NotBlank @Size(max = 80) String responsable,
        @Size(max = 250) String observacion) {
}
