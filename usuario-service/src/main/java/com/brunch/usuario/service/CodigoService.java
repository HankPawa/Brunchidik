package com.brunch.usuario.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodigoService {

    private record Entry(String codigo, Instant expira) {}

    private final Map<Long, Entry> codigos = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generarYGuardar(Long usuarioId) {
        String codigo = String.format("%06d", random.nextInt(1_000_000));
        codigos.put(usuarioId, new Entry(codigo, Instant.now().plusSeconds(300)));
        return codigo;
    }

    public boolean verificar(Long usuarioId, String codigo) {
        Entry entry = codigos.get(usuarioId);
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expira())) { codigos.remove(usuarioId); return false; }
        if (!entry.codigo().equals(codigo)) return false;
        codigos.remove(usuarioId);
        return true;
    }
}
