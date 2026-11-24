package com.buildiq.controller;

import com.buildiq.model.Obra;
import com.buildiq.service.ObraService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/obras")
public class ObraController {

    private final ObraService servicio;

    public ObraController(ObraService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Obra> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Obra obtener(@PathVariable Integer id) {
        return servicio.buscar(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada."));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Obra crear(@Valid @RequestBody Obra obra) {
        return servicio.crear(obra);
    }

    @PutMapping("/{id}")
    public Obra actualizar(@PathVariable Integer id, @Valid @RequestBody Obra obra) {
        return servicio.actualizar(id, obra);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
