package com.buildiq.service;

import com.buildiq.model.Material;
import com.buildiq.model.Movimiento;
import com.buildiq.model.MovimientoNuevo;
import com.buildiq.model.Obra;
import com.buildiq.model.Proveedor;
import com.buildiq.model.StockObra;
import com.buildiq.model.StockObraId;
import com.buildiq.model.TipoMovimiento;
import com.buildiq.repository.MaterialRepository;
import com.buildiq.repository.MovimientoRepository;
import com.buildiq.repository.ObraRepository;
import com.buildiq.repository.ProveedorRepository;
import com.buildiq.repository.StockObraRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class MovimientoService {

    private final MovimientoRepository repositorio;
    private final StockObraRepository stock;
    private final ObraRepository obras;
    private final MaterialRepository materiales;
    private final ProveedorRepository proveedores;

    public MovimientoService(MovimientoRepository repositorio, StockObraRepository stock, ObraRepository obras,
            MaterialRepository materiales, ProveedorRepository proveedores) {
        this.repositorio = repositorio;
        this.stock = stock;
        this.obras = obras;
        this.materiales = materiales;
        this.proveedores = proveedores;
    }

    // "hasta" incluye todo ese día, por eso se consulta hasta el inicio del día siguiente.
    public List<Movimiento> consultar(
            Integer idObra, Integer idMaterial, TipoMovimiento tipo, LocalDate desde, LocalDate hasta) {
        return repositorio.filtrar(
                idObra,
                idMaterial,
                tipo,
                desde == null ? null : desde.atStartOfDay(),
                hasta == null ? null : hasta.plusDays(1).atStartOfDay());
    }

    // Guarda el movimiento y actualiza el stock. Si algo falla, no se guarda ninguno de los dos.
    @Transactional
    public Movimiento registrar(MovimientoNuevo nuevo) {
        Obra obra = obras.findById(nuevo.idObra())
                .orElseThrow(() -> error("La obra indicada no existe."));
        Material material = materiales.findById(nuevo.idMaterial())
                .orElseThrow(() -> error("El material indicado no existe."));

        // El proveedor solo aplica a las entradas.
        Proveedor proveedor = null;
        if (nuevo.tipo() == TipoMovimiento.ENTRADA && nuevo.idProveedor() != null) {
            proveedor = proveedores.findById(nuevo.idProveedor())
                    .orElseThrow(() -> error("El proveedor indicado no existe."));
        }

        StockObraId idStock = new StockObraId(obra.getIdObra(), material.getIdMaterial());
        StockObra fila = stock.findById(idStock).orElseGet(() -> {
            StockObra nueva = new StockObra();
            nueva.setId(idStock);
            nueva.setObra(obra);
            nueva.setMaterial(material);
            return nueva;
        });

        BigDecimal cantidad = nuevo.cantidad();
        switch (nuevo.tipo()) {
            case ENTRADA -> fila.setCantidad(fila.getCantidad().add(cantidad));
            case SALIDA -> {
                if (cantidad.compareTo(fila.getCantidad()) > 0) {
                    throw error("Stock insuficiente: disponible " + texto(fila.getCantidad())
                            + ", solicitado " + texto(cantidad) + ".");
                }
                fila.setCantidad(fila.getCantidad().subtract(cantidad));
            }
            case AJUSTE -> fila.setCantidad(cantidad); // el ajuste deja el conteo físico
        }
        stock.save(fila);

        Movimiento movimiento = new Movimiento();
        movimiento.setObra(obra);
        movimiento.setMaterial(material);
        movimiento.setProveedor(proveedor);
        movimiento.setTipo(nuevo.tipo());
        movimiento.setCantidad(cantidad);
        movimiento.setFecha(LocalDateTime.now());
        movimiento.setResponsable(nuevo.responsable().trim());
        movimiento.setObservacion(nuevo.observacion() == null || nuevo.observacion().isBlank()
                ? null
                : nuevo.observacion().trim());
        return repositorio.save(movimiento);
    }

    private ResponseStatusException error(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }

    // 40.00 -> "40"
    private String texto(BigDecimal numero) {
        return numero.stripTrailingZeros().toPlainString();
    }
}
