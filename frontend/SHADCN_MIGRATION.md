# shadcn/ui Migration Guide

## 🚀 Migration Progress

### ✅ Completed Components

#### Buttons (Phase 1) - ✅ COMPLETE
- [x] **FloatingEditButton** - Converted to use shadcn Button with custom styling
- [x] **MessageInput** - Submit button using shadcn Button
- [x] **ConfirmationMessage** - Confirm/Cancel buttons with appropriate variants
- [x] **Create Page** - Form submit button
- [x] **Landing Page** - CTA buttons with `asChild` pattern
- [x] **Itineraries Page** - All action buttons
- [x] **Itinerary Detail Page** - All action buttons
- [x] **ErrorMessage** - Retry button using link variant

#### Form Components (Phase 2) - ✅ COMPLETE
- [x] **Input Component** - Replaced text/number inputs with shadcn Input
- [x] **Textarea Component** - Enhanced MessageInput with auto-resize
- [x] **Label Component** - Proper form labels with accessibility
- [x] **Form Components** - react-hook-form integration with validation
- [x] **Create Page Form** - Full form refactoring with zod validation

### 🔄 Next Steps (Recommended Order)

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
│   ├── input.tsx         # ✅ Installed  
│   ├── textarea.tsx      # ✅ Installed
│   ├── label.tsx         # ✅ Installed
│   ├── form.tsx          # ✅ Installed
│   └── index.ts          # ✅ Updated with all exports
├── chat/                 # Feature-specific components
├── index.ts              # ✅ Updated with ui exports
└── ...existing components
```

### Import Patterns
```typescript
// ✅ Preferred - Import from main components barrel
import { Button, Input, Textarea, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components';

// ✅ Alternative - Direct import from ui
import { Input } from '@/components/ui/input';
```

## 🎨 Design System Integration

### Color Scheme
- Primary: Indigo (600/700)
- Success: Green (600/700)
- Destructive: Red (built-in shadcn variant)
- Custom gradients maintained for special buttons

### Form Patterns

#### Enhanced Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  field: z.string().min(1, 'Required'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { field: '' },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="field"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Helper text</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

#### Auto-resize Textarea
```typescript
const textareaRef = useRef<HTMLTextAreaElement>(null);

const adjustHeight = () => {
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }
};

<Textarea
  ref={textareaRef}
  onInput={adjustHeight}
  className="min-h-[38px] max-h-[120px]"
/>
```

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

### 2. **Form Validation**
- Use zod schemas for type-safe validation
- Combine with react-hook-form for optimal UX
- Provide clear error messages and descriptions

### 3. **Variant Usage**
- Use semantic variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Customize with className when needed

### 4. **Size Consistency**
- Use standard sizes: `sm`, `default`, `lg`, `icon`
- Override with custom classes sparingly

### 5. **Accessibility**
- shadcn components include proper ARIA attributes
- FormLabel automatically associates with form controls
- FormMessage provides proper error announcements

### 6. **Custom Styling**
- Use className for custom colors while keeping shadcn structure
- Preserve existing design tokens (indigo theme)

## 🔧 Installation Commands

```bash
# Install components as needed
npx shadcn@latest add button     # ✅ Done
npx shadcn@latest add input      # ✅ Done
npx shadcn@latest add textarea   # ✅ Done
npx shadcn@latest add label      # ✅ Done
npx shadcn@latest add form       # ✅ Done
npx shadcn@latest add alert      # Next
npx shadcn@latest add skeleton   # Next
npx shadcn@latest add dialog     # Next
npx shadcn@latest add sheet      # Next

# Additional dependencies
npm install react-hook-form @hookform/resolvers zod  # ✅ Done
```

## 🎯 Benefits Achieved

### Phase 1 & 2 Benefits:
1. **Consistency** - Unified button and form component behavior
2. **Accessibility** - Built-in ARIA attributes and keyboard navigation
3. **Maintainability** - Centralized component definitions
4. **Flexibility** - Easy customization while maintaining standards
5. **Type Safety** - Zod schema validation with TypeScript integration
6. **Better UX** - Real-time validation, auto-resize textareas, proper error handling
7. **Future-proofing** - Ready for theme switching and design updates

## 🧪 Testing Notes

### Buttons (Phase 1)
- All existing functionality preserved
- Visual consistency maintained
- Custom styling (gradients, shadows) preserved where needed
- Loading states and disabled states working correctly

### Forms (Phase 2)
- Enhanced validation with immediate feedback
- Auto-resize textarea functionality maintained
- Proper error states and messages
- Accessibility improvements with proper labeling
- Type-safe form handling with react-hook-form + zod

## 📝 Form Validation Features

### Create Page Form:
- **Real-time validation** - Errors shown as user types
- **Smart error clearing** - Server errors clear when user makes changes
- **Proper constraints** - Trip name (2-100 chars), Duration (1-30 days)
- **Enhanced UX** - Larger inputs, helpful descriptions, visual feedback
- **Type safety** - Full TypeScript integration

### MessageInput Enhancement:
- **Auto-resize** - Textarea grows/shrinks with content
- **Preserved functionality** - Enter to send, Shift+Enter for new line
- **Better styling** - Consistent with design system
- **Improved accessibility** - Proper focus management 