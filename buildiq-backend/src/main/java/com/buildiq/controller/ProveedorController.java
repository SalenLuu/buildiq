package com.buildiq.controller;

import com.buildiq.model.Proveedor;
import com.buildiq.service.ProveedorService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controlador REST: recibe la petición HTTP, delega en el servicio y devuelve JSON. */
@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService servicio;

    public ProveedorController(ProveedorService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Proveedor> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Proveedor obtener(@PathVariable Integer id) {
        return servicio.buscar(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proveedor no encontrado."));
    }

    // TODO Fase 3: crear (validar con @Valid, reglas de unicidad, responder 201)
    @PostMapping
    public Proveedor crear(@Valid @RequestBody Proveedor proveedor) {
        throw Pendiente.fase3();
    }

    // TODO Fase 3: actualizar
    @PutMapping("/{id}")
    public Proveedor actualizar(@PathVariable Integer id, @Valid @RequestBody Proveedor proveedor) {
        throw Pendiente.fase3();
    }

    // TODO Fase 3: eliminar (responder 409 si hay registros que dependen de este)
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        throw Pendiente.fase3();
    }
}
