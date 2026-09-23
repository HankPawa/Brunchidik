import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

const CATEGORIAS = [
  {
    nombre: "Desayunos Clásicos",
    items: [
      ["Pancakes", "Una torre de cuatro pancakes dorados y extra esponjosos, bañados con miel de abejas pura y azúcar glass. Coronados con frambuesas frescas, arándanos azules y láminas de almendra tostada.", 12900],
      ["Bacon Eggs", "Tiras de tocineta premium ahumada en madera de nogal, cocinadas hasta el punto exacto de crocancia, acompañadas de un huevo frito con yema sedosa que resalta los sabores salados del conjunto.", 18900],
      ["Muffin Inglés con Huevos", "Muffin inglés artesanal tostado con huevos revueltos cremosos sazonados con pimienta negra molida. Acompañado de tomates cherry en rama asados para resaltar su dulzor natural.", 21000],
    ],
  },
  {
    nombre: "Brunch",
    items: [
      ["Avocado Toast Campestre", "Pan de masa madre tostado con crema de aguacate y salteado de vegetales frescos: maíz tierno, pimentón y cebollas caramelizadas. Terminado con romero fresco y pimienta negra recién molida.", 30000],
      ["Eggs Benedict", "Dos huevos pochados sobre muffins ingleses tostados y jamón de espalda premium. Bañados en salsa holandesa de la casa con páprika, acompañados de rúcula, tomates cherry y cebolla morada.", 29900],
      ["Torrijas de Ricotta", "Rebanadas de brioche artesanal doradas en mantequilla, rellenas de crema de ricotta al limón y acompañadas de compota casera de arándanos frescos. Dulce, ácido y perfectamente equilibrado.", 26000],
    ],
  },
  {
    nombre: "Bebidas",
    items: [
      ["Mimosa", "Burbujas de champaña encontrándose con el sol de un jugo de naranja recién exprimido. Fresca, festiva y elegante.", 16000],
      ["Kombucha", "Una bebida fermentada de té con siglos de historia. Ligeramente efervescente, con notas frutales y un toque ácido que despierta los sentidos.", 10000],
      ["Matcha Latte", "Polvo de té verde japonés de primera calidad, suavemente disuelto en leche vaporizada. Energía limpia y sostenida, sin los altibajos del café.", 12000],
    ],
  },
  {
    nombre: "Postres",
    items: [
      ["French Toast", "Brioche tostado bañado en mezcla de huevo y especias, cocinado hasta dorar. Acompañado de sirope de arce puro, frutos silvestres frescos y crema batida casera.", 18900],
      ["Parfait de granola y frutos rojos", "Capas de yogur griego cremoso, granola casera crujiente, miel pura y frutos rojos frescos. Una combinación perfecta de texturas y sabores en cada cucharada.", 14500],
      ["Açaí Bowl", "Base de açaí puro congelado batido hasta crear una textura cremosa, coronada con granola artesanal, coco rallado, frutos frescos y miel de abejas.", 15000],
    ],
  },
  // Categorías sin platos todavía: se llenan desde el panel de administración.
  // El menú público solo muestra las que tienen productos.
  { nombre: "Carnes Rojas", items: [] },
  { nombre: "Comida de Mar", items: [] },
  { nombre: "Pollo", items: [] },
  { nombre: "Arroz", items: [] },
];

async function sembrarAdmin() {
  const { email, password } = env.admin;
  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL/ADMIN_PASSWORD vacías: no se crea el usuario administrador");
    return;
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    // Nunca se pisa la contraseña de un admin existente; solo se asegura el rol.
    if (existente.rol !== "ADMIN") {
      await prisma.usuario.update({ where: { email }, data: { rol: "ADMIN" } });
      console.log(`✔ ${email} promovido a ADMIN`);
    }
    return;
  }

  await prisma.usuario.create({
    data: {
      nombre: "Admin Brunch",
      email,
      password: await bcrypt.hash(password, 10),
      dosFaActivo: false,
      cuentaGoogle: false,
      rol: "ADMIN",
    },
  });
  console.log(`✔ Administrador ${email} creado`);
}

// Crea las categorías que falten, así una base ya existente recibe las nuevas.
// Los platos solo se siembran junto a su categoría recién creada: nunca se pisa
// ni se duplica lo que se haya cambiado desde el panel de administración.
async function sembrarMenu() {
  let categoriasCreadas = 0;
  let productosCreados = 0;

  for (const { nombre, items } of CATEGORIAS) {
    const existente = await prisma.categoria.findUnique({ where: { nombre }, select: { id: true } });
    if (existente) continue;

    await prisma.categoria.create({
      data: {
        nombre,
        items: {
          create: items.map(([nombreItem, descripcion, precio]) => ({
            nombre: nombreItem,
            descripcion,
            precio,
            disponible: precio > 0,
          })),
        },
      },
    });
    categoriasCreadas += 1;
    productosCreados += items.length;
  }

  if (categoriasCreadas > 0) {
    console.log(`✔ Menú: ${categoriasCreadas} categoría(s) y ${productosCreados} producto(s) creados`);
  }
}

export async function seed() {
  await sembrarAdmin();
  await sembrarMenu();
}
