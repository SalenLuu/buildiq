package com.buildiq.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "obras")
public class Obra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_obra")
    private Integer idObra;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String nombre;

    @Size(max = 150)
    @Column(length = 150)
    private String direccion;

    @NotNull
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    // Opcional. No puede ser anterior a la fecha de inicio.
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoObra estado = EstadoObra.PLANEADA;

    public Integer getIdObra() { return idObra; }
    public void setIdObra(Integer idObra) { this.idObra = idObra; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public EstadoObra getEstado() { return estado; }
    public void setEstado(EstadoObra estado) { this.estado = estado; }
}
