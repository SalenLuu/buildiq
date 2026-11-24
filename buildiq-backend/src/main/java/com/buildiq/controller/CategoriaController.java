package com.buildiq.controller;

import com.buildiq.model.Categoria;
import com.buildiq.service.CategoriaService;
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
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService servicio;

    public CategoriaController(CategoriaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Categoria> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Categoria obtener(@PathVariable Integer id) {
        return servicio.buscar(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada."));
    }

    // @Valid revisa las validaciones de la clase (@NotBlank, @Size...) antes de entrar.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria crear(@Valid @RequestBody Categoria categoria) {
        return servicio.crear(categoria);
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Integer id, @Valid @RequestBody Categoria categoria) {
        return servicio.actualizar(id, categoria);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
