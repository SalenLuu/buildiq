package com.buildiq.repository;

import com.buildiq.model.Proveedor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    Optional<Proveedor> findByNit(String nit);
}
