package com.techgamers.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 150)
    @Column(nullable = false)
    private String nombre;

    @NotBlank
    @Email(message = "Formato de correo inválido")
    @Column(unique = true, nullable = false)
    private String correo;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String contrasena; // Se mapea directo a la columna original password_hash de la BBDD

    // Relación de Llave Foránea: Muchos Usuarios pueden compartir el mismo Rol
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", referencedColumnName = "id", nullable = false)
    private Rol rol;

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void onPrePersist() {
        if(this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}
