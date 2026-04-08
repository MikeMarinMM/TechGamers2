package com.techgamers.ecommerce.controller;

import com.techgamers.ecommerce.model.Producto;
import com.techgamers.ecommerce.service.ProductoService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> getProductos() {
        return productoService.obtenerCatalogoActivo();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductoById(@PathVariable @org.springframework.lang.NonNull Long id) {
        try {
            return ResponseEntity.ok(productoService.encontrarPorId(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // Usando form-data (Multipart) para replicar el Middleware Multer
    @PostMapping // @PreAuthorize verifica el rol ADMIN dinámicamente
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProducto(
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("precio") Double precio,
            @RequestParam("categoria_id") Long categoriaId,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        try {
            Producto p = new Producto();
            p.setNombre(nombre);
            p.setDescripcion(descripcion);
            p.setPrecio(precio);
            p.setCategoriaId(categoriaId);
            p.setStock(stock);

            if (imagen != null && !imagen.isEmpty()) {
                p.setUrlImagen(guardarImagen(imagen));
            }

            Producto nuevo = productoService.crearProducto(p);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Mercancía creada y catalogada exitosamente");
            response.put("id", nuevo.getId());
            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProducto(
            @PathVariable @org.springframework.lang.NonNull Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("precio") Double precio,
            @RequestParam("categoria_id") Long categoriaId,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        try {
            Producto newData = new Producto();
            newData.setNombre(nombre);
            newData.setDescripcion(descripcion);
            newData.setPrecio(precio);
            newData.setCategoriaId(categoriaId);
            newData.setStock(stock);

            if (imagen != null && !imagen.isEmpty()) {
                newData.setUrlImagen(guardarImagen(imagen));
            }

            productoService.actualizarProducto(id, newData);
            return ResponseEntity.ok(Map.of("message", "Actualizado correctamente en todo el servidor"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "Aviso: Producto No Editado o Id Inválido"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProducto(@PathVariable @org.springframework.lang.NonNull Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.ok(Map.of("message", "Eliminado del inventario de forma exitosa"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // Utilidad privada para simular "Multer" de Node en Spring WebMVC
    private String guardarImagen(MultipartFile imagen) throws IOException {
        String baseDir = System.getProperty("user.dir") + "/uploads/productos/";
        File dir = new File(baseDir);
        if(!dir.exists()) dir.mkdirs();
        
        String nombreUnico = "producto-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0,8) + ".jpeg";
        File fileFinal = new File(dir, nombreUnico);
        imagen.transferTo(fileFinal);
        return "/uploads/productos/" + nombreUnico;
    }
}
