# Estructura del Proyecto TravelSmart

## Descripción General

TravelSmart es una aplicación web de planificación de viajes construida con **Next.js 15** (App Router), **React 19** y **TypeScript**. La aplicación incluye funcionalidades de autenticación, creación de itinerarios, test de personalidad de viajero, y gestión de usuarios.

## Tecnologías Principales

- **Framework**: Next.js 15.3.4 con Turbopack
- **Lenguaje**: TypeScript 5
- **Estilado**: Tailwind CSS 4
- **UI Components**: Radix UI (componentes headless)
- **Mapas**: Mapbox GL & React Map GL
- **Formularios**: React Hook Form con Zod para validación
- **Animaciones**: GSAP

---

## Estructura de Carpetas

### `/frontend`

Contiene toda la aplicación frontend de Next.js.

#### `/frontend/src/app`

Directorio principal del App Router de Next.js. Define las rutas y páginas de la aplicación.

```
app/
├── layout.tsx              # Layout principal de la aplicación
├── page.tsx                # Página de inicio (/)
├── globals.css             # Estilos globales
├── favicon.ico             # Icono de la aplicación
│
├── admin/                  # Panel de administración
│   └── users/             
│       └── page.tsx        # Gestión de usuarios (/admin/users)
│
├── create/                 # Creación de itinerarios
│   └── page.tsx            # Página de creación (/create)
│
├── dashboard/              # Panel principal del usuario
│   └── page.tsx            # Dashboard (/dashboard)
│
├── itineraries/            # Lista de itinerarios
│   └── page.tsx            # Todos los itinerarios (/itineraries)
│
├── itinerary/              # Detalle de itinerario individual
│   └── [id]/              
│       └── page.tsx        # Vista de itinerario específico (/itinerary/:id)
│
├── login/                  # Autenticación
│   ├── page.tsx            # Página de login (/login)
│   ├── validate/          
│   │   └── page.tsx        # Validación de email (/login/validate)
│   └── google-validate/   
│       └── page.tsx        # Validación de Google OAuth (/login/google-validate)
│
├── profile/                # Perfil de usuario
│   └── page.tsx            # Página de perfil (/profile)
│
├── settings/               # Configuración
│   └── page.tsx            # Ajustes del usuario (/settings)
│
├── traveler-test/          # Test de personalidad de viajero
│   ├── page.tsx            # Test principal (/traveler-test)
│   └── results/           
│       └── [testId]/      
│           └── page.tsx    # Resultados del test (/traveler-test/results/:testId)
│
├── traveler-type/          # Tipo de viajero
│   └── page.tsx            # Página de tipo de viajero (/traveler-type)
│
├── verify-email/           # Verificación de email
│   └── page.tsx            # Página de verificación (/verify-email)
│
└── loader-demo/            # Demo de loader (desarrollo)
    └── page.tsx            # Demo (/loader-demo)
```

#### `/frontend/src/components`

Componentes reutilizables de React organizados por funcionalidad.

```
components/
├── index.ts                    # Exportaciones centralizadas
├── app-sidebar.tsx             # Sidebar de la aplicación
├── Navigation.tsx              # Barra de navegación
├── ErrorMessage.tsx            # Mensajes de error
├── FloatingEditButton.tsx      # Botón flotante de edición
├── LoadingSpinner.tsx          # Spinner de carga
├── MagicBento.tsx              # Grid bento animado
├── Toast.tsx                   # Notificaciones toast
├── TextType.tsx                # Efectos de texto
├── ProfileCard.tsx             # Tarjeta de perfil
├── ProfileCard.css             # Estilos de la tarjeta
│
├── auth/                       # Componentes de autenticación
│   ├── index.ts               
│   ├── AuthModal.tsx           # Modal de autenticación
│   ├── LoginForm.tsx           # Formulario de login
│   ├── RegisterForm.tsx        # Formulario de registro
│   ├── UserMenu.tsx            # Menú de usuario
│   ├── EmailVerificationBanner.tsx      # Banner de verificación
│   ├── EmailVerificationPending.tsx     # Estado pendiente
│   ├── PasswordResetRequestForm.tsx     # Solicitud de reset
│   └── PasswordResetConfirmForm.tsx     # Confirmación de reset
│
├── chat/                       # Sistema de chat/mensajería
│   ├── index.ts               
│   ├── ChatPanel.tsx           # Panel principal del chat
│   ├── Message.tsx             # Componente de mensaje individual
│   ├── MessageList.tsx         # Lista de mensajes
│   ├── MessageInput.tsx        # Input de mensajes
│   └── ConfirmationMessage.tsx # Mensajes de confirmación
│
├── itinerary/                  # Componentes de itinerarios
│   ├── ItineraryMap.tsx        # Mapa de itinerario
│   └── PlainMap.tsx            # Mapa básico
│
├── loader/                     # Componentes de carga
│   └── Loader.tsx              # Loader animado
│
├── traveler-test/              # Test de viajero
│   ├── index.ts               
│   ├── TravelerTestContainer.tsx        # Contenedor principal
│   ├── ClientTravelerTestWelcome.tsx    # Bienvenida (client-side)
│   ├── QuestionCard.tsx        # Tarjeta de pregunta
│   ├── Option.tsx              # Opción de respuesta
│   ├── TestProgressBar.tsx     # Barra de progreso
│   ├── TestResult.tsx          # Resultados del test
│   └── TravelerTestPromptModal.tsx      # Modal de prompt
│
└── ui/                         # Componentes UI base (Radix UI + shadcn/ui)
    ├── index.ts               
    ├── alert.tsx               # Alertas
    ├── avatar.tsx              # Avatares
    ├── badge.tsx               # Badges
    ├── button.tsx              # Botones
    ├── card.tsx                # Tarjetas
    ├── checkbox.tsx            # Checkboxes
    ├── dialog.tsx              # Diálogos/Modales
    ├── dropdown-menu.tsx       # Menús desplegables
    ├── form.tsx                # Componentes de formulario
    ├── input.tsx               # Inputs de texto
    ├── label.tsx               # Labels
    ├── progress.tsx            # Barras de progreso
    ├── separator.tsx           # Separadores
    ├── sheet.tsx               # Sheets (modales laterales)
    ├── sidebar.tsx             # Sidebar
    ├── skeleton.tsx            # Skeletons de carga
    ├── slider.tsx              # Sliders
    ├── tabs.tsx                # Pestañas
    ├── textarea.tsx            # Áreas de texto
    └── tooltip.tsx             # Tooltips
```

#### `/frontend/src/contexts`

Contextos de React para estado global de la aplicación.

```
contexts/
├── AuthContext.tsx         # Estado de autenticación
├── AgentContext.tsx        # Estado del agente conversacional
├── ItineraryContext.tsx    # Estado de itinerarios
└── ToastContext.tsx        # Sistema de notificaciones
```

#### `/frontend/src/hooks`

Custom hooks de React para lógica reutilizable.

```
hooks/
├── useAuth.ts              # Hook de autenticación
├── useChatActions.ts       # Acciones del chat
├── useItineraryActions.ts  # Acciones de itinerarios
└── use-mobile.ts           # Detección de dispositivos móviles
```

#### `/frontend/src/lib`

Bibliotecas y utilidades de la aplicación.

```
lib/
├── api.ts                  # Cliente API base
├── authApi.ts              # API de autenticación
├── agentApi.ts             # API del agente conversacional
├── adminApi.ts             # API de administración
├── accommodationApi.ts     # API de alojamientos
├── travelerTestApi.ts      # API del test de viajero
├── config.ts               # Configuración de la aplicación
├── utils.ts                # Funciones utilitarias
└── validationSchemas.ts    # Esquemas de validación Zod
```

#### `/frontend/src/types`

Definiciones de tipos TypeScript.

```
types/
├── auth.ts                 # Tipos de autenticación
├── agent.ts                # Tipos del agente
├── admin.ts                # Tipos de administración
├── accommodation.ts        # Tipos de alojamientos
├── itinerary.ts            # Tipos de itinerarios
└── travelerTest.ts         # Tipos del test de viajero
```

#### `/frontend/public`

Archivos estáticos servidos públicamente.

```
public/
├── avatars/                # Imágenes de avatares
│   ├── oscar_hero.png
│   ├── oscar_viajero.png
│   ├── oscar_planning.png
│   ├── oscar_mapas.png
│   └── ... (más avatares)
│
├── accommodations-ico/     # Iconos de alojamientos
│   ├── airbnb.avif
│   ├── booking.svg
│   └── expedia.ico
│
├── texture/                # Texturas y fondos
│   ├── grain.webp
│   ├── iconpattern.png
│   └── noisy-background.jpg
│
├── countries_list/         # Datos de países
│   └── countries.json
│
└── *.svg                   # Iconos varios (globe, file, window, etc.)
```

---

## Archivos de Configuración

### Raíz del Proyecto (`/`)

```
├── README.md               # Documentación principal
├── desing.json             # Configuración de diseño
├── travel_*.txt            # Archivos de referencia de viajes
└── docs/                   # Documentación del proyecto
    └── estructura-proyecto.md  # Este archivo
```

### Frontend (`/frontend`)

```
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
├── next.config.ts          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind (implícito)
├── postcss.config.mjs      # Configuración de PostCSS
├── eslint.config.mjs       # Configuración de ESLint
├── components.json         # Configuración de componentes (shadcn/ui)
└── README.md               # README del frontend
```

---

## Patrones de Arquitectura

### Organización de Código

1. **Separación de Responsabilidades**:
   - `app/` - Rutas y páginas (presentación)
   - `components/` - Componentes reutilizables (UI)
   - `contexts/` - Estado global (estado)
   - `hooks/` - Lógica reutilizable (lógica)
   - `lib/` - Servicios y utilidades (servicios)
   - `types/` - Definiciones de tipos (tipos)

2. **Modularización**:
   - Cada módulo de funcionalidad tiene su propia carpeta
   - Archivos `index.ts` para exportaciones centralizadas
   - Componentes agrupados por dominio (auth, chat, itinerary, etc.)

3. **Convenciones de Nomenclatura**:
   - Componentes: PascalCase (ej: `AuthModal.tsx`)
   - Hooks: camelCase con prefijo "use" (ej: `useAuth.ts`)
   - Utilidades: camelCase (ej: `utils.ts`)
   - Tipos: PascalCase para interfaces/types

### Flujo de Datos

```
Usuario → Página (app/) → Componentes (components/) 
                        ↓
                   Hooks (hooks/)
                        ↓
                   API (lib/*Api.ts)
                        ↓
                   Backend API
```

### Estado Global

```
AuthContext → Información del usuario y autenticación
AgentContext → Estado del agente conversacional
ItineraryContext → Itinerarios y datos relacionados
ToastContext → Sistema de notificaciones
```

---

## Rutas de la Aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/login` | Autenticación de usuario |
| `/verify-email` | Verificación de email |
| `/dashboard` | Panel principal del usuario |
| `/create` | Creación de nuevo itinerario |
| `/itineraries` | Lista de todos los itinerarios |
| `/itinerary/:id` | Detalle de itinerario específico |
| `/traveler-test` | Test de personalidad de viajero |
| `/traveler-test/results/:testId` | Resultados del test |
| `/traveler-type` | Información de tipo de viajero |
| `/profile` | Perfil del usuario |
| `/settings` | Configuración del usuario |
| `/admin/users` | Gestión de usuarios (admin) |

---

## Scripts Disponibles

```bash
# Desarrollo con Turbopack
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint

# Verificación de tipos
npm run type-check
```

---

## Próximos Pasos

Para comenzar a trabajar con el proyecto:

1. Instalar dependencias: `cd frontend && npm install`
2. Configurar variables de entorno (si las hay)
3. Iniciar servidor de desarrollo: `npm run dev`
4. Abrir navegador en `http://localhost:3000`

## Notas Adicionales

- La aplicación usa **App Router** de Next.js (no Pages Router)
- Los componentes UI están basados en **Radix UI** con estilado personalizado
- Se usa **Zod** para validación de esquemas
- Los mapas están implementados con **Mapbox GL**
- El proyecto usa **Turbopack** para desarrollo más rápido

