package com.buildiq.controller;

import com.buildiq.model.Material;
import com.buildiq.service.MaterialService;
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
@RequestMapping("/api/materiales")
public class MaterialController {

    private final MaterialService servicio;

    public MaterialController(MaterialService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Material> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Material obtener(@PathVariable Integer id) {
        return servicio.buscar(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material no encontrado."));
    }

    // TODO Fase 3: crear (validar con @Valid, reglas de unicidad, responder 201)
    @PostMapping
    public Material crear(@Valid @RequestBody Material material) {
        throw Pendiente.fase3();
    }

    // TODO Fase 3: actualizar
    @PutMapping("/{id}")
    public Material actualizar(@PathVariable Integer id, @Valid @RequestBody Material material) {
        throw Pendiente.fase3();
    }

    // TODO Fase 3: eliminar (responder 409 si hay registros que dependen de este)
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        throw Pendiente.fase3();
    }
}
