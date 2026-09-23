// Las columnas TIMESTAMP de la base no tienen zona horaria: Hibernate guardaba la
// hora local del servidor. Prisma las trata como UTC, así que usamos los campos
// UTC de un Date como "reloj de pared" local. El JSON sale sin sufijo Z para que
// el navegador lo interprete como hora local, igual que hacía Jackson.

export function nowNaive() {
  const d = new Date();
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()),
  );
}

export function todayNaive() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export const formatDateTime = (date) => (date ? date.toISOString().slice(0, 23) : null);
export const formatDate = (date) => (date ? date.toISOString().slice(0, 10) : null);
export const formatTime = (date) => (date ? date.toISOString().slice(11, 19) : null);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?$/;

const valid = (date) => (Number.isNaN(date.getTime()) ? null : date);

export function parseDate(value) {
  if (!DATE_RE.test(value)) return null;
  const date = valid(new Date(`${value}T00:00:00Z`));
  // Rechaza fechas que JS "corrige", como 2026-02-31.
  return date && formatDate(date) === value ? date : null;
}

export function parseTime(value) {
  if (!TIME_RE.test(value)) return null;
  const normalized = value.length === 5 ? `${value}:00` : value;
  const date = valid(new Date(`1970-01-01T${normalized}Z`));
  return date && formatTime(date) === normalized ? date : null;
}

export function parseDateTime(value) {
  if (!DATETIME_RE.test(value)) return null;
  const [datePart] = value.split("T");
  const date = valid(new Date(`${value}Z`));
  return date && formatDate(date) === datePart ? date : null;
}
