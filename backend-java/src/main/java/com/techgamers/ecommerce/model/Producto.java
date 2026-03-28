package com.techgamers.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "categoria_id", nullable = false)
    private Long categoriaId = 1L;

    @NotBlank(message = "Debes proveer un nombre para la mercancía")
    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @PositiveOrZero(message = "El precio de mercado no puede ser numérico negativo")
    @Column(nullable = false)
    private Double precio;

    @Column(name = "tipo_articulo")
    private String tipoArticulo = "PRODUCTO_FISICO";

    @PositiveOrZero
    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "estado_articulo")
    private String estadoArticulo = "NUEVO";

    @Column(name = "url_imagen")
    private String urlImagen;

    @Column(nullable = false)
    private Integer activo = 1;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void onPrePersist() {
        if(this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
            this.fechaActualizacion = this.fechaCreacion;
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
