package com.techgamers.ecommerce.service;

import com.techgamers.ecommerce.model.Producto;
import com.techgamers.ecommerce.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> obtenerCatalogoActivo() {
        return productoRepository.findByActivoOrderByIdDesc(1);
    }

    public Producto encontrarPorId(@org.springframework.lang.NonNull Long id) throws Exception {
        return productoRepository.findById(id)
                .orElseThrow(() -> new Exception("No encontrado"));
    }

    public Producto crearProducto(@org.springframework.lang.NonNull Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(@org.springframework.lang.NonNull Long id, Producto newData) throws Exception {
        Producto productoDB = encontrarPorId(id);
        productoDB.setCategoriaId(newData.getCategoriaId());
        productoDB.setNombre(newData.getNombre());
        productoDB.setDescripcion(newData.getDescripcion());
        productoDB.setPrecio(newData.getPrecio());
        productoDB.setStock(newData.getStock());
        
        if (newData.getUrlImagen() != null) {
            productoDB.setUrlImagen(newData.getUrlImagen());
        }
        
        return productoRepository.save(productoDB);
    }

    public void eliminarProducto(@org.springframework.lang.NonNull Long id) throws Exception {
        if (!productoRepository.existsById(id)) {
            throw new Exception("Producto no existe");
        }
        productoRepository.deleteById(id);
    }
}
