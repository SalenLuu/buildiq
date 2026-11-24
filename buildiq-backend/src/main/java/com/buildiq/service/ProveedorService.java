package com.buildiq.service;

import com.buildiq.model.Proveedor;
import com.buildiq.repository.MovimientoRepository;
import com.buildiq.repository.ProveedorRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository repositorio;
    private final MovimientoRepository movimientos;

    public ProveedorService(ProveedorRepository repositorio, MovimientoRepository movimientos) {
        this.repositorio = repositorio;
        this.movimientos = movimientos;
    }

    public List<Proveedor> listar() {
        return repositorio.findAll();
    }

    public Optional<Proveedor> buscar(Integer id) {
        return repositorio.findById(id);
    }

    @Transactional
    public Proveedor crear(Proveedor proveedor) {
        proveedor.setNit(proveedor.getNit().trim());
        validarNitUnico(proveedor.getNit(), null);
        proveedor.setIdProveedor(null);
        return repositorio.save(proveedor);
    }

    @Transactional
    public Proveedor actualizar(Integer id, Proveedor datos) {
        Proveedor actual = repositorio.findById(id).orElseThrow(this::noEncontrado);
        String nit = datos.getNit().trim();
        validarNitUnico(nit, id);
        actual.setNombre(datos.getNombre());
        actual.setNit(nit);
        actual.setTelefono(datos.getTelefono());
        actual.setCorreo(datos.getCorreo());
        actual.setDireccion(datos.getDireccion());
        actual.setActivo(datos.isActivo());
        return repositorio.save(actual);
    }

    @Transactional
    public void eliminar(Integer id) {
        Proveedor actual = repositorio.findById(id).orElseThrow(this::noEncontrado);
        if (movimientos.existsByProveedorIdProveedor(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede borrar: el proveedor tiene movimientos registrados.");
        }
        repositorio.delete(actual);
    }

    // No puede haber dos proveedores con el mismo NIT.
    private void validarNitUnico(String nit, Integer idActual) {
        repositorio.findByNit(nit)
                .filter(otro -> !otro.getIdProveedor().equals(idActual))
                .ifPresent(otro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un proveedor con ese NIT.");
                });
    }

    private ResponseStatusException noEncontrado() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Proveedor no encontrado.");
    }
}
