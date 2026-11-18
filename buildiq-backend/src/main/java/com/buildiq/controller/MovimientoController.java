package com.buildiq.controller;

import com.buildiq.model.Movimiento;
import com.buildiq.model.TipoMovimiento;
import com.buildiq.service.MovimientoService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService servicio;

    public MovimientoController(MovimientoService servicio) {
        this.servicio = servicio;
    }

    /** Historial con filtros opcionales: ?idObra=&idMaterial=&tipo=&desde=YYYY-MM-DD&hasta=YYYY-MM-DD */
    @GetMapping
    public List<Movimiento> consultar(
            @RequestParam(required = false) Integer idObra,
            @RequestParam(required = false) Integer idMaterial,
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return servicio.consultar(idObra, idMaterial, tipo, desde, hasta);
    }

    // TODO Fase 3: registrar entrada/salida/ajuste. Cuerpo esperado (ver MovimientoNuevo en el frontend):
    // { idObra, idMaterial, idProveedor, tipo, cantidad, responsable, observacion }
    @PostMapping
    public Movimiento registrar(@RequestBody Movimiento movimiento) {
        throw Pendiente.fase3();
    }
}
