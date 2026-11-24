package com.buildiq.repository;

import com.buildiq.model.Categoria;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository ya trae findAll, findById, save y delete.
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    // Spring arma la consulta a partir del nombre del método.
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
}
