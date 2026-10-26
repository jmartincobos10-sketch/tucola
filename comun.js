// Utilidades compartidas por las páginas de TuCola
const C = window.TUCOLA;
const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const SLUG = (qs.get("bar") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");

function fmtTime(d = new Date()) { return new Date(d).toTimeString().slice(0, 5); }
function mins(ms) { return Math.max(0, Math.round(ms / 60000)); }
function etaText(lo, hi) { return lo === 0 ? "ya" : `${lo}-${hi}'`; }

let toastT;
function toast(msg) {
  clearTimeout(toastT);
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  toastT = setTimeout(() => { t.hidden = true; }, 2800);
}

// Mensajes de error legibles
const ERR = {
  bar_not_found: "Este bar no existe. Revisa el enlace del QR.",
  phone_invalid: "Pon un móvil válido (9 cifras).",
  already_in_queue: "Ese móvil ya está en la cola.",
  bad_pin: "PIN incorrecto.",
  entry_not_found: "Ese grupo ya no está en la cola.",
  entry_closed: "Ese grupo ya no está en la cola.",
  twilio_not_configured: "Los avisos por SMS aún no están configurados.",
};
function errText(e) {
  const m = (e && (e.message || e.error || String(e))) || "";
  for (const k in ERR) if (m.includes(k)) return ERR[k];
  if (/fetch|network|Failed/i.test(m)) return "Sin conexión. Reintenta.";
  return "Algo ha fallado: " + m.slice(0, 80);
}
async function rpc(fn, args) {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw error;
  return data;
}
