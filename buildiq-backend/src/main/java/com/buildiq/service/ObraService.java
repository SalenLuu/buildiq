package com.buildiq.service;

import com.buildiq.model.Obra;
import com.buildiq.repository.ObraRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ObraService {

    private final ObraRepository repositorio;

    public ObraService(ObraRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Obra> listar() {
        return repositorio.findAll();
    }

    public Optional<Obra> buscar(Integer id) {
        return repositorio.findById(id);
    }
}
