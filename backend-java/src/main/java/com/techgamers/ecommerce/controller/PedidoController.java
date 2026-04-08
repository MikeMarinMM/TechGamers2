package com.techgamers.ecommerce.controller;

import com.techgamers.ecommerce.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<?> generarCompra(Authentication authentication, @RequestBody Map<String, Object> payload) {
        try {
            // Spring extrae el nombre/correo incrustado en el filtro JWT
            String correo = authentication.getName();
            Long productoId = Long.valueOf(payload.get("producto_id").toString());
            Integer cantidad = Integer.valueOf(payload.getOrDefault("cantidad", 1).toString());

            pedidoService.registrarVenta(correo, java.util.Objects.requireNonNull(productoId), cantidad);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Venta procesada con éxito y stock descontado."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
