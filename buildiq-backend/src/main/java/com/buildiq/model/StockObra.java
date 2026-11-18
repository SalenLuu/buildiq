package com.buildiq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Tabla stock_obra: cantidad actual de un material en una obra.
 * La PK es compuesta (@EmbeddedId); @MapsId enlaza cada parte de la clave con su relación.
 * El JSON es plano y trae los datos del material para pintar la tabla sin más consultas.
 */
@Entity
@Table(name = "stock_obra")
public class StockObra {

    @EmbeddedId
    @JsonIgnore
    private StockObraId id = new StockObraId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idObra")
    @JoinColumn(name = "id_obra")
    @JsonIgnore
    private Obra obra;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idMaterial")
    @JoinColumn(name = "id_material")
    @JsonIgnore
    private Material material;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad = BigDecimal.ZERO;

    @JsonProperty("idObra")
    public Integer getIdObra() { return obra.getIdObra(); }

    @JsonProperty("idMaterial")
    public Integer getIdMaterial() { return material.getIdMaterial(); }

    @JsonProperty("obraNombre")
    public String getObraNombre() { return obra.getNombre(); }

    @JsonProperty("materialCodigo")
    public String getMaterialCodigo() { return material.getCodigo(); }

    @JsonProperty("materialNombre")
    public String getMaterialNombre() { return material.getNombre(); }

    @JsonProperty("unidadMedida")
    public String getUnidadMedida() { return material.getUnidadMedida(); }

    @JsonProperty("stockMinimo")
    public BigDecimal getStockMinimo() { return material.getStockMinimo(); }

    @JsonProperty("idCategoria")
    public Integer getIdCategoria() { return material.getIdCategoria(); }

    @JsonProperty("categoriaNombre")
    public String getCategoriaNombre() { return material.getCategoriaNombre(); }

    public StockObraId getId() { return id; }
    public void setId(StockObraId id) { this.id = id; }
    public Obra getObra() { return obra; }
    public void setObra(Obra obra) { this.obra = obra; }
    public Material getMaterial() { return material; }
    public void setMaterial(Material material) { this.material = material; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
}
