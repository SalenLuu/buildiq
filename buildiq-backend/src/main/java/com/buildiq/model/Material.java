package com.buildiq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

// En el JSON la categoría va como idCategoria y categoriaNombre.
@Entity
@Table(name = "materiales")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material")
    private Integer idMaterial;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String nombre;

    @Size(max = 200)
    @Column(length = 200)
    private String descripcion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    @JsonIgnore
    private Categoria categoria;

    @NotBlank
    @Size(max = 15)
    @Column(name = "unidad_medida", nullable = false, length = 15)
    private String unidadMedida;

    @NotNull
    @PositiveOrZero
    @Column(name = "stock_minimo", nullable = false, precision = 12, scale = 2)
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @NotNull
    @PositiveOrZero
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean activo = true;

    @JsonProperty("idCategoria")
    public Integer getIdCategoria() { return categoria == null ? null : categoria.getIdCategoria(); }

    // El frontend manda solo el id; el servicio luego busca la categoría completa.
    @JsonProperty("idCategoria")
    public void setIdCategoria(Integer idCategoria) {
        if (idCategoria == null) {
            this.categoria = null;
        } else {
            Categoria soloId = new Categoria();
            soloId.setIdCategoria(idCategoria);
            this.categoria = soloId;
        }
    }

    @JsonProperty("categoriaNombre")
    public String getCategoriaNombre() { return categoria == null ? null : categoria.getNombre(); }

    public Integer getIdMaterial() { return idMaterial; }
    public void setIdMaterial(Integer idMaterial) { this.idMaterial = idMaterial; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal stockMinimo) { this.stockMinimo = stockMinimo; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
