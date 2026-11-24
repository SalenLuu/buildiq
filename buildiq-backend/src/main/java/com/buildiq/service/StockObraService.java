package com.buildiq.service;

import com.buildiq.model.StockObra;
import com.buildiq.repository.StockObraRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StockObraService {

    private final StockObraRepository repositorio;

    public StockObraService(StockObraRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<StockObra> consultar(Integer idObra, Integer idCategoria) {
        return repositorio.filtrar(idObra, idCategoria);
    }
}
