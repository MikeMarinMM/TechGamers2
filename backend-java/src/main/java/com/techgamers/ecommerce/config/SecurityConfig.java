package com.techgamers.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;




@Configuration
@EnableMethodSecurity // Permite usar anotaciones como @PreAuthorize("hasRole('ADMIN')") en los Controllers
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Login y Registro Libre
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/productos/**").permitAll() // Vitrina Pública Libre
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN") // Perímetro restrictivo de jerarquía nivel 1
                .requestMatchers("/uploads/**").permitAll() // Carpeta Multer Pública
                .requestMatchers("/api/imagenes/**").permitAll() // Imágenes de productos públicas
                .anyRequest().authenticated() // Pedidos y resto requieren token
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    // Usaremos el mismo encriptador que tenía Node.js "bcrypt" para poder validar passwords viejos
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
