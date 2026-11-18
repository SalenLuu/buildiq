package com.buildiq.service;

import com.buildiq.model.Proveedor;
import com.buildiq.repository.ProveedorRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository repositorio;

    public ProveedorService(ProveedorRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Proveedor> listar() {
        return repositorio.findAll();
    }

    public Optional<Proveedor> buscar(Integer id) {
        return repositorio.findById(id);
    }
}
