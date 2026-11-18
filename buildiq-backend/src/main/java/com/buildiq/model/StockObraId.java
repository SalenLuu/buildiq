package com.buildiq.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/** Clave primaria compuesta de stock_obra: (id_obra, id_material). */
@Embeddable
public class StockObraId implements Serializable {

    @Column(name = "id_obra")
    private Integer idObra;

    @Column(name = "id_material")
    private Integer idMaterial;

    public StockObraId() {
    }

    public StockObraId(Integer idObra, Integer idMaterial) {
        this.idObra = idObra;
        this.idMaterial = idMaterial;
    }

    public Integer getIdObra() { return idObra; }
    public void setIdObra(Integer idObra) { this.idObra = idObra; }
    public Integer getIdMaterial() { return idMaterial; }
    public void setIdMaterial(Integer idMaterial) { this.idMaterial = idMaterial; }

    // Una clave compuesta necesita equals/hashCode para que JPA distinga filas.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StockObraId otro)) return false;
        return Objects.equals(idObra, otro.idObra) && Objects.equals(idMaterial, otro.idMaterial);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idObra, idMaterial);
    }
}
