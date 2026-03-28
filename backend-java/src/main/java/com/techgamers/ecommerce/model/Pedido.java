package com.techgamers.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación a Usuario que ejecuta la adquisición
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Relación al Producto en bodega adquirido
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Positive(message = "Cantidades no pueden ser nulas o cero")
    @Column(nullable = false)
    private Integer cantidad;

    @Positive
    @Column(nullable = false)
    private Double total;

    @Column(name = "fecha_compra", updatable = false)
    private LocalDateTime fechaCompra;

    @PrePersist
    public void onPrePersist() {
        if (this.fechaCompra == null) {
            this.fechaCompra = LocalDateTime.now();
        }
    }
}
