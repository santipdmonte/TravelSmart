# Dashboard Skeleton Loader

Este directorio contiene el skeleton loader para el dashboard que mantiene la misma estructura visual que el dashboard real.

## Componentes

### `DashboardSkeleton.tsx`
Skeleton loader principal que replica exactamente la estructura del dashboard:

- **Header**: Título y botón de crear itinerario
- **Bento Grid Row 1**: 
  - Card de perfil de usuario (izquierda)
  - Card de tipo de viajero (izquierda, segunda fila)
  - Card del mapa (derecha, ocupa 2 filas)
- **Bento Grid Row 2**:
  - Lista de itinerarios recientes (izquierda, 2 columnas)
  - Acciones rápidas (derecha, 1 columna)

### `DashboardSkeletonExample.tsx`
Componente de ejemplo que muestra cómo integrar el skeleton loader con el dashboard real.

## Uso

```tsx
import { DashboardSkeleton } from "@/components";

// Mostrar skeleton mientras carga
if (isLoading) {
  return <DashboardSkeleton />;
}

// Mostrar dashboard real cuando termine de cargar
return <DashboardPage />;
```

## Características

- ✅ Mantiene la misma estructura visual que el dashboard real
- ✅ Usa componentes de Shadcn UI (Skeleton, Card, etc.)
- ✅ Responsive design (mobile y desktop)
- ✅ Animaciones suaves de skeleton
- ✅ Colores y espaciado consistentes con el diseño original

## Estructura del Skeleton

```
DashboardSkeleton
├── Header (título + botón)
├── Bento Grid Row 1
│   ├── User Profile Card (izquierda)
│   ├── Traveler Type Card (izquierda, fila 2)
│   └── Map Card (derecha, 2 filas)
└── Bento Grid Row 2
    ├── Recent Itineraries (izquierda, 2 cols)
    └── Quick Actions (derecha, 1 col)
```

## Personalización

El skeleton se puede personalizar modificando:
- Tamaños de los elementos Skeleton
- Colores (usando clases de Tailwind)
- Espaciado y padding
- Animaciones (usando clases de Tailwind)
