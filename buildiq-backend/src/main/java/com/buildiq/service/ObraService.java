package com.buildiq.service;

import com.buildiq.model.Obra;
import com.buildiq.repository.MovimientoRepository;
import com.buildiq.repository.ObraRepository;
import com.buildiq.repository.StockObraRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ObraService {

    private final ObraRepository repositorio;
    private final StockObraRepository stock;
    private final MovimientoRepository movimientos;

    public ObraService(ObraRepository repositorio, StockObraRepository stock, MovimientoRepository movimientos) {
        this.repositorio = repositorio;
        this.stock = stock;
        this.movimientos = movimientos;
    }

    public List<Obra> listar() {
        return repositorio.findAll();
    }

    public Optional<Obra> buscar(Integer id) {
        return repositorio.findById(id);
    }

    @Transactional
    public Obra crear(Obra obra) {
        validarFechas(obra);
        obra.setIdObra(null);
        return repositorio.save(obra);
    }

    @Transactional
    public Obra actualizar(Integer id, Obra datos) {
        Obra actual = repositorio.findById(id).orElseThrow(this::noEncontrada);
        validarFechas(datos);
        actual.setNombre(datos.getNombre());
        actual.setDireccion(datos.getDireccion());
        actual.setFechaInicio(datos.getFechaInicio());
        actual.setFechaFin(datos.getFechaFin());
        actual.setEstado(datos.getEstado());
        return repositorio.save(actual);
    }

    @Transactional
    public void eliminar(Integer id) {
        Obra actual = repositorio.findById(id).orElseThrow(this::noEncontrada);
        if (stock.existsByObraIdObra(id) || movimientos.existsByObraIdObra(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede borrar: la obra tiene stock o movimientos.");
        }
        repositorio.delete(actual);
    }

    private void validarFechas(Obra obra) {
        if (obra.getFechaFin() != null && obra.getFechaFin().isBefore(obra.getFechaInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de fin no puede ser anterior a la de inicio.");
        }
    }

    private ResponseStatusException noEncontrada() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada.");
    }
}
