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

    // Si un filtro llega en null, no se filtra por ese campo. Primero los más recientes.
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

    boolean existsByObraIdObra(Integer idObra);

    boolean existsByMaterialIdMaterial(Integer idMaterial);

    boolean existsByProveedorIdProveedor(Integer idProveedor);
}
