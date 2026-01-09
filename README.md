# Seguimiento de Estudiantes - Visor de Calificaciones

Sistema de seguimiento de estudiantes para mentores del Tecnológico de Monterrey, desarrollado en Angular siguiendo el Bamboo Design System.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Servicios](#servicios)
- [Modelos](#modelos)
- [Flujo de Datos](#flujo-de-datos)
- [Estilos y Design System](#estilos-y-design-system)
- [Instalación](#instalación)
- [Uso](#uso)
- [Reglas de Negocio](#reglas-de-negocio)
- [Dependencias](#dependencias)
- [Changelog](#changelog)

---

## Descripción

Este módulo permite a los mentores:
- Visualizar sus grupos de mentoría asignados
- Buscar estudiantes por matrícula, nombre o apellidos
- Ver resultados paginados de búsqueda
- Expandir/contraer la vista para mejor visualización

---

## Arquitectura

```
src/app/
├── components/
│   ├── tarjeta-seguimiento/        # Componente principal (contenedor)
│   ├── buscador-estudiantes/       # Formulario de búsqueda
│   └── resultados-busqueda/        # Lista de resultados con paginación
├── services/
│   └── estudiantes.service.ts      # Lógica de negocio y datos
├── models/
│   └── estudiante.model.ts         # Interfaces y tipos
└── app.component.*                 # Componente raíz
```

---

## Componentes

### 1. TarjetaSeguimientoComponent (Componente Principal)

**Ubicación:** `src/app/components/tarjeta-seguimiento/`

**Archivos:**
- `tarjeta-seguimiento.component.ts`
- `tarjeta-seguimiento.component.html`
- `tarjeta-seguimiento.component.scss`

**Responsabilidades:**
- Contenedor principal de la funcionalidad
- Maneja estados: vista colapsada y expandida
- Coordina comunicación entre componentes hijos
- Muestra grupos de mentoría o resultados de búsqueda

**Estados:**
| Estado | Descripción |
|--------|-------------|
| `expandida = false` | Vista colapsada (560px) - Muestra botón "Realizar búsqueda" y grupos |
| `expandida = true` | Vista expandida (1160px) - Muestra buscador y resultados |

**Inputs/Outputs:** Ninguno (componente raíz del módulo)

**Métodos principales:**
```typescript
expandir(): void              // Cambia a vista expandida
contraer(): void              // Vuelve a vista colapsada
realizarBusqueda(criterios)   // Ejecuta búsqueda con criterios
limpiarBusqueda(): void       // Limpia resultados y muestra grupos
abrirEstudiante(estudiante)   // Maneja selección de estudiante
```

---

### 2. BuscadorEstudiantesComponent

**Ubicación:** `src/app/components/buscador-estudiantes/`

**Archivos:**
- `buscador-estudiantes.component.ts`
- `buscador-estudiantes.component.html`
- `buscador-estudiantes.component.scss`

**Responsabilidades:**
- Formulario de búsqueda con 4 campos
- Validación de criterios
- Emitir eventos de búsqueda y limpieza

**Campos de búsqueda:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Matrícula | text | Búsqueda exacta (ej: A00835741) |
| Nombre(s) | text | Búsqueda parcial, ignora acentos |
| Apellido Paterno | text | Búsqueda parcial, ignora acentos |
| Apellido Materno | text | Búsqueda parcial, ignora acentos |

**Outputs:**
```typescript
@Output() buscar = new EventEmitter<CriteriosBusqueda>();
@Output() limpiar = new EventEmitter<void>();
```

**Uso en template padre:**
```html
<app-buscador-estudiantes
  (buscar)="realizarBusqueda($event)"
  (limpiar)="limpiarBusqueda()">
</app-buscador-estudiantes>
```

---

### 3. ResultadosBusquedaComponent

**Ubicación:** `src/app/components/resultados-busqueda/`

**Archivos:**
- `resultados-busqueda.component.ts`
- `resultados-busqueda.component.html`
- `resultados-busqueda.component.scss`

**Responsabilidades:**
- Mostrar lista de estudiantes encontrados
- Paginación de resultados (10 por página)
- Manejar selección de estudiante
- Mostrar mensaje "No se encontraron resultados"

**Inputs:**
```typescript
@Input() estudiantes: Estudiante[] = [];
@Input() busquedaRealizada = false;
```

**Outputs:**
```typescript
@Output() estudianteSeleccionado = new EventEmitter<Estudiante>();
@Output() volver = new EventEmitter<void>();
```

**Paginación:**
```typescript
readonly resultadosPorPagina = 10;
paginaActual = 1;

// Getters calculados
get totalPaginas(): number
get estudiantesPaginados(): Estudiante[]
get indiceInicio(): number
get indiceFin(): number
```

**Uso en template padre:**
```html
<app-resultados-busqueda
  [estudiantes]="estudiantesEncontrados"
  [busquedaRealizada]="busquedaRealizada"
  (estudianteSeleccionado)="abrirEstudiante($event)"
  (volver)="limpiarBusqueda()">
</app-resultados-busqueda>
```

---

## Servicios

### EstudiantesService

**Ubicación:** `src/app/services/estudiantes.service.ts`

**Responsabilidades:**
- Proveer datos de estudiantes (mock, después API)
- Proveer grupos de mentoría
- Lógica de búsqueda con normalización de texto

**Métodos públicos:**
```typescript
obtenerGruposMentoria(): GrupoMentoria[]
buscarEstudiantes(criterios: CriteriosBusqueda): Estudiante[]
obtenerEstudiantesPorGrupo(grupoId: number): Estudiante[]
```

**Normalización de texto:**
```typescript
private normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '');
}
```
> Permite buscar "calderon" y encontrar "Calderón"

**Datos mock:** 100 estudiantes con nombres/apellidos repetidos para pruebas.

---

## Modelos

**Ubicación:** `src/app/models/estudiante.model.ts`

```typescript
export interface Estudiante {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
}

export interface GrupoMentoria {
  id: number;
  nombre: string;
  clave: string;
  periodo: string;
}

export interface CriteriosBusqueda {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    AppComponent                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           TarjetaSeguimientoComponent               │    │
│  │                                                      │    │
│  │  ┌──────────────────┐    ┌───────────────────────┐  │    │
│  │  │    Buscador      │    │     Resultados        │  │    │
│  │  │   Estudiantes    │    │      Búsqueda         │  │    │
│  │  │                  │    │                       │  │    │
│  │  │  (buscar)────────┼────┼──►[estudiantes]       │  │    │
│  │  │  (limpiar)───────┼────┼──►[busquedaRealizada] │  │    │
│  │  │                  │    │                       │  │    │
│  │  │                  │    │  (estudianteSelec)────┼──┼────┼──► Tablero
│  │  │                  │    │  (volver)─────────────┼──┼────┘
│  │  └──────────────────┘    └───────────────────────┘  │
│  │              │                      ▲               │
│  │              │    EstudiantesService│               │
│  │              └──────────────────────┘               │
│  └─────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Secuencia de Búsqueda:
1. Usuario ingresa criterios en `BuscadorEstudiantesComponent`
2. Click en "Buscar" emite `(buscar)` con `CriteriosBusqueda`
3. `TarjetaSeguimientoComponent` recibe y llama `EstudiantesService.buscarEstudiantes()`
4. Resultados se pasan a `ResultadosBusquedaComponent` via `[estudiantes]`
5. Usuario ve lista paginada, puede seleccionar estudiante
6. Click en estudiante emite `(estudianteSeleccionado)` al padre

---

## Estilos y Design System

### Bamboo Design System - Variables de Color

```scss
// Contenedores
$containers-main: #313649;
$containers-background: #1F222E;
$container-outline: #373F55;

// Contrastes
$contrasts-25: #3D4866;
$contrasts-50: #617196;
$contrasts-75: #D3D7E4;
$contrasts-100: #F6F7F9;

// Acentos
$accent-blue: #2766CB;
$accent-blue-hover: #3175E0;
```

### Iconografía

Se utilizan dos fuentes de iconos:

| Tipo | Fuente | Uso |
|------|--------|-----|
| Outlined | `material-symbols-outlined` | Mayoría de iconos (chevrons, arrows) |
| Filled | `material-icons` | Iconos específicos (`info`, `account_circle`) |

**Inclusión en `index.html`:**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
```

### Tipografía

```scss
font-family: 'Poppins', sans-serif;
```

### Dimensiones Principales

| Elemento | Colapsado | Expandido |
|----------|-----------|-----------|
| Tarjeta principal | 560px | 1160px |
| Panel buscador | - | 390px |
| Panel resultados | - | flex: 1 |
| Cards estudiante | - | padding: 12px 16px |
| Border radius cards | 16px | 16px |

---

## Instalación

```bash
# Clonar repositorio
git clone [url-repositorio]

# Instalar dependencias
cd seguimiento-estudiantes
npm install

# Ejecutar en desarrollo
ng serve

# Acceder en navegador
http://localhost:4200
```

---

## Uso

### Vista Colapsada (Inicial)
1. Se muestra la tarjeta con "Realizar búsqueda de estudiante"
2. Lista de "Mis grupos de mentoría"
3. Click en expandir (icono `zoom_in_map`) para abrir vista completa

### Vista Expandida
1. Panel izquierdo: Formulario de búsqueda
2. Panel derecho: Resultados o grupos de mentoría
3. Ingresar criterios y click en "Buscar"
4. Resultados aparecen con paginación (10 por página)
5. Click en estudiante para ver su tablero integral
6. Click en flecha "←" para volver a grupos

### Búsqueda
- **Sin criterios:** Retorna todos los estudiantes
- **Por matrícula:** Coincidencia exacta
- **Por nombre/apellidos:** Coincidencia parcial, ignora acentos y mayúsculas

---

## Reglas de Negocio

| Código | Descripción |
|--------|-------------|
| RN-01 | Mentor debe tener grupos asignados para ver la funcionalidad |
| RN-02 | Búsqueda por matrícula es exacta (case insensitive) |
| RN-03 | Búsqueda por nombre/apellidos es parcial e ignora acentos |
| RN-04 | Se pueden combinar múltiples criterios (AND) |
| RN-05 | Resultados paginados de 10 en 10, ordenados por matrícula |
| RN-06 | Al seleccionar estudiante, se abre su tablero integral |
| RN-07 | Solo grupos del periodo vigente, nivel Prepa, con atributo CTUT |

---

## Dependencias

### Producción
```json
{
  "@angular/core": "^17.x",
  "@angular/common": "^17.x",
  "@angular/forms": "^17.x"
}
```

### Fuentes Externas (CDN)
- Google Fonts: Poppins
- Google Fonts: Material Icons
- Google Fonts: Material Symbols Outlined

### DevDependencies
```json
{
  "@angular/cli": "^17.x",
  "typescript": "~5.x"
}
```

---

## Changelog

### v1.0.0 (2026-01-05)

#### ✨ Features
- Implementación de `TarjetaSeguimientoComponent` con vistas colapsada/expandida
- Implementación de `BuscadorEstudiantesComponent` con 4 campos de búsqueda
- Implementación de `ResultadosBusquedaComponent` con paginación
- Implementación de `EstudiantesService` con datos mock (100 estudiantes)
- Búsqueda con normalización de texto (ignora acentos)
- Paginación de 10 resultados por página
- Mensaje "No se encontraron resultados" con icono

#### 🎨 Estilos
- Integración con Bamboo Design System
- Variables de color según Figma
- Iconografía Material Icons (filled) y Material Symbols (outlined)
- Tipografía Poppins
- Cards con border-radius 16px
- Panel de resultados con scroll y altura fija (480px)
- Transiciones suaves en hover/focus

#### 🏗️ Arquitectura
- Componentes standalone de Angular 17
- Comunicación via @Input/@Output
- Servicio centralizado para lógica de negocio
- Modelos TypeScript tipados

#### 📁 Estructura de Archivos
```
src/app/
├── components/
│   ├── tarjeta-seguimiento/
│   │   ├── tarjeta-seguimiento.component.ts
│   │   ├── tarjeta-seguimiento.component.html
│   │   └── tarjeta-seguimiento.component.scss
│   ├── buscador-estudiantes/
│   │   ├── buscador-estudiantes.component.ts
│   │   ├── buscador-estudiantes.component.html
│   │   └── buscador-estudiantes.component.scss
│   └── resultados-busqueda/
│       ├── resultados-busqueda.component.ts
│       ├── resultados-busqueda.component.html
│       └── resultados-busqueda.component.scss
├── services/
│   └── estudiantes.service.ts
├── models/
│   └── estudiante.model.ts
├── app.component.ts
├── app.component.html
└── app.component.scss
```

---

## Próximos Pasos

- [ ] Conectar con API real de estudiantes
- [ ] Implementar tablero integral del estudiante
- [ ] Agregar loading states durante búsqueda
- [ ] Implementar caché de búsquedas recientes
- [ ] Tests unitarios para componentes y servicio

---
