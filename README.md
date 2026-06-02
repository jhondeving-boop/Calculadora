# RapidCalc 🦀 ✨

Calculadora moderna, multiplataforma y de alto rendimiento construida con **Rust (Tauri)** en el backend y **Svelte 5** en el frontend. Diseñada para ser extensible, ligera y visualmente atractiva.

![Versión](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Rust](https://img.shields.io/badge/Rust-2021-orange.svg)
![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.0-24c8db.svg)
![Tests](https://img.shields.io/badge/tests-65%20passed-brightgreen.svg)

## 🚀 Características

- **Calculadora Estándar:** Operaciones básicas (+, -, *, /, %, ^)
- **Modo Científico:** Funciones trigonométricas (sin, cos, tan), logaritmos (ln, log), constantes (π, e)
- **Modo Programador:** Conversiones entre bases (HEX, DEC, OCT, BIN) con visualización de bits
- **Convertidor de Unidades:** Longitud, Peso, Temperatura
- **UI Moderna:** Tema claro/oscuro, diseño responsivo, animaciones fluidas
- **Teclado Físico:** Soporte completo para atajos de teclado
- **Core en Rust:** Lógica segura y rápida con Tauri 2.0

## 📂 Estructura del Proyecto

```
src/
├── routes/
│   └── +page.svelte          # Layout principal de la aplicación
├── lib/
│   ├── components/           # Componentes UI reutilizables
│   │   ├── Sidebar.svelte   # Menú lateral de navegación
│   │   ├── ProgrammerView.svelte  # Vista de modo programador
│   │   ├── ConverterView.svelte    # Vista de convertidor
│   │   ├── SyntaxExpression.svelte # Renderizado de expresiones
│   │   └── Icon.svelte       # Componente de iconos SVG
│   ├── logic/                # Lógica de negocio (Svelte 5 $state)
│   │   ├── engine.svelte.ts      # Motor de cálculo principal
│   │   ├── programmer.svelte.ts  # Lógica de modo programador
│   │   ├── converter.svelte.ts    # Lógica de conversiones
│   │   └── keyboard.svelte.ts    # Manejo de entrada de teclado
│   ├── types/
│   │   └── calculator.ts     # Tipos TypeScript y constantes
│   └── tests/                # Configuración de tests
src-tauri/
├── src/
│   ├── lib.rs              # Punto de entrada Rust (Tauri)
│   └── main.rs             # Entry point desktop
├── Cargo.toml              # Dependencias Rust
└── tauri.conf.json        # Configuración de Tauri
```

## 🛠️ Requisitos Previos

1. **Rust:** [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
2. **Node.js:** [https://nodejs.org/](https://nodejs.org/) (Recomendado v18+)
3. **Dependencias de Tauri:** Consulta la [guía de configuración](https://tauri.app/v1/guides/getting-started/prerequisites)

## 📦 Instalación y Desarrollo

### Instalación en Arch Linux (Producción)
Para compilar e instalar la aplicación de forma global en tu sistema Arch Linux de manera automática, ejecuta:

```bash
chmod +x install.sh
./install.sh
```

El script se encargará de verificar/instalar las dependencias de sistema necesarias (`webkit2gtk-4.1`, `libsoup3`, etc.), compilar la aplicación con optimizaciones máximas para producción, e instalar el binario (`/usr/local/bin/rapidcalc`), el archivo `.desktop` y los iconos en el sistema.

Para desinstalar por completo y dejar el sistema operativo limpio, ejecuta:

```bash
chmod +x uninstall.sh
./uninstall.sh
```

### Desarrollo Manual

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/rapidcalc.git
cd rapidcalc

# Instalar dependencias Node
npm install

# Modo desarrollo (compila Rust + inicia frontend)
npm run tauri:dev

# Build para producción
npm run tauri:build

# Generar AppImage portable (Linux)
npm run tauri:appimage
```

## 🧪 Tests

```bash
# Ejecutar todos los tests
npm run test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Con coverage
npm run test:coverage
```

### Tests Cubiertos

| Módulo | Tests | Cobertura |
|--------|-------|-----------|
| CalculatorEngine | 23 | Operaciones básicas, científica, errores |
| ProgrammerEngine | 24 | Base conversions, validaciones, edge cases |
| ConverterEngine | 18 | Length, Weight, Temperature |

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `0-9` | Números |
| `+`, `-`, `*`, `/` | Operadores |
| `Enter` | Calcular (=) |
| `Backspace` | Borrar último carácter |
| `Escape` | Limpiar todo (AC) |
| `^` | Potencia |
| `%` | Porcentaje |
| **Ctrl + Alt + Z** | **Alternar Modo Zen (PiP)** (Global) |
| **Ctrl + Shift + C** | **Enfocar Calculadora** (Global) |

## 📐 Arquitectura

### Patrones de Diseño

- **Svelte 5 Runes:** Uso de `$state`, `$derived`, `$derived.by` para reactivity
- **Singleton Pattern:** Instancias globales de engines (engine, programmer, converter, keyboard)
- **Separación de Concerns:** Lógica de negocio en `.svelte.ts`, UI en `.svelte`

### Flujo de Datos

```
User Input (Click/Keyboard)
    ↓
KeyboardManager (map key → symbol)
    ↓
CalculatorEngine.press()
    ↓
Mode-specific Logic (engine/programmer/converter)
    ↓
UI Updates ($state reactivity)
```

## 🔧 API / Comandos Tauri

El backend Rust está preparado para recibir comandos IPC:

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn calculate(expression: &str) -> Result<f64, String> {
    // Implementar lógica de cálculo segura en Rust
}
```

## 📝 Documentación de APIs

### CalculatorEngine (`src/lib/logic/engine.svelte.ts`)

```typescript
class CalculatorEngine {
  expression: string    // Expresión actual
  display: string       // Valor a mostrar
  preview: string      // Preview en tiempo real
  error: boolean        // Estado de error
  mode: AppMode         // 'Standard' | 'Scientific' | 'Converter' | 'Programmer'
  
  press(key: string): void  // Procesa entrada
  calculate(): void          // Evalúa expresión
  clear(): void             // Limpia todo
  backspace(): void         // Borra último char
}
```

### ProgrammerEngine (`src/lib/logic/programmer.svelte.ts`)

```typescript
class ProgrammerEngine {
  currentBase: Base      // 'HEX' | 'DEC' | 'OCT' | 'BIN'
  input: string          // Valor actual en base activa
  
  hex: string            // $derived: valor en HEX
  dec: string            // $derived: valor en DEC
  oct: string            // $derived: valor en OCT
  bin: string            // $derived: valor en BIN (grupos de 4 bits)
  
  press(key: string): void
  setBase(base: Base): void
  isKeyAllowed(key: string): boolean
}
```

### ConverterEngine (`src/lib/logic/converter.svelte.ts`)

```typescript
class ConverterEngine {
  category: string       // 'Longitud' | 'Peso' | 'Temperatura'
  fromUnit: string       // Unidad origen
  toUnit: string         // Unidad destino
  value: string          // Valor de entrada
  result: string         // $derived: resultado convertido
  
  setCategory(cat: string): void
  swapUnits(): void
  getAvailableUnits(): string[]
}
```

## 🚀 Agregar Nuevos Modos

1. Definir tipo en `src/lib/types/calculator.ts`:
```typescript
export type AppMode = 'Standard' | 'Scientific' | 'Converter' | 'Programmer' | 'YourMode';
```

2. Crear engine en `src/lib/logic/`:
```typescript
// yourmode.svelte.ts
export class YourModeEngine {
  // ... lógica específica
}
export const yourmode = new YourModeEngine();
```

3. Crear vista en `src/lib/components/`:
```svelte
<!-- YourModeView.svelte -->
<script>
  import { yourmode } from '$lib/logic/yourmode.svelte';
</script>
<!-- ... UI -->
```

4. Agregar al Sidebar y actualizar `+page.svelte`

## 📥 Descargar e Instalar

### Linux
- **.deb** (Ubuntu/Debian): Descarga desde [Releases](https://github.com/jhondeving-boop/rapidcalc/releases)
- **.rpm** (Fedora/RHEL): Descarga desde [Releases](https://github.com/jhondeving-boop/rapidcalc/releases)

### Instalar en Linux
```bash
# Debian/Ubuntu
sudo dpkg -i RapidCalc_0.1.0_amd64.deb

# Fedora/RHEL  
sudo rpm -i RapidCalc-0.1.0-1.x86_64.rpm
```

### Compilar desde código
```bash
git clone https://github.com/jhondeving-boop/rapidcalc.git
cd rapidcalc
npm install
npm run tauri build
```

## 📄 Licencia

**MIT License** - Código abierto y libre de usar.

---

## 🚀 Hyprland (Linux)

Si usas **Hyprland**, la calculadora puede no aparecer en todos los workspaces automáticamente. Ver [HYPRLAND.md](./HYPRLAND.md) para configurar reglas de ventana.

---

Desarrollado con ❤️ usando Rust + Svelte 5 + Tauriadora puede no aparecer en todos los workspaces automáticamente. Ver [HYPRLAND.md](./HYPRLAND.md) para configurar reglas de ventana.

---

Desarrollado con ❤️ usando Rust + Svelte 5 + Tauri