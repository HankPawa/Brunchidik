package com.brunch.config;

import com.brunch.models.*;
import com.brunch.repositories.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final MenuItemRepository menuItemRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(UsuarioRepository usuarioRepository,
                           CategoriaRepository categoriaRepository,
                           MenuItemRepository menuItemRepository) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedMenu();
    }

    private void seedAdmin() {
        usuarioRepository.findByEmail("admin@brunch.com").ifPresentOrElse(
            u -> {
                u.setRol(Rol.ADMIN);
                usuarioRepository.save(u);
            },
            () -> {
                Usuario admin = new Usuario();
                admin.setNombre("Admin Brunch");
                admin.setEmail("admin@brunch.com");
                admin.setPassword(encoder.encode("brunch123"));
                admin.setRol(Rol.ADMIN);
                usuarioRepository.save(admin);
            }
        );
    }

    private void seedMenu() {
        if (categoriaRepository.count() > 0) return;

        Categoria desayunos = new Categoria(); desayunos.setNombre("Desayunos Clásicos");
        Categoria brunch   = new Categoria(); brunch.setNombre("Brunch");
        Categoria bebidas  = new Categoria(); bebidas.setNombre("Bebidas");
        Categoria postres  = new Categoria(); postres.setNombre("Postres");

        categoriaRepository.saveAll(List.of(desayunos, brunch, bebidas, postres));

        List<MenuItem> items = List.of(
            item("Pancakes",                 "Una torre de cuatro pancakes dorados y extra esponjosos, bañados con miel de abejas pura y azúcar glass. Coronados con frambuesas frescas, arándanos azules y láminas de almendra tostada.",                                                                                                12900, desayunos),
            item("Bacon Eggs",               "Tiras de tocineta premium ahumada en madera de nogal, cocinadas hasta el punto exacto de crocancia, acompañadas de un huevo frito con yema sedosa que resalta los sabores salados del conjunto.",                                                                                         18900, desayunos),
            item("Muffin Inglés con Huevos", "Muffin inglés artesanal tostado con huevos revueltos cremosos sazonados con pimienta negra molida. Acompañado de tomates cherry en rama asados para resaltar su dulzor natural.",                                                                                                         21000, desayunos),
            item("Avocado Toast Campestre",  "Pan de masa madre tostado con crema de aguacate y salteado de vegetales frescos: maíz tierno, pimentón y cebollas caramelizadas. Terminado con romero fresco y pimienta negra recién molida.",                                                                                            30000, brunch),
            item("Eggs Benedict",            "Dos huevos pochados sobre muffins ingleses tostados y jamón de espalda premium. Bañados en salsa holandesa de la casa con páprika, acompañados de rúcula, tomates cherry y cebolla morada.",                                                                                              29900, brunch),
            item("Torrijas de Ricotta",      "Rebanadas de brioche artesanal doradas en mantequilla, rellenas de crema de ricotta al limón y acompañadas de compota casera de arándanos frescos. Dulce, ácido y perfectamente equilibrado.",                                                                                             26000, brunch),
            item("Mimosa",                   "Burbujas de champaña encontrándose con el sol de un jugo de naranja recién exprimido. Fresca, festiva y elegante.",                                                                                                                                                                        16000, bebidas),
            item("Kombucha",                 "Una bebida fermentada de té con siglos de historia. Ligeramente efervescente, con notas frutales y un toque ácido que despierta los sentidos.",                                                                                                                                            10000, bebidas),
            item("Matcha Latte",             "Polvo de té verde japonés de primera calidad, suavemente disuelto en leche vaporizada. Energía limpia y sostenida, sin los altibajos del café.",                                                                                                                                           12000, bebidas),
            item("Postre 1",                 "Descripción próximamente.", 0, postres),
            item("Postre 2",                 "Descripción próximamente.", 0, postres),
            item("Postre 3",                 "Descripción próximamente.", 0, postres)
        );

        menuItemRepository.saveAll(items);
    }

    private MenuItem item(String nombre, String desc, int precio, Categoria cat) {
        MenuItem m = new MenuItem();
        m.setNombre(nombre);
        m.setDescripcion(desc);
        m.setPrecio(BigDecimal.valueOf(precio));
        m.setCategoria(cat);
        m.setDisponible(precio > 0);
        return m;
    }
}
