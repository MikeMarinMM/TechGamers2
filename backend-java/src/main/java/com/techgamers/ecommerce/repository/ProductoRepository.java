package com.techgamers.ecommerce.repository;

import com.techgamers.ecommerce.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Reemplaza el query nativo antiguo: "SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC"
    List<Producto> findByActivoOrderByIdDesc(Integer activo);
}
