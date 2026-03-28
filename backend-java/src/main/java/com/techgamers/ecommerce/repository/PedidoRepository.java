package com.techgamers.ecommerce.repository;

import com.techgamers.ecommerce.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Útil si en el futuro se implementa "Ver el historial de Mis Pedidos"
    List<Pedido> findByUsuarioIdOrderByFechaCompraDesc(Long usuarioId);
}
