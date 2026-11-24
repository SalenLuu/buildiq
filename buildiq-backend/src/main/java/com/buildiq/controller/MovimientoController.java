package com.buildiq.controller;

import com.buildiq.model.Movimiento;
import com.buildiq.model.MovimientoNuevo;
import com.buildiq.model.TipoMovimiento;
import com.buildiq.service.MovimientoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService servicio;

    public MovimientoController(MovimientoService servicio) {
        this.servicio = servicio;
    }

    // Todos los filtros son opcionales. Ejemplo: /api/movimientos?idObra=1&tipo=SALIDA
    @GetMapping
    public List<Movimiento> consultar(
            @RequestParam(required = false) Integer idObra,
            @RequestParam(required = false) Integer idMaterial,
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return servicio.consultar(idObra, idMaterial, tipo, desde, hasta);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Movimiento registrar(@Valid @RequestBody MovimientoNuevo nuevo) {
        return servicio.registrar(nuevo);
    }
}
