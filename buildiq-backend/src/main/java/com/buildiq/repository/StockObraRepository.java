package com.buildiq.repository;

import com.buildiq.model.StockObra;
import com.buildiq.model.StockObraId;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockObraRepository extends JpaRepository<StockObra, StockObraId> {

    // Si un filtro llega en null, no se filtra por ese campo.
    @EntityGraph(attributePaths = {"obra", "material", "material.categoria"})
    @Query("""
            select s from StockObra s
            where (:idObra is null or s.obra.idObra = :idObra)
              and (:idCategoria is null or s.material.categoria.idCategoria = :idCategoria)
            order by s.obra.nombre, s.material.nombre
            """)
    List<StockObra> filtrar(@Param("idObra") Integer idObra, @Param("idCategoria") Integer idCategoria);

    boolean existsByObraIdObra(Integer idObra);

    boolean existsByMaterialIdMaterial(Integer idMaterial);
}
