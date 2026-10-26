# TuCola — guía de puesta en marcha

Estado a 24 de octubre de 2026: base de datos y función de avisos desplegadas en Supabase (proyecto `tucola`); la web está en esta carpeta, lista para subir. Faltan dos cosas que solo puedes hacer tú: subir la web a Netlify y crear la cuenta de Twilio.

## 1. La web (GitHub Pages)

La web vive en el repositorio `jmartincobos10-sketch/tucola` y se publica con GitHub Pages en
`https://jmartincobos10-sketch.github.io/tucola/`. Para activarlo la primera vez: en GitHub, **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**. Tarda 1-2 minutos.

Enlaces: `…/tucola/demo` (cliente), `…/tucola/demo/panel` (PIN `1234`), `…/tucola/demo/cartel`. Los enlaces bonitos los resuelve `404.html` (redirige a la página correcta); no hay que tocarlo.

Para actualizar la web: cualquier cambio que se suba a `main` se publica solo.

## 2. Avisos por SMS/WhatsApp (Twilio, 20 minutos)

1. Cuenta en https://www.twilio.com/try-twilio. Verifica tu móvil.
2. **Importante:** pasa la cuenta a de pago (Upgrade, mete 20 €). La cuenta gratuita solo envía a números verificados, y los clientes del bar no lo están.
3. Copia del panel de Twilio el **Account SID** y el **Auth Token**.
4. En Supabase (https://supabase.com/dashboard/project/mfqgxfclrznywotdwnhh) → **Edge Functions → Secrets**, crea:
   - `TWILIO_ACCOUNT_SID` = tu SID
   - `TWILIO_AUTH_TOKEN` = tu token
   - `TWILIO_FROM_SMS` = `TuCola` (remitente alfanumérico; funciona en España sin registro previo) o un número de Twilio si compras uno
5. Prueba desde el panel: apúntate con tu móvil en `/demo`, pulsa **Avisar** en el panel, y te llega el SMS. Coste por SMS en España: unos 0,08 €.

### WhatsApp (cuando Meta apruebe, normalmente 1-3 días)
1. En Twilio → **Messaging → Senders → WhatsApp senders**: registra un número y completa la verificación del negocio de Meta (pide nombre, dirección y web; vale la de Netlify).
2. Crea y envía a aprobación una plantilla de utilidad con este texto exacto (las variables entre llaves):
   `¡Tu mesa en {{1}} está lista! Tienes {{2}} minutos para venir. Pregunta por {{3}} en la barra.`
3. Cuando esté aprobado: secreto `TWILIO_FROM_WA` = `whatsapp:+34XXXXXXXXX` (tu número de WhatsApp en Twilio), y en la tabla `bars` cambia `channel` a `whatsapp` para ese bar. Coste por aviso: 0,0166 €.

Mientras tanto todo funciona por SMS. Si aún no has puesto las claves de Twilio, el botón **Avisar** marca al grupo como avisado igualmente (sale un aviso de "avisos aún no configurados") para que puedas probar el flujo.

## 3. Dar de alta un bar nuevo (2 minutos)

En Supabase → **SQL Editor**, ejecuta (cambia los valores):

```sql
insert into public.bars (slug, name, address, staff_pin, review_url)
values ('los-diamantes', 'Los Diamantes', 'Calle Navas 28, Granada', '4821', 'https://g.page/r/XXXX/review');
```

- `slug`: solo minúsculas, números y guiones; es el enlace: `jmartincobos10-sketch.github.io/tucola/los-diamantes`.
- `staff_pin`: 4 a 6 dígitos; es lo que el camarero escribe para entrar al panel. Dáselo en persona.
- `review_url`: el enlace "Escribir una reseña" de la ficha de Google del bar (opcional).

Enlaces de ese bar:
- Cliente (el del QR): `https://jmartincobos10-sketch.github.io/tucola/los-diamantes`
- Panel del camarero: `https://jmartincobos10-sketch.github.io/tucola/los-diamantes/panel`
- Cartel para imprimir: `https://jmartincobos10-sketch.github.io/tucola/los-diamantes/cartel` → botón Imprimir (A4; mejor plastificado o en metacrilato)

Ajustes por bar (columnas de `bars`): `grace_minutes` (minutos que damos para volver, 5), `gap_small_default` y `gap_large_default` (ritmo inicial en minutos hasta que haya datos: 5 y 25).

## 4. Cómo funciona por dentro (para que sepas qué tocar)

- `cliente.html`: la página del QR. Llama a `join_queue` al apuntarse y a `queue_state` cada 5 segundos. Guarda un token en el móvil del cliente para reconocerlo si cierra la página.
- `panel.html`: el panel. Pide el PIN, llama a `staff_queue` cada 4 segundos y a `staff_action` (sentar, no viene). **Avisar** llama a la función `notify` de Supabase, que comprueba el PIN, envía el SMS/WhatsApp por Twilio y marca el grupo como avisado.
- Los teléfonos nunca llegan al navegador del panel ni al del cliente: solo salen de la base de datos hacia Twilio.
- Tiempo estimado: dos ritmos (mesas de 1-4 y de 5 o más) calculados con la media de minutos entre los últimos "Sentar" de hoy, descartando valores disparados; se muestra como rango redondeado hacia arriba. Si no hay datos, usa los valores por defecto del bar.
- Limpieza: los teléfonos de quien no marcó la casilla de ofertas se borran a las 24 h (tarea programada a las 04:15).
- Los que marcan la casilla quedan en la tabla `clients` (teléfono, nombre, visitas). El envío de ofertas desde el panel no está en esta versión; se añade después.

## 5. Checklist para el primer bar (27-28 de octubre)

- [ ] Web subida y probada con tu propio móvil (apuntarte, avisar, sentar).
- [ ] Twilio con saldo y claves puestas; SMS de prueba recibido.
- [ ] Bar dado de alta con su PIN y su enlace.
- [ ] Cartel impreso (A4 plastificado) para la puerta y otro para la barra.
- [ ] Tablet o móvil del bar con `/nombre-del-bar/panel` abierto y el PIN metido (añadir a pantalla de inicio).
- [ ] 10 minutos con el equipo: Avisar → Sentar → No viene. Nada más.
- [ ] Tú en el bar la primera hora punta.
- [ ] Contrato de encargado del tratamiento firmado (plantilla de la AEPD) y una línea en el cartel: "Tu móvil se usa solo para avisarte".
