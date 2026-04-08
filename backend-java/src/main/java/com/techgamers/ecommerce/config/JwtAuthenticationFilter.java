package com.techgamers.ecommerce.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
                                    @org.springframework.lang.NonNull HttpServletResponse response,
                                    @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.validarToken(token)) {
                    Claims claims = jwtUtil.validarYExtraerClaims(token);
                    String correo = claims.getSubject();
                    Long rolId = claims.get("rolId", Long.class);
                    
                    // Traducción: ROL 1 es ADMIN, ROL 2 es CLIENTE.
                    String rolAuth = (rolId != null && rolId == 1L) ? "ROLE_ADMIN" : "ROLE_CLIENTE";
                    
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            correo, null, Collections.singletonList(new SimpleGrantedAuthority(rolAuth)));
                    
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // Si el token es falso o expirado, lo ignoramos y seguirá como Anónimo.
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
