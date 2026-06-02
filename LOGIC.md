# RapidCalc - Arquitectura y Lógica

## Visión General

RapidCalc es una calculadora de escritorio construida con **Tauri (Rust + Svelte)**. El frontend en Svelte se comunica con el backend en Rust a través de comandos IPC de Tauri.

```
┌─────────────────┐     IPC (invoke)     ┌─────────────────┐
│   Frontend      │ ←──────────────────→ │   Backend       │
│   (Svelte)      │                      │   (Rust)        │
│                 │                      │                 │
│ - UI Components │                      │ - math.rs      │
│ - Engine Logic  │                      │ - converter.rs │
│ - API Layer     │                      │ - programmer.rs│
└─────────────────┘                      │ - history.rs   │
                                         │ - SQLite DB    │
                                         └─────────────────┘
```

---

## Flujo de Datos

### 1. Calculadora Estándar/Científica

```
Usuario presiona "2" + "3" + "="
       ↓
engine.press("2")      → expression = "2"
engine.press("3")      → expression = "23"
engine.press("=")      → calculate()
       ↓
api.evaluate("23")     → invoke("evaluate", {expression: "23"})
       ↓
┌─────────────────────────────┐
│      BACKEND (Rust)         │
│                             │
│  math.rs                    │
│  ├─ normalize("23")         │
│  ├─ Expr::from_str("23")   │
│  └─ eval() → 23.0          │
│                             │
│  return {                   │
│    result: "23",            │
│    formatted: "23",         │
│    is_error: false          │
│  }                          │
└─────────────────────────────┘
       ↓
history.rs (SQLite)
├─ INSERT INTO history VALUES ('23', '23', timestamp)
└─ return HistoryEntry { id, expression, result, timestamp }
       ↓
Frontend actualiza display = "23"
```

### 2. Conversor de Unidades

```
Usuario selecciona: 100 Metros → Kilómetros
       ↓
converter.setCategory("Longitud")
converter.setValue("100")
converter.convert()
       ↓
api.convertUnit(100, "Longitud", "Metros", "Kilómetros")
       ↓
┌─────────────────────────────┐
│      BACKEND (Rust)         │
│                             │
│  converter.rs               │
│  ├─ busca categoría "Longitud"│
│  ├─ factor Metros = 1.0     │
│  ├─ factor Kilómetros = 1000│
│  └─ 100 * 1.0 / 1000 = 0.1 │
│                             │
│  return {                   │
│    result: "0.1",            │
│    from_unit: "Metros",     │
│    to_unit: "Kilómetros",   │
│    value: 100               │
│  }                          │
└─────────────────────────────┘
       ↓
Frontend muestra resultado = "0.1"
```

### 3. Modo Programador

```
Usuario escribe "FF" en HEX
       ↓
programmer.press("F")
programmer.press("F")
programmer.updateConversions()
       ↓
api.convertBase("FF", "HEX")
       ↓
┌─────────────────────────────┐
│      BACKEND (Rust)         │
│                             │
│  programmer.rs              │
│  ├─ parseInt("FF", 16) = 255│
│  ├─ to HEX   → "FF"        │
│  ├─ to DEC   → "255"       │
│  ├─ to OCT   → "377"       │
│  └─ to BIN   → "1111 1111" │
│                             │
│  return {                   │
│    hex: "FF",               │
│    dec: "255",              │
│    oct: "377",              │
│    bin: "1111 1111"         │
│  }                          │
└─────────────────────────────┘
       ↓
Frontend muestra todas las conversiones
```

---

## Estructura de Archivos

### Backend (Rust)

```
src-tauri/src/
├── lib.rs                  # Entry point + Tauri setup
└── calculator/
    ├── mod.rs              # Exports + AppState (SQLite)
    ├── math.rs             # Evaluación de expresiones
    ├── converter.rs        # Conversor de unidades
    ├── programmer.rs       # Conversor de bases
    ├── history.rs          # Persistencia SQLite
    └── commands.rs         # Comandos Tauri
```

### Frontend (Svelte)

```
src/lib/
├── api/
│   └── tauri.ts           # Capa de comunicación IPC
├── logic/
│   ├── engine.svelte.ts   # Motor calculadora
│   ├── converter.svelte.ts# Motor conversor
│   ├── programmer.svelte.ts# Motor programador
│   └── keyboard.svelte.ts # Manejo de teclado
├── components/
│   ├── +page.svelte       # UI principal
│   ├── ConverterView.svelte
│   ├── ProgrammerView.svelte
│   └── ...
└── types/
    └── calculator.ts       # Tipos TypeScript
```

---

## Base de Datos SQLite

### Esquema

```sql
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expression TEXT NOT NULL,
    result TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);

CREATE INDEX idx_history_timestamp ON history(timestamp DESC);
```

### Ubicación
- Linux: `~/.local/share/com.jhonny.calculator-tauri-svelte/rapidcalc.db`
- macOS: `~/Library/Application Support/com.jhonny.calculator-tauri-svelte/rapidcalc.db`
- Windows: `%APPDATA%\com.jhonny.calculator-tauri-svelte\rapidcalc.db`

---

## Comandos Tauri

| Comando | Request | Response |
|---------|---------|----------|
| `evaluate` | `{expression: string}` | `{result, formatted, is_error, error_message}` |
| `convert_unit` | `{value, category, from_unit, to_unit}` | `{result, from_unit, to_unit, value}` |
| `convert_base` | `{value, from_base}` | `{hex, dec, oct, bin, input_base, input_value}` |
| `get_conversion_categories` | `{}` | `[{name, units}, ...]` |
| `add_history` | `{expression, result}` | `{id, expression, result, timestamp}` |
| `get_history` | `{filter?, limit?}` | `[{id, expression, result, timestamp}, ...]` |
| `clear_history` | `{}` | `void` |
| `get_history_stats` | `{}` | `{total_entries, average_expression_length, ...}` |
| `set_floating_mode` | `{enabled: bool}` | `string` |
| `resize_window` | `{width, height}` | `void` |
| `close_window` | `{}` | `void` |
| `register_global_shortcut` | `{}` | `string` |

---

## Détalles de Implementación

### Math Evaluator (Rust)

```rust
// usando crate meval
let expr = Expr::from_str(&normalized)?;
let result = expr.eval()?;

// Funciones soportadas:
// - Básicas: +, -, *, /, ^, %
// - Trigonométricas: sin, cos, tan, asin, acos, atan
// - Otras: sqrt, ln, log, log10, log2, abs, floor, ceil, round, exp
// - Constantes: pi, e
```

### Unit Converter (Rust)

```rust
// Categorías disponibles:
// - Longitud: Metros, Kilómetros, Centímetros, Milímetros, Millas, Yardas, Pies, Pulgadas
// - Peso: Kilogramos, Gramos, Miligramos, Libras, Onzas, Toneladas
// - Temperatura: Celsius, Fahrenheit, Kelvin
// - Volumen: Litros, Mililitros, Galones, Onzas fluidas, Metros³
// - Área: Metros², Kilómetros², Hectáreas, Acres, Pies²
// - Velocidad: m/s, km/h, mph, knots
// - Tiempo: Segundos, Minutos, Horas, Días, Semanas
// - Datos: Bytes, KB, MB, GB, TB, Bits

// Fórmula: valor * factor_from / factor_to
// Excepción: Temperatura usa fórmulas especiales
```

### Programmer Converter (Rust)

```rust
// Bases soportadas:
// - HEX (base 16): 0-9, A-F
// - DEC (base 10): 0-9
// - OCT (base 8): 0-7
// - BIN (base 2): 0-1

// Conversión: parseInt(value, from_radix).to_string(to_radix)
// Binary se formatea con grupos de 4: "1111 1111"
```

---

## Consideraciones de Seguridad

1. **Evaluación matemática**: No se usa `eval()` de JavaScript. Rust procesa la expresión de forma segura.
2. **SQLite**: Las consultas usan prepared statements para prevenir inyección SQL.
3. **Validación**: Todo input del frontend se valida en el backend antes de procesarse.

---

## Rendimiento

- La evaluación en Rust es ~10x más rápida que JavaScript para expresiones complejas.
- SQLite permite búsqueda rápida en el historial (hasta 30,000 entradas).
- El ejecutable final es ~3.9MB (deb/rpm).