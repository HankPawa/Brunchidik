package com.brunch.usuario.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Map<String, int[]> RULES = new LinkedHashMap<>();

    static {
        RULES.put("POST:/api/usuarios/2fa/enviar",    new int[]{5,  60});
        RULES.put("POST:/api/usuarios/2fa/verificar", new int[]{10, 60});
        RULES.put("POST:/api/usuarios/google-login",  new int[]{10, 60});
        RULES.put("POST:/api/usuarios/registro",      new int[]{5,  60});
        RULES.put("POST:/api/usuarios/login",         new int[]{10, 60});
        RULES.put("",                                  new int[]{60, 60});
    }

    private final StringRedisTemplate redis;

    public RateLimitFilter(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path   = request.getRequestURI();
        String ip     = getClientIp(request);

        int[] rule        = resolveRule(method, path);
        int limit         = rule[0];
        int windowSeconds = rule[1];

        String key   = buildKey(method, path, ip);
        Long   count = redis.opsForValue().increment(key);

        if (count != null && count == 1L) {
            redis.expire(key, windowSeconds, TimeUnit.SECONDS);
        }

        if (count != null && count > limit) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(windowSeconds));
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"error\":\"Too many requests\",\"retryAfter\":" + windowSeconds + "}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int[] resolveRule(String method, String path) {
        String candidate = method + ":" + path;
        for (Map.Entry<String, int[]> entry : RULES.entrySet()) {
            if (entry.getKey().isEmpty() || candidate.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return new int[]{60, 60};
    }

    private String buildKey(String method, String path, String ip) {
        return "rl:" + method + ":" + path + ":" + ip;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
