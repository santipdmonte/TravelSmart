# shadcn/ui Migration Guide

## 🚀 Migration Progress

### ✅ Completed Components

#### Buttons (Phase 1)
- [x] **FloatingEditButton** - Converted to use shadcn Button with custom styling
- [x] **MessageInput** - Submit button using shadcn Button
- [x] **ConfirmationMessage** - Confirm/Cancel buttons with appropriate variants
- [x] **Create Page** - Form submit button
- [x] **Landing Page** - CTA buttons with `asChild` pattern
- [x] **Itineraries Page** - All action buttons
- [x] **Itinerary Detail Page** - All action buttons
- [x] **ErrorMessage** - Retry button using link variant

### 🔄 Next Steps (Recommended Order)

#### Form Components (Phase 2)
- [ ] **Input Component** - Replace text/number inputs
- [ ] **Textarea Component** - Replace textarea in MessageInput
- [ ] **Label Component** - Proper form labels
- [ ] **Form Components** - Enhanced form handling

#### Alert Components (Phase 3)
- [ ] **Alert Component** - Replace ErrorMessage component
- [ ] **Alert Variants** - Success, warning, info states

#### Loading Components (Phase 4)
- [ ] **Skeleton Component** - Replace LoadingSpinner
- [ ] **Button Loading States** - Enhanced loading indicators

#### Dialog/Sheet Components (Phase 5)
- [ ] **Sheet Component** - Replace ChatPanel slide-out
- [ ] **Dialog Component** - Modal confirmations

## 📁 File Organization

### Components Structure
```
src/components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx        # ✅ Installed
│   └── index.ts          # ✅ Barrel exports
├── chat/                 # Feature-specific components
├── index.ts              # ✅ Updated with ui exports
└── ...existing components
```

### Import Patterns
```typescript
// ✅ Preferred - Import from main components barrel
import { Button } from '@/components';

// ✅ Alternative - Direct import from ui
import { Button } from '@/components/ui/button';
```

## 🎨 Design System Integration

### Color Scheme
- Primary: Indigo (600/700)
- Success: Green (600/700)
- Destructive: Red (built-in shadcn variant)
- Custom gradients maintained for special buttons

### Button Patterns

#### Standard Buttons
```typescript
// Primary action
<Button className="bg-indigo-600 hover:bg-indigo-700">
  Primary Action
</Button>

// Destructive action
<Button variant="destructive">
  Delete
</Button>

// Link-style button
<Button variant="link">
  View More →
</Button>
```

#### Link Buttons (Next.js)
```typescript
// Using asChild pattern for Next.js Link
<Button asChild>
  <Link href="/page">
    Navigate
  </Link>
</Button>
```

#### Custom Styling
```typescript
// Maintaining custom styles while using shadcn base
<Button 
  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
  size="lg"
>
  Special Button
</Button>
```

## 🛠 Best Practices

### 1. **Consistent Imports**
- Always use barrel exports from `@/components`
- Maintain component organization

### 2. **Variant Usage**
- Use semantic variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Customize with className when needed

### 3. **Size Consistency**
- Use standard sizes: `sm`, `default`, `lg`, `icon`
- Override with custom classes sparingly

### 4. **Accessibility**
- shadcn components include proper ARIA attributes
- Maintain existing aria-label properties

### 5. **Custom Styling**
- Use className for custom colors while keeping shadcn structure
- Preserve existing design tokens (indigo theme)

## 🔧 Installation Commands

```bash
# Install components as needed
npx shadcn@latest add button     # ✅ Done
npx shadcn@latest add input      # Next
npx shadcn@latest add textarea   # Next
npx shadcn@latest add label      # Next
npx shadcn@latest add alert      # Next
npx shadcn@latest add skeleton   # Next
npx shadcn@latest add dialog     # Next
npx shadcn@latest add sheet      # Next
```

## 🎯 Benefits Achieved

1. **Consistency** - Unified button behavior and styling
2. **Accessibility** - Built-in ARIA attributes and keyboard navigation
3. **Maintainability** - Centralized component definitions
4. **Flexibility** - Easy customization while maintaining standards
5. **Future-proofing** - Ready for theme switching and design updates

## 🧪 Testing Notes

- All existing functionality preserved
- Visual consistency maintained
- Custom styling (gradients, shadows) preserved where needed
- Loading states and disabled states working correctly 