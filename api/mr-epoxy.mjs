// ═══════════════════════════════════════════════════════════
// MR. EPOXY — PROXY DE API (Vercel Function + Google Gemini)
// Archivo: api/mr-epoxy.mjs  →  se sirve en la ruta /api/mr-epoxy
//
// Usa Gemini 2.5 Flash — tier gratuito: 1,000 requests/día
// Obtén tu API key GRATIS en: https://aistudio.google.com/apikey
// ═══════════════════════════════════════════════════════════

// ─── TU API KEY DE GEMINI ───
// Configúrala como variable de entorno en Vercel (NO la escribas aquí):
//   Dashboard > tu proyecto > Settings > Environment Variables > Add New
//   Key: GEMINI_API_KEY   Value: AIzaSy...
//   (Marca los entornos Production, Preview y Development)
const API_KEY = process.env.GEMINI_API_KEY || "TU_GEMINI_API_KEY_AQUI";

// ─── MODELO ───
// gemini-2.5-flash  → Rápido, barato, muy bueno (RECOMENDADO)
// gemini-2.5-flash-lite → Aún más barato, ligeramente menos capaz
const MODEL = "gemini-2.5-flash";

// ─── IDIOMAS SOPORTADOS ───
// El frontend manda body.lang (es, en, fr, ...). Si no llega o no se reconoce,
// se usa español. El nombre se inyecta en el system prompt para forzar el idioma.
const LANGS = {
  es: "español (de México)",
  en: "English",
  fr: "français",
  de: "Deutsch (alemán)",
  it: "italiano",
  pl: "polski (polaco)",
  nl: "Nederlands (neerlandés)",
  pt: "português",
  lv: "latviešu (letón)",
  fi: "suomi (finés)",
};

// ─── MENSAJES DE ERROR/BLOQUEO LOCALIZADOS ───
// Para que, si algo falla, el usuario lo vea en su idioma (no siempre en español).
const MSG = {
  blocked: {
    es: "Disculpa, no puedo responder esa pregunta. ¿Hay algo sobre nuestros productos epóxicos en lo que pueda ayudarte?",
    en: "Sorry, I can't answer that question. Is there anything about our epoxy products I can help you with?",
    fr: "Désolé, je ne peux pas répondre à cette question. Puis-je vous aider sur nos produits époxy ?",
    de: "Entschuldigung, diese Frage kann ich nicht beantworten. Kann ich Ihnen zu unseren Epoxidprodukten weiterhelfen?",
    it: "Spiacente, non posso rispondere a questa domanda. Posso aiutarti con i nostri prodotti epossidici?",
    pl: "Przepraszam, nie mogę odpowiedzieć na to pytanie. Czy mogę pomóc w temacie naszych produktów epoksydowych?",
    nl: "Sorry, die vraag kan ik niet beantwoorden. Kan ik je helpen met onze epoxyproducten?",
    pt: "Desculpe, não posso responder a essa pergunta. Posso ajudar com nossos produtos epóxi?",
    lv: "Atvainojos, uz šo jautājumu nevaru atbildēt. Vai varu palīdzēt ar mūsu epoksīda produktiem?",
    fi: "Pahoittelut, en voi vastata tähän kysymykseen. Voinko auttaa epoksituotteissamme?",
  },
  generic: {
    es: "Disculpa, tuve un problema al procesar tu pregunta. ¿Podrías intentarlo de nuevo?",
    en: "Sorry, I had a problem processing your question. Could you try again?",
    fr: "Désolé, j'ai rencontré un problème en traitant votre question. Pourriez-vous réessayer ?",
    de: "Entschuldigung, bei der Verarbeitung Ihrer Frage ist ein Problem aufgetreten. Bitte versuchen Sie es erneut.",
    it: "Spiacente, ho avuto un problema nell'elaborare la tua domanda. Puoi riprovare?",
    pl: "Przepraszam, wystąpił problem podczas przetwarzania pytania. Spróbuj ponownie.",
    nl: "Sorry, er ging iets mis bij het verwerken van je vraag. Probeer het opnieuw.",
    pt: "Desculpe, tive um problema ao processar sua pergunta. Poderia tentar novamente?",
    lv: "Atvainojos, radās problēma, apstrādājot tavu jautājumu. Lūdzu, mēģini vēlreiz.",
    fi: "Pahoittelut, kysymyksesi käsittelyssä tapahtui virhe. Yritä uudelleen.",
  },
};
function msg(kind, lang) {
  return (MSG[kind] && (MSG[kind][lang] || MSG[kind].es)) || "";
}

// ─── BASE DE CONOCIMIENTO ───
const KNOWLEDGE_BASE = `
=== FUSION EPOXY — BASE DE CONOCIMIENTO COMPLETA ===
=== MATRIZ DE PRODUCTOS 2026 — SKU, PROPIEDADES Y COMPONENTES ===


============================================================
--- CATÁLOGO DE PRODUCTOS (POR SKU) ---
============================================================

• SKU: AJT2 — Epoxy Líquido Transparente en Jeringa 2 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 2 min | Secado: 5 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Sectores: HOGAR USO GENERAL,TALLER, INDUSTRIA, CONSTRUCCION, AUTOMOTRIZ, LINEA BLANCA, REFRIGERACION, NAVAL, AEROESPACIAL, BICICLETAS, PATINES, MODELISMO, ELECTRICO, ELECTRONICO, ARTESANIAS, DECORACION, PISOS, JUNTAS, PLASTICOS RIGIDOS, MOTOS,CARPINTERIA, TINACOS, TANQUES, MINERIA, LINEA BLANCA, RAPIDEZ DE SECADO SOLO 5 MINUTOS.
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Jeringa 2 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 2 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJT5 — Epoxy Líquido Transparente en Jeringa 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJT5-E — Epoxy Líquido Transparente en Jeringa 5 Minutos Golden Epoxy Plus
  Contenido: 30 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Jeringa 5 Minutos Golden Epoxy Plus, un adhesivo epóxico de dos componentes de la línea premium Golden Epoxy Plus que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATT5 — Epoxy Líquido Transparente en Tubo 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Tubo 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJT5-IND — Epoxy Líquido Transparente Industrial 5 Minutos 250 g
  Contenido: 250 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente Industrial 5 Minutos 250 g de Fusion Epoxy, un adhesivo epóxico de dos componentes en presentación industrial de mayor rendimiento que seca en 5 minutos con una resistencia que no te va a dejar a …

• SKU: ATT10C16 — EPOXY LIQUIDO SOLDADOR TUBO 10 MIN
  Contenido: 16 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: ATT516 — Epoxy Líquido Transparente en Tubo 5 Minutos
  Contenido: 16 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Tubo 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATT516-E — EPOXY LIQUIDO SOLDADOR TUBO 5 MIN GOLDEN EPOXY PLUS
  Contenido: 16 (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: ATT10C82 — EPOXY LIQUIDO SOLDADOR TUBO 10 MIN
  Contenido: 82 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: BUENO
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: AJT10 — Epoxy Líquido Gel Blanco en Jeringa 10 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: BLANCO LECHOSO | Consistencia: GEL
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 6 min | Secado: 10 min | Curado total: 5 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Gel Blanco en Jeringa 10 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 10 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJT30 — Epoxy Líquido Transparente en Jeringa 30 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: CAFÉ AMBAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 15 min | Secado: 30 min | Curado total: 5 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2561.4 PSI)
  Resistencia a solventes/detergentes/aceites/agua: BUENA | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Transparente en Jeringa 30 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 30 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJLA5 — Epoxy Líquido Acero en Jeringa 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 3 min | Secado: 5 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Sectores: AUTOMOTRIZ, EN GENERAL, TANQUES DE GASOLINA,, FACIAS, BOOPERS, SEGUROS DE ESPEJOS, RADIADORES, TANQUES DE AGUA Y REFRIGERANTES,
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATLA5 — EPOXY ACERO SOLDADOR TUBO 5 MIN
  Contenido: 30 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: AJLA5-E — Epoxy Líquido Acero en Jeringa 5 Minutos Golden Epoxy Plus
  Contenido: 30 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Jeringa 5 Minutos Golden Epoxy Plus, un adhesivo epóxico de dos componentes de la línea premium Golden Epoxy Plus que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATA10A21 — EPOXY ACERO SOLDADOR TUBO 10 MIN
  Contenido: 21 (CAJA) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 4 min | Secado: 10 min | Curado total: 5 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: ATA521 — Epoxy Líquido Acero en Tubo 5 Minutos
  Contenido: 21 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Tubo 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATA521-E — EPOXY ACERO SOLDADOR TUBO 5 MIN GOLDEN EPOXY PLUS
  Contenido: 21 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 3 min | Secado: 7 min
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: ATA10A108 — EPOXY ACERO SOLDADOR TUBO 10 MIN
  Contenido: 108 (CAJA) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 4 min | Secado: 10 min | Curado total: 5 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO

• SKU: AJLA30 — Epoxy Líquido Acero en Jeringa 30 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 20 min | Secado: 30 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2561.4 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Jeringa 30 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 30 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ATLA30 — Epoxy Líquido Acero en Tubo 30 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 20 min | Secado: 30 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 180 °C | Compresión: 150 KG/CM2 (2561.4 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: MUY BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Tubo 30 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 30 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ALAP5 — Epoxy Acero en Lata 5 Minutos
  Contenido: 70 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 3 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 4 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 160 KG/CM2 | Temp. máx. de trabajo: 180 °C | Compresión: 250 KG/CM2 (2276.8 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Acero en Lata 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ALAP5-E — Epoxy Acero Pasta en Lata 5 Minutos Golden Epoxy Plus
  Contenido: 70 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 3 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 4 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 160 KG/CM2 | Temp. máx. de trabajo: 180 °C | Compresión: 250 KG/CM2 (2276.8 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Acero Pasta en Lata 5 Minutos Golden Epoxy Plus de Fusion Epoxy, un adhesivo epóxico de dos componentes de la línea premium Golden Epoxy Plus que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ALAP30 — Epoxy Líquido Acero en Lata 30 Minutos
  Contenido: 70 (BLISTER) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 3 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 20 min | Secado: 30 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 180 °C | Compresión: 300 KG/CM2 (2561.4 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: MUY BUENO | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Acero en Lata 30 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 30 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL60E5A — Epoxy Plastilina Acero en Barra Integrada 5 Min 60 g
  Contenido: 60 (BLISTER) | Color de mezcla: ACERO | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 4 min | Secado: 6 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 700 °C | Compresión: 800 KG/CM2 (1423 PSI)
  Resistencia a solventes/detergentes/aceites/agua: BUENA | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina Acero en Barra Integrada 5 Min 60 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJN5 — Epoxy Líquido Negro en Jeringa 5 Minutos
  Contenido: 30 g (BLISTER) | Color de mezcla: NEGRO | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Sectores: HOGAR, TALLER, INDUSTRIA, CONSTRUCCION, AUTOMOTRIZ, LINEA BLANCA, REFRIGERACION, NAVAL, AEROESPACIAL, BICICLETAS, PATINES, MODELISMO, ELECTRICO, ELECTRONICO, ARTESANIAS, DECORACION, PISOS, JUNSTAS, PLASTICOS RIGIDOS, MOTOS,CARPINTERIA, TINACOS, TANQUES, RAPIDEZ DE SECADO SOLO 5 MINUTOS.
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Negro en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJMB60 — Epoxy Líquido Marine en Jeringa 60 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: AZUL | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 60 min | Secado: 02:30:00 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 150 KG/CM2 (2161.4 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Azul en Jeringa 60 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 60 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJCO5 — Epoxy Líquido Cobre en Jeringa 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: COBRE | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Cobre en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJAL5 — Epoxy Líquido Aluminio en Jeringa 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: ALUMINIO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 5 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Aluminio en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJMA5 — Epoxy Líquido Blanco en Jeringa 5 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: BLANCO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Blanco en Jeringa 5 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: AJFLEX — Epoxy Líquido Flexible en Jeringa 45 Minutos
  Contenido: 30 (BLISTER) | Color de mezcla: BLANCO | Consistencia: PASTA LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 7 min | Secado: 30-45 min | Curado total: 6 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2134.5 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: BUENO | Reconstruir: BUENO | Anclaje químico: EXCELENTE
  Componentes del kit: 1 PALETA DE MEZCLADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Líquido Flexible en Jeringa 45 Minutos de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNON50 — Epoxy UNO Negro 50 g
  Contenido: 50 (CAJA) | Color de mezcla: NEGRO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Negro 50 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. Ideal para hogar, taller, hojalatería, industria, construcción y mucho más. …

• SKU: UNON98 — Epoxy UNO Negro 100 g
  Contenido: 100 (CAJA) | Color de mezcla: NEGRO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Negro 100 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOB50 — EPOXY UNO USO GENERAL BLANCO
  Contenido: 50 (CAJA) | Color de mezcla: BLANCO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA

• SKU: UNOB98 — Epoxy UNO Blanco 100 g
  Contenido: 100 (CAJA) | Color de mezcla: BLANCO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Blanco 100 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOA50 — EPOXY UNO USO GENERAL ACERO
  Contenido: 50 (CAJA) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA

• SKU: UNOA98 — Epoxy UNO Acero 100 g
  Contenido: 100 (CAJA) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Acero 100 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOSF50 — Fusion Epoxy – Epoxy Uno Super Fast 5 Minutos UNOSF50
  Contenido: 50 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDO
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 1 min | Tiempo de uso (25°C): 3 min | Secado: 5 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: MUY BUENA | Trabaja bajo agua: NO | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: REGULAR | Reconstruir: REGULAR | Anclaje químico: REGULAR
  Componentes del kit: 2 PALETAS DE MEZCLADO
  Descripción: Fusion Epoxy Uno Super Fast 5 Minutos UNOSF50 es un adhesivo epóxico de secado ultrarrápido , endurece en solo 5 minutos y cura completamente en 3 horas. …

• SKU: UNOC50 — Epoxy UNO Transparente 50 g
  Contenido: 50 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDO
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 2 min | Tiempo de uso (25°C): 20 min | Secado: 45-60 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 400 °C | Compresión: 400 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: MUY BUENA | Trabaja bajo agua: NO | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: NO RECOMENDADO | Reconstruir: NO RECOMENDADO | Anclaje químico: NO RECOMENDADO
  Componentes del kit: 2 PALETAS DE MEZCLADO
  Sectores: DECORACION, MANUALIDADES, CUADROS, ARTESANIAS, MODELISMO, ARTE EN EPOXY, MADERAS, COCINAS, TABLEROS, ANUNCIAS, PISOS DECORATIVOS, ENCAPSULADOS, RECUBRIMIENTOS, FACIL DE PIGMENTAR, SISTEMA PURO, LIBRE DE SOLVENTE, ALTO BRILLO, NO SE AMARILLEA AL PASO DEL TIEMPO EN INTERIORES
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Transparente 50 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 2 horas con una resistencia que no te va a dejar a medias. …

• SKU: UNOM50 — EPOXY UNO USO GENERAL MARINE
  Contenido: 50 (CAJA) | Color de mezcla: AZUL | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 600 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA

• SKU: UNOM98 — Epoxy UNO Azul Marine Sumergible 100 g
  Contenido: 100 (CAJA) | Color de mezcla: AZUL | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 600 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Azul Marine Sumergible 100 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOIG98 — Epoxy UNO Industrial Gel 100ml.
  Contenido: 100ml. (CAJA) | Color de mezcla: BEIGE | Consistencia: CREMA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 400 °C | Compresión: 400 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: MUY BUENA | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Beige Industrial 100ml. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOCO98 — Epoxy UNO Cobre 100ml.
  Contenido: 100ml. (CAJA) | Color de mezcla: COBRE | Consistencia: CREMA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 400 °C | Compresión: 400 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: MUY BUENA | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Cobre 100ml. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOAL98 — Epoxy UNO Aluminio 100ml.
  Contenido: 100ml. (CAJA) | Color de mezcla: ALUMINIO | Consistencia: CREMA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 400 °C | Compresión: 400 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: MUY BUENA | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Componentes del kit: 2 PALETAS DE MEZCLADO · 1 MALLA DE REFUERZO · 1 LIJA
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Aluminio 100ml. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNON1000 — EPOXY UNO USO INDUSTRIAL NEGRO
  Contenido: 1 kg. (CAJA) | Color de mezcla: NEGRO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO

• SKU: UNOA1000 — Epoxy UNO Acero Industrial 1 kg.
  Contenido: 1 kg. (CAJA) | Color de mezcla: ACERO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Acero Industrial 1 kg. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOM1000 — Epoxy UNO MARINE Industrial 1 kg.
  Contenido: 1 kg. (CAJA) | Color de mezcla: AZUL | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 600 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: MUY BUENO | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: MUY BUENO
  Descripción: En Pégalo en Línea te traemos el Epoxy UNO Azul Industrial 1 kg. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 45 minutos con una resistencia que no te va a dejar a medias. …

• SKU: UNOAUT1000 — EPOXY UNO USO UTOMOTRIZ
  Contenido: 1 kg. (CAJA) | Color de mezcla: NEGRO | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI

• PRODUCTO: EPOXY UNO CONCRETO
  Contenido: 1 kg. (CAJA) | Color de mezcla: GRIS | Consistencia: PASTA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 12 min | Secado: 30-45 min | Curado total: 24 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 700 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Uso: pasta epóxica de dos componentes para reparar grietas, hoyos y desniveles en concreto, anclaje y reparaciones estructurales. Es el producto recomendado para emparejar el piso ANTES de aplicar el kit de Piso Epóxico Fácil.

• SKU: PL20E10 — Epoxy Plastilina en Barra Separada 10 Min 20 g
  Contenido: 20 (BLISTER) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 15 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Sectores: HOGAR, TALLER, INDUSTRIA, CONSTRUCCION, AUTOMOTRIZ, LINEA BLANCA, REFRIGERACION, NAVAL, AEROESPACIAL, BICICLETAS, PATINES, MODELISMO, ELECTRICO, ELECTRONICO, ARTESANIAS, DECORACION, PISOS, JUNSTAS, PLASTICOS RIGIDOS, MOTOS,CARPINTERIA, TINACOS, TANQUES, RAPIDEZ DE SECADO SOLO 5 MINUTOS.
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Separada 10 Min 20 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 10 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL30E5 — Epoxy Plastilina en Barra Integrada 5 Min 30 g
  Contenido: 30 (BLISTER) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 10 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Integrada 5 Min 30 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL40E10 — Epoxy Plastilina en Barra Separada 10 Min 40 g
  Contenido: 40 (BLISTER) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 15 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Separada 10 Min 40 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 10 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL50E10 — EPOXY SOLDADOR PLASTILINA BARRA SEPARADA 10 MIN
  Contenido: 50 (CAJA) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 15 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO

• SKU: PL60E5 — Epoxy Plastilina en Barra Integrada 5 Min 60 g
  Contenido: 60 (BLISTER) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 3 min | Secado: 10 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Integrada 5 Min 60 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 5 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL70E10 — Epoxy Plastilina en Barra Separada 10 Min 70 g
  Contenido: 70 (CAJA) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 15 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Separada 10 Min 70 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 10 minutos con una resistencia que no te va a dejar a medias. …

• SKU: PL250E10 — Epoxy Plastilina en Barra Separada 10 Min 250 g
  Contenido: 250 (CAJA) | Color de mezcla: GRIZ AZUL | Consistencia: MASILLA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 0 min | Tiempo de uso (25°C): 5 min | Secado: 15 min | Curado total: 3 h
  Adhesividad (unión): 100 KG/CM2 | Temp. máx. de trabajo: 600 °C | Compresión: 800 KG/CM2 (1422 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: BUENO | Recubrir/Sellar: BUENO | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Epoxy Plastilina en Barra Separada 10 Min 250 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 10 minutos con una resistencia que no te va a dejar a medias. …

• SKU: RESCRBL — Resina Epóxica para Arte y Decoración Transparente 60 Minutos 250 g
  Contenido: 250 (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 15-30 min | Secado: 60-90 min | Curado total: 24 h
  Temp. máx. de trabajo: 70 °C
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: NO RECOMENDADO | Reconstruir: NO RECOMENDADO | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Resina Epóxica para Arte y Decoración Transparente 60 Minutos 250 g de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 60 minutos con una resistencia que no te va a dejar a medias. …

• SKU: RESCRUV1 — Resina Epóxica para Arte y Decoración Transparente 60 Minutos 1 lt.
  Contenido: 1 lt. (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 15-30 min | Secado: 60-90 min | Curado total: 24 h
  Temp. máx. de trabajo: 70 °C
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: NO RECOMENDADO | Reconstruir: NO RECOMENDADO | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Resina Epóxica para Arte y Decoración Transparente 60 Minutos 1 lt. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 60 minutos con una resistencia que no te va a dejar a medias. …

• SKU: RESCRN8 — Resina Epóxica para Arte y Decoración Transparente 60 Minutos
  Contenido: 2 gal. (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de mezcla: 3 min | Tiempo de uso (25°C): 15-30 min | Secado: 60-90 min | Curado total: 24 h
  Temp. máx. de trabajo: 70 °C
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: NO RECOMENDADO | Reconstruir: NO RECOMENDADO | Anclaje químico: NO RECOMENDADO
  Descripción: En Pégalo en Línea te traemos el Resina Epóxica para Arte y Decoración Transparente 60 Minutos 2 gal. de Fusion Epoxy, un adhesivo epóxico de dos componentes que seca en 60 minutos con una resistencia que no te va a dejar a medias. …

• SKU: ACT5-US — EPOXY LIQUID CARTRIDGE MIX SUPER FAST 5 MIN 1:1
  Contenido: 50 ml. (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Sectores: CONSTRUCCION, MEMBRANAS, BOQUILLAS, ADHESIVO CONCRETO, ANCLAJE QUIMICO, PERNOS, MINERIA, AUTOMOTRIZ, REPARACION, RECONSTRUCCION, TUBERIA, TANQUES, CORROSION, NAVAL, MARINO, AVIACION, ETC

• SKU: ACA5-US — EPOXY LIQUID CARTUCHO INDUSTRIAL 50 ML MIX SUPER FAST 5 MIN 1:1
  Contenido: 50 ml. (BLISTER) | Color de mezcla: CLEAR | Consistencia: LIQUIDO VISCOSO
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 180 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Descripción: ACT5 CARTUCHOS INDUSTRIALES Es un adhesivo epóxico transparente en cartucho industrial, de secado rápido en 5 minutos. Compatible con pistola de calafateo, permite una aplicación precisa, limpia y profesional en todo tipo de materiales rigidos.

• SKU: ACC5400-US — EPOXY LIQUID CARTUCHO INDUSTRIAL 400 ML MIX SUPER FAST 5 MIN 1:1
  Contenido: 400 ml. (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Descripción: Es un adhesivo epóxico transparente en cartucho industrial de 400 ml, de secado rápido en 5 minutos. Ideal para aplicaciones de alto rendimiento, se aplica con pistola de calafateo para un acabado preciso, limpio y profesional.

• SKU: ACC30400-US — EPOXY CONSTRUCCION E INDUSTRIAL 30 MIN FUERZA MAXIMA 1:1
  Contenido: 400 ml. (CAJA) | Color de mezcla: GRIS | Consistencia: LIQUIDO VISCOSO
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 20 min | Secado: 30 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 300 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Descripción: Es un adhesivo epóxico en cartucho industrial para unir concreto nuevo con viejo y reparaciones estructurales. Seca en 30 minutos y se aplica con pistola de calafateo, garantizando uniones sólidas, duraderas y seguras.

• SKU: ACC5600-US — EPOXY LIQUID CARTUCHO INDUSTRIAL 600 ML MIX SUPER FAST 5 MIN 1:1
  Contenido: 600 ml. (CAJA) | Color de mezcla: CLEAR | Consistencia: LIQUIDA
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 3 min | Secado: 7 min | Curado total: 3 h
  Adhesividad (unión): 150 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 130 KG/CM2 (2133 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Descripción: Es un adhesivo epóxico transparente en cartucho industrial de 600 ml, de secado rápido en 5 minutos. Ideal para aplicaciones de alto rendimiento, se aplica con pistola de calafateo para un acabado preciso, limpio y profesional en todo tipo de materiales.

• SKU: ACC30600-US — EPOXY CONSTRUCCION E INDUSTRIAL 30 MIN 600 ML 1:1
  Contenido: 600 ml. (CAJA) | Color de mezcla: GRIS | Consistencia: LIQUIDO VISCOSO
  Mezcla A+B: 1 a 1 (en peso) | Tiempo de uso (25°C): 20 min | Secado: 30 min | Curado total: 12 h
  Adhesividad (unión): 180 KG/CM2 | Temp. máx. de trabajo: 150 °C | Compresión: 300 KG/CM2 (2560 PSI)
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: SI | Antihongos: SI
  Aplicaciones: Pegar/Adherir: EXCELENTE | Recubrir/Sellar: EXCELENTE | Rellenar: EXCELENTE | Reconstruir: EXCELENTE | Anclaje químico: EXCELENTE
  Descripción: Es un adhesivo epóxico en cartucho industrial 600 ML para unir concreto nuevo con viejo y reparaciones estructurales. Seca en 30 minutos y se aplica con pistola de calafateo, garantizando uniones sólidas, duraderas y seguras.

• SKU: INYCART50 — MIX MIXING INJECTOR 50ML 1:1 6 PIECES ALTO: 11.3 cm

• SKU: INYCART4 — MIX MIXING INJECTOR 400ML 1:1 3 PIECES ALTO: 22.3 cm

• SKU: INYCART6 — APLICADOR PARA CARTUCHO 600 ML 35 CM LARGO
  Descripción: COMPLEMENTO APLICADOR PARA cartucho industrial 600 ML.

• SKU: GUN501:1 — CARTRIDGE APPLICATION GUN 50ML 1:1

• SKU: GUN4001:1 — CARTRIDGE APLPLICATION GUN 400ML 1:1

• SKU: GUN6001:1 — PISTOLA APLICACIÓN CARTUCHO 600 ML 1:1
  Descripción: PISTOLA DE CALAFATEO PARA CARTUCHO COMPLEMENTO cartucho industrial 600 ML.

• SKU: FLOOR-DIY12L — EPOXY FLOOR KIT PISO EPOXICO FACIL DE USO
  Contenido: 1 KIT (CAJA) | Color de mezcla: CLEAR Y GRIS | Consistencia: LIQUIDA
  Acabado: ULTRA BRILLOSO
  Mezcla A+B: 2 a 1 (en peso) | Tiempo de mezcla: 3 min | Secado: 1440 min | Curado total: 48 h
  Temp. máx. de trabajo: 70 °C
  Resistencia a solventes/detergentes/aceites/agua: EXCELENTE | Trabaja bajo agua: NO | Antihongos: SI
  Componentes del kit: 3 GARRAFAS (PRIMARIO 4L + RESINA 4L + ENDURECEDOR 4L) · 2 PALETAS DE MEZCLADO · 2 ESPONJAS DE RODILLO · 1 BOLSA DE HOJUELAS DECORATIVAS (1 KG)


============================================================
--- TIPS GENERALES DE APLICACIÓN ---
============================================================

• Siempre limpiar y desgrasar la superficie antes de aplicar cualquier producto
• Respetar las proporciones de mezcla indicadas en la ficha técnica de cada producto
• Los productos de 5 minutos son ideales para reparaciones rápidas
• Los productos de 30 minutos ofrecen mayor tiempo de trabajo y resistencia máxima
• Las plastilinas son ideales para rellenar y reconstruir piezas
• Los productos STEEL/ACERO son los más resistentes mecánicamente
• Los productos MARINE/SUMERGIBLE son aptos para uso bajo agua
• Los productos transparentes/CRISTAL son ideales cuando se necesita estética
• Los productos de CONSTRUCCIÓN son formulados para anclaje químico y concreto

--- LÍNEAS DE PRODUCTO ---
• Epoxy Líquido: Adhesivos líquidos transparentes de uso general (2-30 min)
• Epoxy Acero: Adhesivos con carga de acero, máxima resistencia mecánica
• EPOXY UNO: Línea profesional de uso general, taller e industria (45 min)
• EPOXY ESPECIALES: Negro, Marine Blue, Cobre, Aluminio, Mármol, Flexible
• EPOXY ART: Resinas decorativas para arte, manualidades y pisos
• PISO EPÓXICO FÁCIL: Kit DIY de recubrimiento epóxico para pisos. Fórmula 2 a 1, acabado ultra brilloso, cero solventes. Rinde 35-40 m² por kit
• PLASTILINAS: Masillas epóxicas para rellenar y reconstruir
• CONSTRUCCIÓN: Cartuchos para anclaje químico industrial

============================================================
--- GUÍA DE APLICACIÓN: PISO EPÓXICO FÁCIL (EPOXY FLOOR) ---
============================================================
Producto: PISO EPÓXICO FÁCIL — Kit de recubrimiento · Fórmula 2 a 1 · Acabado ultra brilloso.
CERO SOLVENTES: no contiene solventes; olor mínimo y manejo seguro. NUNCA se debe diluir.

CONDICIONES ANTES DE EMPEZAR (si alguna no se cumple, NO aplicar, el acabado puede no curar):
• Temperatura ambiente: entre 15 °C y 30 °C. Por debajo de 15 °C el curado se alarga; por encima de 30 °C la vida útil de la mezcla se acorta.
• Humedad: humedad relativa menor a 80 %. El piso debe estar 100 % seco al tacto y en profundidad. Un piso húmedo provoca burbujas y desprendimiento.
• Rendimiento: rinde entre 35 y 40 m² por kit. Puede rendir menos si el piso tiene grietas, hoyos o alta porosidad.
• Tiempo total: 2 días = 48 horas de secado total (24 h tras el primario con hojuelas + 24 h tras la capa selladora).

ESTADO DEL PISO Y ACCIÓN REQUERIDA:
• Concreto nuevo: dejar curar al menos 30 días antes de aplicar el epóxico.
• Concreto agrietado, con hoyos o desnivelado: este kit es para aplicar piso epóxico, NO para reparar. Primero solucionar imperfecciones con EPOXY UNO CONCRETO, dejar secar y aplicar sobre superficie pareja.
• Concreto pintado o sellado: remover la pintura o sellador por completo (lijado o granallado). El epóxico no se adhiere sobre ellos.
• Concreto húmedo: debe estar 100 % seco. Esperar 24 horas adicionales tras lavarlo o si hubo lluvia.

CONTENIDO DEL KIT:
• Parte A · Primario (gris) — 3.8 L
• Parte A · Resina Epóxica (cristal) — 3.8 L (da el acabado brillante)
• Parte B · Endurecedor — 3.8 L (se divide en DOS mitades iguales: la primera con el primario, la segunda con la resina)
• 2 esponjas de rodillo (una para el primario, otra para la capa selladora)
• 2 paletas de mezclado de madera (una por cada mezcla)
• 1 bolsa de hojuelas decorativas (1 kg)
CÓMO MEDIR LA PARTE B: los envases son semitransparentes. Para dividir la Parte B (Endurecedor) en mitades exactas, usar la marca "2 QT" impresa en el galón — ese nivel es justo la mitad. Primera mitad con el primario; segunda con la resina.
¿MÁS HOJUELAS? El kit incluye 1 kg, suficiente para acabado parejo. Para cobertura más densa se venden hojuelas adicionales: sales@fusionepoxy.us o redes @fusionepoxy.

ETAPA 1 · PREPARACIÓN, PRIMARIO Y HOJUELAS
PASO 1 — LIMPIA Y PREPARA LA SUPERFICIE (la adherencia depende 100 % de este paso):
  1. Barrer y aspirar todo el polvo, residuos y partículas sueltas.
  2. Lavar con agua y detergente neutro, eliminando grasa, aceite, pintura suelta y contaminantes.
  3. Reparar grietas, hoyos o desniveles con EPOXY UNO CONCRETO y dejar curar el tiempo de su empaque.
  4. Dejar secar el piso mínimo 24 horas. Debe quedar completamente seco.
  5. Delimitar con cinta masking las zonas que no se quieran cubrir (zócalos, paredes, drenajes, marcos de puerta).
  Nota: caminar solo con calcetines limpios o cubrezapatos sobre el piso ya seco.
PASO 2 — MEZCLA DEL PRIMARIO:
  1. En una cubeta limpia, vaciar el contenido completo de la Parte A · Primario (gris).
  2. Agregar la MITAD de la Parte B · Endurecedor, usando la marca "2 QT" como referencia. Guardar la otra mitad bien tapada para la Etapa 2.
  3. Mezclar con paleta de madera mínimo 3 minutos, raspando fondo y paredes de la cubeta.
  4. La mezcla debe quedar completamente homogénea, sin betas, grumos ni diferencia de color. Dejar reposar 2 minutos para liberar burbujas.
  Nota: una vez mezclado, aplicar de inmediato; no guardar ni reutilizar. Cero solventes, no diluir.
PASO 3 — APLICACIÓN DEL PRIMARIO (de metro en metro):
  1. Empezar por la esquina más lejana a la salida y avanzar siempre hacia la salida.
  2. Trabajar en secciones de aproximadamente 1 m²: aplicar el primario con la esponja de rodillo en capa uniforme y delgada.
  3. De inmediato, sobre ese metro de primario aún fresco, esparcir las hojuelas (ver Paso 4). Luego continuar con la siguiente sección.
  4. Repetir metro a metro —primario y hojuelas— hasta cubrir todo el piso, manteniendo el borde fresco para una unión sin marcas.
PASO 4 — APLICACIÓN DE HOJUELAS DECORATIVAS (sobre primario fresco):
  1. Sobre cada metro de primario recién aplicado, tomar un puñado de hojuelas y lanzarlas hacia arriba y lejos para que caigan planas.
  2. No es necesario ser preciso: la irregularidad genera el efecto natural.
  3. Cantidad: acabado ligero (decorativo). La bolsa de 1 kg alcanza para 35-40 m² de forma pareja.
  4. Avanzar con el primario, sección por sección, hasta terminar todo el piso.
PASO 5 — CURADO DE LA ETAPA 1 (ESPERAR 24 H):
  Tras aplicar primario y hojuelas, esperar 24 horas sin tránsito para que cure. Las hojuelas no adheridas se retiran barriendo o aspirando suavemente. Si hay exceso o algunas sobresalen, pasarlas con espátula metálica en ángulo bajo para retirar el excedente antes de la capa selladora.

REGLA CRÍTICA · MÁXIMO 48 HORAS ENTRE ETAPAS:
Aplicar el acabado brillante (resina) DENTRO de las 48 horas siguientes a la Etapa 1. Pasado ese tiempo, el primario con hojuelas se cura demasiado y la resina ya no se adhiere correctamente; el acabado puede desprenderse. NO dejar pasar más de 48 horas entre una etapa y otra.

ETAPA 2 · CAPA SELLADORA Y ACABADO BRILLOSO
PASO 6 — MEZCLA DE LA RESINA (sella las hojuelas y da el acabado ultra brilloso):
  1. En una cubeta limpia (no la del primario), vaciar la Parte A · Resina Epóxica (cristal).
  2. Agregar la mitad RESTANTE de la Parte B · Endurecedor reservada en la Etapa 1. Usar de nuevo la marca "2 QT".
  3. Mezclar con la segunda paleta durante 3 minutos hasta lograr una mezcla cristalina. Dejar reposar 2 minutos.
  Nota: sin solventes, no diluir la resina.
PASO 7 — APLICACIÓN DE LA CAPA SELLADORA:
  1. Aplicar con la SEGUNDA esponja de rodillo en capa pareja y delgada.
  2. Igual que el primario, trabajar desde el fondo hacia la salida, manteniendo el borde húmedo para evitar marcas.
  3. No sobre-trabajar la superficie: la resina es autonivelante. Las burbujas pequeñas desaparecen solas.
PASO 8 — TU PISO ESTÁ LISTO (ESPERAR 24 H MÁS):
  Esperar 24 horas más tras la capa selladora. Con eso se completan las 48 horas (2 días) de secado total. El piso queda listo para uso normal.

SOLUCIÓN DE PROBLEMAS COMUNES:
• Burbujas o zonas mate: aplicación irregular o sobre-mezclado. Lijar suavemente la zona y aplicar una segunda capa selladora.
• Sigue pegajoso pasado el tiempo: temperatura baja o proporción mal mezclada (Parte B mal medida). Esperar 24 h con buena ventilación; si persiste, retirar y reaplicar.
• Hojuelas o color desigual: hojuelas aplicadas muy tarde o Parte B mal agitada. Solución: capa adicional de primario y hojuelas, o una segunda capa selladora completa para uniformar.
• El acabado no se adhirió: pasaron más de 48 h entre la Etapa 1 y la resina. Respetar siempre la ventana máxima de 48 horas.

ADVERTENCIAS DE SEGURIDAD (producto sin solventes, pero aun así seguir estas precauciones):
• Contiene aminas y resinas epóxicas. Manipular con guantes de nitrilo y lentes de seguridad. Mantener ventilación cruzada. Mantener alejado de niños, mascotas, fuego y fuentes de calor.
• Ojos: enjuagar 15 min con agua y acudir al médico.
• Piel: lavar con agua y jabón.
• Ingestión: NO inducir vómito; acudir a urgencias con el empaque.
• Residuos: no verter en drenaje; desechar según normativa local.

CONTACTO PISO EPÓXICO FÁCIL:
• Ventas / más hojuelas: sales@fusionepoxy.us
• Soporte: help@fusionepoxy.us
• Tel: +52 (55) 5034-9427


============================================================
--- CÓMO FUNCIONAN LOS EPÓXICOS DE DOS COMPONENTES ---
============================================================
• Un epóxico de dos componentes se compone de la Parte A (resina) y la Parte B (endurecedor). Al mezclarlas ocurre una reacción química que endurece el producto. NO seca por evaporación como el pegamento común: cura por reacción, por eso pega tan fuerte y resiste agua, químicos y temperatura.
• La PROPORCIÓN de mezcla (ej. 1 a 1, 2 a 1) es crítica. Si se pone de más o de menos un componente, la pieza puede quedar pegajosa, blanda o no curar bien. Respeta siempre la relación indicada para cada SKU.
• La reacción genera algo de calor (es normal). A mayor cantidad mezclada en un solo punto, más rápido reacciona y menos tiempo de trabajo tienes.
• Una vez mezclado, el producto empieza a endurecer; hay que aplicarlo dentro de su "tiempo de uso". No se puede diluir para "alargarlo".

============================================================
--- CÓMO ELEGIR EL PRODUCTO CORRECTO ---
============================================================
Guía rápida según la necesidad del cliente:
• ¿Reparación rápida? → productos de 2 o 5 minutos (secado veloz, menos tiempo para acomodar la pieza).
• ¿Necesita tiempo para acomodar bien la pieza o pegar áreas grandes? → productos de 30 minutos (más tiempo de trabajo y, por lo general, mayor resistencia final).
• ¿Máxima resistencia mecánica / cargas pesadas? → línea ACERO (con carga metálica).
• ¿Pieza que va bajo agua o húmeda? → revisar que el SKU diga "Trabaja bajo agua: SI".
• ¿Estética / transparencia? → productos con color de mezcla CLEAR (cristal).
• ¿Anclaje en concreto / construcción? → línea CONSTRUCCIÓN / cartuchos de anclaje.
• ¿Reconstruir o rellenar volumen? → plastilinas epóxicas (consistencia masilla).
• ¿Piso decorativo terminado? → PISO EPÓXICO FÁCIL (kit completo, acabado ultra brilloso).
Para recomendar bien, pregunta: qué material va a pegar, si la pieza se mueve o queda fija, si va expuesta a agua/calor/químicos, y cuánto tiempo necesita para trabajar.

============================================================
--- PREPARACIÓN DE SUPERFICIE (EL PASO MÁS IMPORTANTE) ---
============================================================
La adherencia depende casi por completo de la preparación:
• LIMPIAR: la superficie debe estar libre de polvo, grasa, aceite, óxido suelto y residuos. Desengrasar si hace falta.
• LIJAR: dar textura/porosidad con lija mejora muchísimo el anclaje, sobre todo en superficies lisas como vidrio, cerámica o plástico rígido. A más porosidad, mejor agarre.
• SECAR: la superficie debe estar 100 % seca antes de aplicar (la humedad arruina la adherencia).
• AJUSTE: las piezas deben quedar bien ajustadas y, de ser posible, sujetas o prensadas durante el secado para que no se muevan.

============================================================
--- MEZCLA Y APLICACIÓN CORRECTA ---
============================================================
• Mezcla la Parte A y la Parte B en la proporción exacta del producto, hasta lograr un color y textura uniformes (sin betas ni grumos).
• Usa la paleta incluida; raspa fondo y paredes del recipiente para que todo quede bien integrado.
• Aplica una capa delgada y pareja. En epóxicos, "más pegamento" no significa "más fuerte": una capa delgada y bien mezclada pega mejor que un exceso mal mezclado.
• Trabaja dentro del tiempo de uso del producto; si la mezcla empieza a espesar o calentarse, ya no la apliques.
• Retira excedentes antes de que curen. Una vez curado, el epóxico es muy difícil de quitar.

============================================================
--- TIEMPOS: QUÉ SIGNIFICA CADA UNO ---
============================================================
• Tiempo de mezcla: cuánto agitar A+B hasta que quede homogéneo.
• Tiempo de uso (pot life, a 25 °C): ventana para aplicar la mezcla antes de que empiece a endurecer. Con calor se acorta; con frío se alarga.
• Secado: cuando la pieza ya se puede manipular con cuidado (NO es resistencia final).
• Curado total: cuando alcanza su máxima resistencia. No expongas la pieza a esfuerzo, agua o calor antes de completar el curado.
• OJO con "Temp. máx. de trabajo": es la temperatura máxima que soporta la UNIÓN YA CURADA, no la temperatura ambiente para aplicar. La aplicación se recomienda en ambiente templado (ni muy frío ni muy caliente).

============================================================
--- ERRORES COMUNES Y SOLUCIONES ---
============================================================
• Quedó pegajoso / no endureció → proporción mal medida o frío. Solución: respetar la relación de mezcla; curar en ambiente templado y bien ventilado.
• Se despegó → superficie sucia, grasosa, húmeda o no lijada; o se movió la pieza antes de curar. Solución: preparar bien la superficie y sujetar la pieza.
• Burbujas → mezclado muy brusco o capa muy gruesa. Solución: mezclar con calma, dejar reposar unos minutos, aplicar capa delgada.
• No alcanzó su resistencia → se expuso a esfuerzo antes del curado total. Solución: esperar el tiempo de curado completo.

============================================================
--- ALMACENAMIENTO Y VIDA ÚTIL ---
============================================================
• Guardar en lugar fresco, seco, a la sombra y con los envases bien cerrados.
• Mantener lejos de fuentes de calor, fuego y del alcance de niños y mascotas.
• Para el dato exacto de caducidad/vida en anaquel, consultar el empaque o ficha técnica del producto.

============================================================
--- GLOSARIO DE TÉRMINOS ---
============================================================
• Parte A: resina. Parte B: endurecedor (catalizador).
• Relación de mezcla: proporción A:B (en peso) que debe respetarse.
• Pot life / tiempo de uso: ventana para aplicar tras mezclar.
• Curado: reacción química que da la resistencia final.
• Adhesividad / resistencia de unión: cuánto resiste la pegadura a separarse (en KG/CM²).
• Resistencia a la compresión: cuánta carga aguanta sin aplastarse (KG/CM² o PSI).
• Sumergible / trabaja bajo agua: el producto cura y resiste estando en contacto con agua.
• Antihongos: el producto curado resiste la formación de hongos/moho.

============================================================
--- QUÉ MATERIALES PEGA / APLICACIONES ---
============================================================
• Los epóxicos de Fusion Epoxy pegan prácticamente CUALQUIER material RÍGIDO: metal, cerámica, vidrio/cristal, plástico duro (rígido), suelas duras, laterales plásticos, madera, concreto y zonas estructurales que no se doblan constantemente.
• Para mejorar el anclaje se recomienda LIJAR la superficie y así crear porosidad: a mayor porosidad, mejor adherencia.
• No son ideales para materiales flexibles o que se doblan constantemente (telas, hules, plásticos flexibles), porque la pieza se mueve y el epóxico rígido puede desprenderse.
• Aplicaciones típicas: reparar tanques de gasolina, mofles, tuberías de fierro, fisuras en superficies rígidas, piezas de metal y plástico rígido, anclaje, recubrimiento y sellado.
• Resistencia a altas temperaturas: SÍ resisten altas temperaturas; unos productos más que otros según su formulación. Si preguntan por temperatura, confirma que sí resisten y pregunta para qué aplicación lo necesitan para recomendar el producto adecuado.
• REGLA DE ORO de aplicación (para máxima resistencia): limpiar, lijar y secar la superficie (libre de polvo, grasa y humedad), seguir las instrucciones del empaque y respetar el tiempo de curado completo antes de exponer la pieza a esfuerzo o temperatura.

============================================================
--- POLÍTICA DE SEGURIDAD: TOXICIDAD, ALIMENTOS Y AGUA POTABLE ---
============================================================
• Los productos NO son tóxicos una vez curados.
• Por políticas de seguridad y responsabilidad, NO se recomienda su uso en utensilios o superficies en contacto directo con alimentos (ollas, recipientes de cocina), ya que algunas personas podrían presentar sensibilidad o alergia a algún componente de la fórmula.
• TAMPOCO se recomienda su uso en tuberías o reparaciones de PVC que transporten agua potable.
• Para aplicaciones en contacto con agua potable o alimentos, sugerir materiales que cuenten con certificaciones oficiales de grado alimentario o las normativas aplicables.

============================================================
--- PRECIOS Y DISPONIBILIDAD ---
============================================================
• Los precios y la disponibilidad varían según la ubicación, ya que se manejan directamente con el distribuidor autorizado o punto de venta más cercano.
• SIEMPRE pregunta la ciudad y el país del usuario para poder orientarlo correctamente.

============================================================
--- DÓNDE COMPRAR EN MÉXICO ---
============================================================
Para clientes en México, opciones de compra en línea:
• Mercado Libre: https://www.mercadolibre.com.mx/pagina/pegaloenlinea
• Pega en Línea: https://pegaloenlinea.com/
• Amazon México: https://www.amazon.com.mx/s?me=AB022F0D741SO&marketplaceID=A1AM78C64UM0Y8
Además hay una red de ferreterías distribuidoras a nivel nacional que varía por estado. El usuario también puede preguntar en su ferretería de confianza; si aún no tienen Fusion Epoxy, puede mandar la ubicación de la ferretería para recomendarles el producto.

============================================================
--- DISTRIBUIDORES INTERNACIONALES ---
============================================================
Fusion Epoxy es una empresa mexicana de adhesivos epóxicos con presencia en más de 20 países. Pregunta SIEMPRE la ciudad y el país antes de dar información de distribuidor. Recuerda: si dicen "La Paz", confirma si es Bolivia o Baja California Sur (México).

Distribuidor autorizado por país:
• Argentina: TRESGE ARGENTINA
• Bolivia: TORIMPOR — Tel: +591 6260 6041 | torres.torimpor@gmail.com
• Chile: GEVEMAC
• Colombia: IMPORTADORA BALUARTE — Tel: 314 443 8742 | ventas@importbaluarte.com
• Costa Rica: IMPAFESA — Tel: +506 6346 6408 | mercadeo@impafesa.com
• Ecuador: FERRI LOPEZ — Tel: 099 195 4937 (venta al consumidor en línea)
• El Salvador: GRUPO ROMENA
• España: COM. PROD. GLOBALES S.L.
• Guatemala: SUVG CORPORACIÓN
• Honduras: ALUSA
• Nicaragua: 3GE DE NICARAGUA
• Panamá: MAYOREO FERRETERO SA
• Paraguay: ELECTROMIX
• Perú: HACSA
• Puerto Rico: NIDO GROUP
• Uruguay: SDR IMPORTACIONES
• Venezuela: FUSION EPOXY VENEZUELA — Tel: +58 414-421 5520 | globalagecorporation@gmail.com
• México (Baja California Sur): GRUPO ÑUU CAVA
Si el país del usuario no está en la lista, pídele su ciudad y país para indicarle el punto de venta más cercano.

============================================================
--- PARA SER DISTRIBUIDOR ---
============================================================
Si alguien quiere ser distribuidor de Fusion Epoxy, puede escribir según su región:
• Ventas LATAM: ventas@fusionepoxy.us
• Ventas US: sales@fusionepoxy.us
• Ventas Europa: euventas@fusionepoxy.us

--- CONTACTO ---
• Sitio web: www.fusionepoxy.com
• Instagram: @fusionepoxy_
• Facebook: /fusionepoxyoficial
• TikTok: @fusionepoxy_
• LinkedIn: /company/fusionepoxy

`;

// ─── SYSTEM PROMPT ───
const SYSTEM_PROMPT = `Eres "Mr. Epoxy", el asistente virtual oficial de Fusion Epoxy.

PERSONALIDAD:
- Amigable, cálido, profesional y entusiasta sobre productos epóxicos
- Respondes en el idioma indicado en la sección "IDIOMA DE RESPUESTA" más abajo
- Tuteas al usuario de forma amigable
- Usas analogías simples para explicar conceptos técnicos
- Eres conciso pero completo en tus respuestas
- Tienes sentido del humor ligero y eres conversacional

COMPORTAMIENTO CON SALUDOS:
- Si el usuario te saluda ("hola", "buen día", "cómo estás", "buenas tardes", etc.), responde de forma cálida y profesional. Por ejemplo: "¡Muy bien, gracias por preguntar! 😊 Estoy listo para ayudarte. ¿Te recomiendo algún producto, te ayudo con una aplicación o tienes alguna duda técnica?"
- NUNCA rechaces un saludo como si fuera una pregunta fuera de tema. Los saludos son parte natural de la conversación.

TONO Y CIERRE:
- Inicia de forma cálida (un "¡Hola!" y un emoji están bien) y agradece el interés en los productos.
- Cierra de forma amable con frases como "Quedamos atentos" o "Aquí estamos para apoyarte".
- Cuando el cliente quede satisfecho o comparta una buena experiencia, agradécele, invítalo a seguir a Fusion Epoxy en redes sociales y cierra con el tagline: "¡La pura química! 🧪💪".
- No abuses de los emojis ni del tagline; úsalos con naturalidad, no en cada mensaje.

NOMBRES DE PRODUCTO:
- El producto para reparar grietas, hoyos o desniveles en concreto se llama SIEMPRE "EPOXY UNO CONCRETO". Nunca lo llames "Epoxy Uno Construcción" ni menciones ningún código o SKU de este producto: solo di "EPOXY UNO CONCRETO".

VENTAS, PRECIOS Y DISTRIBUIDORES:
- Los precios y la disponibilidad varían según la ubicación. ANTES de dar información de compra, precio o distribuidor, pregunta SIEMPRE al usuario su CIUDAD y PAÍS.
- Si el usuario menciona "La Paz", confirma si se refiere a La Paz, Bolivia, o a La Paz, Baja California Sur (México), porque el distribuidor cambia.
- Como esta es una conversación privada (chat 1 a 1), SÍ puedes compartir los datos de contacto del distribuidor correspondiente una vez que sepas el país.
- Si el país del usuario no está en la lista de distribuidores, pídele su ciudad y país e indícale que lo conectarás con el punto de venta más cercano o que escriba al correo de ventas de su región.

MANEJO DE DUDAS Y COMENTARIOS NEGATIVOS:
- Si alguien dice que el producto "no sirve" o "no funcionó", defiende el producto con seguridad y de forma amable: los adhesivos están diseñados y probados para alta resistencia.
- Explica que casi siempre la falla viene de no seguir el proceso de aplicación: limpiar, lijar y secar la superficie (libre de grasa), seguir las instrucciones del empaque y respetar el tiempo de curado completo antes de exponer la pieza a esfuerzo o temperatura. Invita a intentarlo de nuevo siguiendo estos pasos.

REGLAS ESTRICTAS:
1. SOLO respondes preguntas relacionadas con Fusion Epoxy, adhesivos epóxicos, pisos epóxicos, recubrimientos, y temas directamente relacionados.
2. Si el usuario pregunta algo NO relacionado (como recetas, deportes, política, etc.), responde amablemente: "¡Esa es una buena pregunta! Pero yo soy experto solo en productos Fusion Epoxy 😊. ¿Hay algo sobre nuestros adhesivos, pisos epóxicos o recubrimientos en lo que pueda ayudarte?"
3. NUNCA inventes información técnica. Si no tienes el dato, di: "No tengo ese dato exacto. Te recomiendo contactar a nuestro equipo de ventas."
4. Siempre recomienda seguir las instrucciones de la ficha técnica.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE}

FORMATO Y LONGITUD:
- Sé BREVE y ve al grano. Responde en 1-2 párrafos cortos como máximo (idealmente 2-5 frases). No te extiendas de más.
- Da la respuesta directa primero; agrega detalles solo si son indispensables. Evita repetir información o rellenar.
- Para pasos o enumeraciones, usa una lista corta en vez de párrafos largos.
- Usa **negritas** solo para los datos clave (nombre de producto, dato importante).
- Si el tema es amplio, da lo esencial y ofrece ampliar ("¿Quieres que te explique el paso a paso?") en vez de soltar todo de golpe.`;

// ─── RATE LIMITING EN MEMORIA ───
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 30;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip).filter(t => now - t < windowMs);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return timestamps.length <= maxRequests;
}

// ─── CONVERTIR FORMATO: frontend → Gemini ───
// Frontend manda: [{ role: "user"|"assistant", content: "texto" }]
// Gemini espera:  [{ role: "user"|"model", parts: [{ text: "texto" }] }]
function convertMessages(messages) {
  return messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
}

// ─── HANDLER (formato Web estándar de Vercel) ───
export default {
  async fetch(req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  // En Vercel la IP llega en los headers (no hay context.ip como en Netlify)
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Demasiadas solicitudes. Intenta en unos minutos." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return Response.json({ error: "Falta el campo messages" }, { status: 400 });
    }

    const geminiContents = convertMessages(body.messages);

    // ─── Idioma de respuesta ───
    const langCode = LANGS[body.lang] ? body.lang : "es";
    const langName = LANGS[langCode];
    const langDirective = `

=== IDIOMA DE RESPUESTA ===
Responde SIEMPRE en ${langName}, sin importar en qué idioma escriba el usuario.
TODA tu respuesta —incluidos saludos, recomendaciones y mensajes de cortesía— debe estar en ${langName}.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    // Hace una llamada a Gemini con el presupuesto indicado y devuelve el JSON.
    async function callGemini(thinkingBudget, maxOutputTokens) {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT + langDirective }]
          },
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens,
            // 0.8 = equilibrado: respuestas naturales y con algo de variedad,
            // pero sin tanta libertad como para inventar datos técnicos.
            temperature: 0.8,
            thinkingConfig: { thinkingBudget },
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          ]
        }),
      });
      return resp.json();
    }

    const getText = (d) => d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const getFinish = (d) => d?.candidates?.[0]?.finishReason;

    // 1er intento: sin razonamiento (más rápido) y respuesta breve.
    let data = await callGemini(0, 3072);

    // Red de seguridad: si se quedó sin tokens o no devolvió texto (y NO fue un
    // bloqueo de seguridad), reintenta SIN razonamiento y con más espacio, para que
    // todo el presupuesto vaya a la respuesta. Así el usuario nunca ve el error por tokens.
    if (!getText(data) && getFinish(data) !== "SAFETY") {
      console.warn("Reintentando sin thinking. finishReason:", getFinish(data));
      data = await callGemini(0, 4096);
    }

    // Respuesta exitosa
    const replyText = getText(data);
    if (replyText) {
      return Response.json({
        content: [{ type: "text", text: replyText }]
      });
    }

    // Bloqueado por safety
    if (getFinish(data) === "SAFETY") {
      return Response.json({
        content: [{ type: "text", text: msg("blocked", langCode) }]
      });
    }

    // Error
    console.error("Gemini response:", JSON.stringify(data));
    return Response.json({
      content: [{ type: "text", text: msg("generic", langCode) }]
    });

  } catch (err) {
    console.error("Error:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
  },
};
