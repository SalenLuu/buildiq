package com.buildiq.repository;

import com.buildiq.model.Movimiento;
import com.buildiq.model.TipoMovimiento;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovimientoRepository extends JpaRepository<Movimiento, Integer> {

    /**
     * Historial con filtros opcionales (null = no filtrar). El rango de fechas es
     * [desde, hastaExclusivo): así "hasta" incluye el día completo.
     * Orden: más recientes primero.
     */
    @EntityGraph(attributePaths = {"obra", "material", "proveedor"})
    @Query("""
            select m from Movimiento m
            where (:idObra is null or m.obra.idObra = :idObra)
              and (:idMaterial is null or m.material.idMaterial = :idMaterial)
              and (:tipo is null or m.tipo = :tipo)
              and (:desde is null or m.fecha >= :desde)
              and (:hastaExclusivo is null or m.fecha < :hastaExclusivo)
            order by m.fecha desc, m.idMovimiento desc
            """)
    List<Movimiento> filtrar(
            @Param("idObra") Integer idObra,
            @Param("idMaterial") Integer idMaterial,
            @Param("tipo") TipoMovimiento tipo,
            @Param("desde") LocalDateTime desde,
            @Param("hastaExclusivo") LocalDateTime hastaExclusivo);
}
