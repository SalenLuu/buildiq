package com.buildiq.controller;

import com.buildiq.model.StockObra;
import com.buildiq.service.StockObraService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Solo lectura: el stock cambia únicamente al registrar movimientos.
@RestController
@RequestMapping("/api/stock")
public class StockObraController {

    private final StockObraService servicio;

    public StockObraController(StockObraService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<StockObra> consultar(
            @RequestParam(required = false) Integer idObra,
            @RequestParam(required = false) Integer idCategoria) {
        return servicio.consultar(idObra, idCategoria);
    }
}
