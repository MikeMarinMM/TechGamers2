package com.techgamers.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Exponer la carpeta física "uploads" para que el frontend pueda visualizar las fotos subidas
        String dirUploads = Paths.get(System.getProperty("user.dir"), "uploads").toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(dirUploads);

        // Mapeo para las imágenes de productos desde la ruta absoluta de TechGamers
        // Nota: Se usa el prefijo "file:" para rutas absolutas en el sistema de archivos local.
        String dirImagenes = "file:///C:/Users/Miguel Marin/Desktop/EstudIA Ubicua/Programación Javascript y Java - Medio/Proyecto Final/TechGamers/backend/source/imagenes/";
        registry.addResourceHandler("/api/imagenes/**")
                .addResourceLocations(dirImagenes);
    }
}
