package com.techgamers.ecommerce.service;

import com.techgamers.ecommerce.model.Pedido;
import com.techgamers.ecommerce.model.Producto;
import com.techgamers.ecommerce.model.Usuario;
import com.techgamers.ecommerce.repository.PedidoRepository;
import com.techgamers.ecommerce.repository.ProductoRepository;
import com.techgamers.ecommerce.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void registrarVenta(String correoUsuario, Long productoId, Integer cantidadPedida) throws Exception {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new Exception("Sesión inválida, usuario no encontrado"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new Exception("Ese producto ha sido descatalogado"));

        if (producto.getActivo() == null || producto.getActivo() == 0 || producto.getStock() < cantidadPedida) {
            throw new Exception("Stock Insuficiente o Mercancía Desactivada");
        }

        // Descuento automático de inventario como lo hacía el viejo Node.js
        if (!producto.getTipoArticulo().equals("SERVICIO_REPARACION")) {
            producto.setStock(producto.getStock() - cantidadPedida);
            productoRepository.save(producto);
        }

        Double totalPagar = producto.getPrecio() * cantidadPedida;

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setProducto(producto);
        pedido.setCantidad(cantidadPedida);
        pedido.setTotal(totalPagar);

        pedidoRepository.save(pedido);
    }
}
