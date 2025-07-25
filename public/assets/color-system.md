# NOL Dashboard Color System

This document outlines the color system implemented for the NOL Dashboard application.

## Primary Color Palette

The application uses a carefully selected color palette that maintains consistency and accessibility:

### Core Colors
- **Primary Yellow**: `#E4B63D` - Main accent color for buttons, highlights, and interactive elements
- **Primary Cream**: `#FEFCE8` - Light background color for secondary surfaces
- **Primary White**: `#FFFFFF` - Main background color and text on dark surfaces
- **Primary Dark**: `#1E1E1E` - Primary text color and dark backgrounds
- **Primary Gray**: `#414042` - Secondary text color and subtle elements

## CSS Custom Properties

All colors are available as CSS custom properties (variables) in the global styles:

### Primary Variables
```css
--primary-yellow: #E4B63D;
--primary-cream: #FEFCE8;
--primary-white: #FFFFFF;
--primary-dark: #1E1E1E;
--primary-gray: #414042;
```

### Semantic Color Variables
```css
/* Backgrounds */
--background-primary: var(--primary-white);
--background-secondary: var(--primary-cream);
--background-dark: var(--primary-dark);

/* Text Colors */
--text-primary: var(--primary-dark);
--text-secondary: var(--primary-gray);
--text-light: var(--primary-white);
--text-muted: var(--gray-500);

/* Accent Colors */
--accent-primary: var(--primary-yellow);
--accent-hover: var(--yellow-600);
--accent-light: var(--yellow-200);

/* Borders */
--border-light: var(--gray-200);
--border-medium: var(--gray-300);
--border-dark: var(--primary-gray);
```

## Utility Classes

Pre-built utility classes are available for quick styling:

### Background Classes
- `.bg-primary` - White background
- `.bg-secondary` - Cream background
- `.bg-dark` - Dark background
- `.bg-accent` - Yellow background
- `.bg-yellow` - Primary yellow
- `.bg-cream` - Primary cream
- `.bg-gray` - Primary gray

### Text Classes
- `.text-primary` - Dark text
- `.text-secondary` - Gray text
- `.text-light` - White text
- `.text-muted` - Muted gray text
- `.text-accent` - Yellow text
- `.text-yellow` - Primary yellow
- `.text-white` - White text
- `.text-dark` - Dark text
- `.text-gray` - Gray text

### Border Classes
- `.border-light` - Light gray border
- `.border-medium` - Medium gray border
- `.border-dark` - Dark gray border
- `.border-accent` - Yellow border

## Component Styles

### Buttons
The color system includes pre-styled button classes:

- `.btn-primary` - Yellow background with dark text
- `.btn-secondary` - Cream background with border
- `.btn-dark` - Dark background with light text

### Cards
- `.card` - White background with subtle border and shadow

### Form Elements
- `.form-input` - Styled input fields with focus states

## Usage Examples

### In HTML Templates
```html
<!-- Using utility classes -->
<div class="bg-secondary text-primary">
  <h2 class="text-accent">NOL Dashboard</h2>
  <p class="text-secondary">Welcome to your dashboard</p>
</div>

<!-- Using component classes -->
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary Action</button>
```

### In Component Styles
```css
.custom-component {
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.custom-component:hover {
  background-color: var(--accent-primary);
  color: var(--text-light);
}
```

### In Angular Components
```typescript
// You can also access colors programmatically if needed
@Component({
  template: `
    <div [style.background-color]="backgroundColor">
      Content here
    </div>
  `
})
export class MyComponent {
  backgroundColor = 'var(--background-secondary)';
}
```

## Accessibility

The color system has been designed with accessibility in mind:

- High contrast ratios between text and background colors
- Clear visual hierarchy through color usage
- Consistent color meanings throughout the application

## Color Variations

Extended color variations are available for more nuanced designs:

### Yellow Scale
- `--yellow-50` to `--yellow-900` - Light to dark yellow variations

### Gray Scale
- `--gray-50` to `--gray-900` - Light to dark gray variations

## Best Practices

1. **Use semantic variables** instead of direct color values when possible
2. **Maintain consistency** by using the predefined utility classes
3. **Test accessibility** when creating custom color combinations
4. **Use the accent color sparingly** to maintain its impact
5. **Prefer utility classes** over custom CSS when available

## Status Colors

For status indicators, use these semantic colors:
- **Success**: `#22C55E` (green)
- **Warning**: `var(--primary-yellow)` (yellow)
- **Error**: `#EF4444` (red)
- **Info**: `#3B82F6` (blue)

These are available as CSS variables:
- `--success`
- `--warning`
- `--error`
- `--info`
