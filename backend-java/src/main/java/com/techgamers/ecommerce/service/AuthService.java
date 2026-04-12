package com.techgamers.ecommerce.service;

import com.techgamers.ecommerce.config.JwtUtil;
import com.techgamers.ecommerce.model.Rol;
import com.techgamers.ecommerce.model.Usuario;
import com.techgamers.ecommerce.repository.RolRepository;
import com.techgamers.ecommerce.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;


@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> registrar(Usuario usuarioBody) throws Exception {
        if (usuarioRepository.findByCorreo(usuarioBody.getCorreo()).isPresent()) {
            throw new Exception("El correo ingresado ya pertenece a un perfil activo.");
        }

        // Recuperar u otorgar Rol del payload nativo (Node pasaba rol_id)
        Long rolId = usuarioBody.getRol() != null && usuarioBody.getRol().getId() != null ? usuarioBody.getRol().getId() : 2L; // 2 = Cliente
        Rol rol = rolRepository.findById(rolId).orElseThrow(() -> new Exception("Rol inválido"));
        
        usuarioBody.setRol(rol);
        // Hashear el texto plano imitando comportamiento de bcryptjs en node
        usuarioBody.setContrasena(passwordEncoder.encode(usuarioBody.getContrasena()));
        
        usuarioRepository.save(usuarioBody);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Perfil Creado Exitosamente.");
        return response;
    }

    public Map<String, Object> login(String correo, String contrasena) throws Exception {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new Exception("Credenciales incorrectas (Correo no encontrado)"));

        if (!passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new Exception("Credenciales incorrectas (Clave inválida)");
        }

        String token = jwtUtil.generarToken(usuario.getCorreo(), usuario.getRol().getNombreRol(), usuario.getNombre());
        Map<String, Object> outputUsuario = new HashMap<>();
        outputUsuario.put("id", usuario.getId());
        outputUsuario.put("nombre", usuario.getNombre());
        outputUsuario.put("correo", usuario.getCorreo());
        outputUsuario.put("role", usuario.getRol().getNombreRol());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Acceso Autorizado");
        response.put("token", token);
        response.put("user", outputUsuario);
        return response;
    }
}
