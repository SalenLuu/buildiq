package com.buildiq.service;

import com.buildiq.model.Categoria;
import com.buildiq.repository.CategoriaRepository;
import com.buildiq.repository.MaterialRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Capa de servicio: aquí viven las reglas de negocio de las categorías.
 * Por defecto las consultas son de solo lectura; los métodos que escriben lo anulan con @Transactional.
 */
@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository repositorio;
    private final MaterialRepository materiales;

    public CategoriaService(CategoriaRepository repositorio, MaterialRepository materiales) {
        this.repositorio = repositorio;
        this.materiales = materiales;
    }

    public List<Categoria> listar() {
        return repositorio.findAll();
    }

    public Optional<Categoria> buscar(Integer id) {
        return repositorio.findById(id);
    }

    @Transactional
    public Categoria crear(Categoria categoria) {
        categoria.setNombre(categoria.getNombre().trim());
        validarNombreUnico(categoria.getNombre(), null);
        categoria.setIdCategoria(null); // el id lo genera MySQL (AUTO_INCREMENT), nunca el cliente
        return repositorio.save(categoria);
    }

    @Transactional
    public Categoria actualizar(Integer id, Categoria datos) {
        Categoria actual = repositorio.findById(id).orElseThrow(() -> noEncontrada());
        String nombre = datos.getNombre().trim();
        validarNombreUnico(nombre, id);
        actual.setNombre(nombre);
        actual.setDescripcion(datos.getDescripcion());
        return repositorio.save(actual);
    }

    @Transactional
    public void eliminar(Integer id) {
        Categoria actual = repositorio.findById(id).orElseThrow(() -> noEncontrada());
        if (materiales.existsByCategoriaIdCategoria(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede borrar: hay materiales en esta categoría.");
        }
        repositorio.delete(actual);
    }

    // Dos categorías no pueden llamarse igual (sin importar mayúsculas), salvo que sea la misma que se edita.
    private void validarNombreUnico(String nombre, Integer idActual) {
        repositorio.findByNombreIgnoreCase(nombre)
                .filter(otra -> !otra.getIdCategoria().equals(idActual))
                .ifPresent(otra -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una categoría con ese nombre.");
                });
    }

    private ResponseStatusException noEncontrada() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada.");
    }
}
