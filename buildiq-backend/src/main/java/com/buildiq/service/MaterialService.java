package com.buildiq.service;

import com.buildiq.model.Categoria;
import com.buildiq.model.Material;
import com.buildiq.repository.CategoriaRepository;
import com.buildiq.repository.MaterialRepository;
import com.buildiq.repository.MovimientoRepository;
import com.buildiq.repository.StockObraRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialRepository repositorio;
    private final CategoriaRepository categorias;
    private final StockObraRepository stock;
    private final MovimientoRepository movimientos;

    public MaterialService(MaterialRepository repositorio, CategoriaRepository categorias,
            StockObraRepository stock, MovimientoRepository movimientos) {
        this.repositorio = repositorio;
        this.categorias = categorias;
        this.stock = stock;
        this.movimientos = movimientos;
    }

    public List<Material> listar() {
        return repositorio.findAll();
    }

    public Optional<Material> buscar(Integer id) {
        return repositorio.findById(id);
    }

    @Transactional
    public Material crear(Material material) {
        material.setCodigo(material.getCodigo().trim());
        validarCodigoUnico(material.getCodigo(), null);
        material.setCategoria(buscarCategoria(material.getIdCategoria()));
        material.setIdMaterial(null);
        return repositorio.save(material);
    }

    @Transactional
    public Material actualizar(Integer id, Material datos) {
        Material actual = repositorio.findById(id).orElseThrow(this::noEncontrado);
        String codigo = datos.getCodigo().trim();
        validarCodigoUnico(codigo, id);
        actual.setCodigo(codigo);
        actual.setNombre(datos.getNombre());
        actual.setDescripcion(datos.getDescripcion());
        actual.setCategoria(buscarCategoria(datos.getIdCategoria()));
        actual.setUnidadMedida(datos.getUnidadMedida());
        actual.setStockMinimo(datos.getStockMinimo());
        actual.setPrecioUnitario(datos.getPrecioUnitario());
        actual.setActivo(datos.isActivo());
        return repositorio.save(actual);
    }

    @Transactional
    public void eliminar(Integer id) {
        Material actual = repositorio.findById(id).orElseThrow(this::noEncontrado);
        if (stock.existsByMaterialIdMaterial(id) || movimientos.existsByMaterialIdMaterial(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede borrar: el material tiene stock o movimientos.");
        }
        repositorio.delete(actual);
    }

    // No puede haber dos materiales con el mismo código.
    private void validarCodigoUnico(String codigo, Integer idActual) {
        repositorio.findByCodigoIgnoreCase(codigo)
                .filter(otro -> !otro.getIdMaterial().equals(idActual))
                .ifPresent(otro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un material con ese código.");
                });
    }

    private Categoria buscarCategoria(Integer idCategoria) {
        return categorias.findById(idCategoria)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "La categoría indicada no existe."));
    }

    private ResponseStatusException noEncontrado() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Material no encontrado.");
    }
}
