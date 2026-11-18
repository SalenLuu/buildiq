package com.buildiq.service;

import com.buildiq.model.Material;
import com.buildiq.repository.MaterialRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialRepository repositorio;

    public MaterialService(MaterialRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Material> listar() {
        return repositorio.findAll();
    }

    public Optional<Material> buscar(Integer id) {
        return repositorio.findById(id);
    }
}
