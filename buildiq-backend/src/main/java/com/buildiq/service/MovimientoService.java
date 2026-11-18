package com.buildiq.service;

import com.buildiq.model.Movimiento;
import com.buildiq.model.TipoMovimiento;
import com.buildiq.repository.MovimientoRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MovimientoService {

    private final MovimientoRepository repositorio;

    public MovimientoService(MovimientoRepository repositorio) {
        this.repositorio = repositorio;
    }

    /** Historial filtrable. "hasta" es inclusivo: se consulta hasta el inicio del día siguiente. */
    public List<Movimiento> consultar(
            Integer idObra, Integer idMaterial, TipoMovimiento tipo, LocalDate desde, LocalDate hasta) {
        return repositorio.filtrar(
                idObra,
                idMaterial,
                tipo,
                desde == null ? null : desde.atStartOfDay(),
                hasta == null ? null : hasta.plusDays(1).atStartOfDay());
    }

    // TODO Fase 3: registrar(MovimientoNuevo) — validar que la SALIDA no supere el stock,
    // actualizar stock_obra en la MISMA transacción y guardar el movimiento.
}
