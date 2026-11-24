package com.buildiq.repository;

import com.buildiq.model.Material;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Integer> {

    // Trae la categoría en la misma consulta para poder mostrar su nombre.
    @Override
    @EntityGraph(attributePaths = "categoria")
    List<Material> findAll();

    @Override
    @EntityGraph(attributePaths = "categoria")
    Optional<Material> findById(Integer id);

    Optional<Material> findByCodigoIgnoreCase(String codigo);

    boolean existsByCategoriaIdCategoria(Integer idCategoria);
}
