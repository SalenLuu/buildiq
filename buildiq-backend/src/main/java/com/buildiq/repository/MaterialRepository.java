package com.buildiq.repository;

import com.buildiq.model.Material;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Integer> {

    // La categoría es LAZY; el EntityGraph la trae en la misma consulta (JOIN)
    // para poder mostrar categoriaNombre sin consultas extra.
    @Override
    @EntityGraph(attributePaths = "categoria")
    List<Material> findAll();

    @Override
    @EntityGraph(attributePaths = "categoria")
    Optional<Material> findById(Integer id);

    // ¿Hay materiales en esta categoría? Sirve para impedir borrarla.
    boolean existsByCategoriaIdCategoria(Integer idCategoria);
}
