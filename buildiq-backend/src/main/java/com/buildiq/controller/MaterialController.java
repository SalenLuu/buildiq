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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Material crear(@Valid @RequestBody Material material) {
        return servicio.crear(material);
    }

    @PutMapping("/{id}")
    public Material actualizar(@PathVariable Integer id, @Valid @RequestBody Material material) {
        return servicio.actualizar(id, material);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
