package com.buildiq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tabla movimientos: historial de entradas, salidas y ajustes.
 * El proveedor solo aplica a ENTRADA, por eso la relación admite null.
 */
@Entity
@Table(name = "movimientos")
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Integer idMovimiento;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_obra", nullable = false)
    @JsonIgnore
    private Obra obra;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_material", nullable = false)
    @JsonIgnore
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor")
    @JsonIgnore
    private Proveedor proveedor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipo;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad;

    // La base la rellena con CURRENT_TIMESTAMP; al crear desde la API la fija el servicio.
    @Column(nullable = false)
    private LocalDateTime fecha;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String responsable;

    @Size(max = 250)
    @Column(length = 250)
    private String observacion;

    @JsonProperty("idObra")
    public Integer getIdObra() { return obra.getIdObra(); }

    @JsonProperty("obraNombre")
    public String getObraNombre() { return obra.getNombre(); }

    @JsonProperty("idMaterial")
    public Integer getIdMaterial() { return material.getIdMaterial(); }

    @JsonProperty("materialNombre")
    public String getMaterialNombre() { return material.getNombre(); }

    @JsonProperty("unidadMedida")
    public String getUnidadMedida() { return material.getUnidadMedida(); }

    @JsonProperty("idProveedor")
    public Integer getIdProveedor() { return proveedor == null ? null : proveedor.getIdProveedor(); }

    @JsonProperty("proveedorNombre")
    public String getProveedorNombre() { return proveedor == null ? null : proveedor.getNombre(); }

    public Integer getIdMovimiento() { return idMovimiento; }
    public void setIdMovimiento(Integer idMovimiento) { this.idMovimiento = idMovimiento; }
    public Obra getObra() { return obra; }
    public void setObra(Obra obra) { this.obra = obra; }
    public Material getMaterial() { return material; }
    public void setMaterial(Material material) { this.material = material; }
    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }
    public TipoMovimiento getTipo() { return tipo; }
    public void setTipo(TipoMovimiento tipo) { this.tipo = tipo; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
