package com.brunch.menu.filter;

import com.brunch.menu.repository.UsuarioRefRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Server-side guard for /api/admin/**. The caller must send the id of a
 * logged-in user (via X-Usuario-Id) whose role is ADMIN. Without this,
 * admin protection existed only in the frontend route guard.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class AdminAuthFilter extends OncePerRequestFilter {

    private final UsuarioRefRepository usuarioRefRepository;

    public AdminAuthFilter(UsuarioRefRepository usuarioRefRepository) {
        this.usuarioRefRepository = usuarioRefRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/admin")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!esAdmin(request.getHeader("X-Usuario-Id"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"Acceso restringido a administradores\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean esAdmin(String usuarioIdHeader) {
        if (usuarioIdHeader == null || usuarioIdHeader.isBlank()) return false;
        try {
            Long usuarioId = Long.valueOf(usuarioIdHeader);
            return usuarioRefRepository.findById(usuarioId)
                    .map(u -> "ADMIN".equals(u.getRol()))
                    .orElse(false);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
