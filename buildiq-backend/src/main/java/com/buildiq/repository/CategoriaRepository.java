package com.buildiq.repository;

import com.buildiq.model.Categoria;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data genera el CRUD (findAll, findById, save, delete...) a partir de esta interfaz. */
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    // Spring Data arma la consulta con solo leer el nombre del método: WHERE LOWER(nombre) = LOWER(?).
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
}
