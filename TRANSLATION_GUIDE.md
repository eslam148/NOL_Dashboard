# Translation Guide for NOL Dashboard

## 🌍 **Translation System Overview**

The NOL Dashboard uses a comprehensive translation system that supports English and Arabic languages with RTL support.

### **Key Components**

1. **TranslationService** - Core translation service
2. **TranslationHelperService** - Helper utilities for common translations
3. **Translation Pipes** - Angular pipes for template usage
4. **Translation Directives** - Directives for attribute translations

## 🔧 **Fixed Issues**

### **1. Form Control Error Fixed**
- **Issue**: `Cannot find control with name: 'coordinates.lat'`
- **Solution**: Fixed nested FormGroup structure in branch-form component
- **Change**: Added `formGroupName="coordinates"` and used `formControlName="lat"` instead of `formControlName="coordinates.lat"`

### **2. Enhanced Translation Service**
- ✅ Added comprehensive API error messages
- ✅ Added status translations
- ✅ Added action translations
- ✅ Added form validation messages
- ✅ Added time and date translations
- ✅ Added pagination translations
- ✅ Added file operation translations
- ✅ Added parameter support for dynamic translations

### **3. New Translation Utilities**
- ✅ **TranslationHelperService** - Helper methods for common translations
- ✅ **Enhanced Translation Pipes** - Multiple specialized pipes
- ✅ **Translation Directives** - For translating attributes

## 📝 **Usage Examples**

### **Basic Translation**
```html
<!-- Using pipe -->
{{ 'common.save' | translate }}

<!-- Using directive -->
<span appTranslate="common.save"></span>

<!-- With fallback -->
{{ 'missing.key' | translate:'Default Text' }}
```

### **Translation with Parameters**
```html
<!-- Time ago -->
{{ 'common.time.minutesAgo' | translateParams:{count: 5} }}

<!-- Results summary -->
{{ 'common.pagination.resultsSummary' | translateParams:{showing: 10, total: 100, type: 'items'} }}
```

### **Status and Action Translations**
```html
<!-- Status -->
{{ status | translateStatus }}

<!-- Action -->
{{ action | translateAction }}

<!-- Time ago -->
{{ createdDate | timeAgo }}
```

### **Attribute Translations**
```html
<!-- Placeholder -->
<input appTranslatePlaceholder="common.search" />

<!-- Title -->
<button appTranslateTitle="common.save">Save</button>

<!-- Aria Label -->
<button appTranslateAriaLabel="common.close">×</button>

<!-- Alt text -->
<img appTranslateAlt="common.nolLogo" src="logo.png" />
```

## 🔍 **Finding Missing Translation Keys**

### **Common Patterns to Look For**

1. **Hardcoded English Text**
   ```html
   <!-- ❌ Bad -->
   <button>Save</button>
   
   <!-- ✅ Good -->
   <button>{{ 'common.save' | translate }}</button>
   ```

2. **Form Labels and Placeholders**
   ```html
   <!-- ❌ Bad -->
   <input placeholder="Enter your name" />
   
   <!-- ✅ Good -->
   <input [placeholder]="'common.enterName' | translate" />
   ```

3. **Error Messages**
   ```typescript
   // ❌ Bad
   throw new Error('Network error occurred');
   
   // ✅ Good
   throw new Error(this.translationHelper.translateApiError('networkError'));
   ```

4. **Status Text**
   ```html
   <!-- ❌ Bad -->
   <span>Active</span>
   
   <!-- ✅ Good -->
   <span>{{ status | translateStatus }}</span>
   ```

### **Search Patterns for Missing Keys**

Use these regex patterns to find hardcoded text:

```regex
# Button text
>\s*[A-Z][a-z]+\s*<

# Placeholder attributes
placeholder="[^"]*"

# Title attributes
title="[^"]*"

# Alert/error messages
alert\(['"][^'"]*['"]

# Console messages with user-facing text
console\.(log|warn|error)\(['"][A-Z][^'"]*['"]
```

## 📋 **Translation Key Structure**

### **Recommended Key Naming Convention**

```
section.subsection.key
```

**Examples:**
- `common.save` - Common save button
- `vehicles.addNew` - Add new vehicle
- `bookings.status.pending` - Booking pending status
- `customers.form.email` - Customer email field
- `errors.validation.required` - Required field error

### **Available Translation Categories**

1. **common** - Common UI elements, actions, status
2. **nav** - Navigation items
3. **dashboard** - Dashboard specific text
4. **vehicles** - Vehicle management
5. **bookings** - Booking management
6. **customers** - Customer management
7. **branches** - Branch management
8. **advertisements** - Advertisement management
9. **adminUsers** - Admin user management

## 🛠 **Development Tools**

### **Translation Helper Methods**

```typescript
// Inject the helper service
private translationHelper = inject(TranslationHelperService);

// Use helper methods
this.translationHelper.translateStatus('active');
this.translationHelper.translateAction('save');
this.translationHelper.translateApiError('networkError');
this.translationHelper.getHttpErrorMessage(404);
```

### **Debug Missing Keys**

The translation service logs missing keys in development mode:

```typescript
// Enable logging in environment
export const environment = {
  logging: {
    enableApiLogging: true
  }
};
```

## 🎯 **Best Practices**

### **1. Always Use Translation Keys**
- Never hardcode user-facing text
- Use descriptive key names
- Group related keys together

### **2. Provide Fallbacks**
```typescript
// Always provide fallback text
this.translate('missing.key', 'Default Text');
```

### **3. Use Helper Services**
```typescript
// Use helpers for common patterns
this.translationHelper.translateStatus(status);
this.translationHelper.formatTimeAgo(date);
```

### **4. Test Both Languages**
- Test all features in both English and Arabic
- Verify RTL layout works correctly
- Check text truncation and overflow

### **5. Keep Keys Organized**
- Use consistent naming conventions
- Group related keys in sections
- Document complex key structures

## 🔄 **RTL Support**

The translation service automatically handles RTL for Arabic:

```typescript
// Check if current language is RTL
if (this.translationService.isRTL()) {
  // Apply RTL-specific styling
}
```

## 📊 **Translation Coverage**

To ensure complete translation coverage:

1. **Search for hardcoded text** using the patterns above
2. **Test language switching** throughout the application
3. **Verify all user-facing text** is translated
4. **Check error messages** and validation text
5. **Test form labels and placeholders**

## 🚀 **Next Steps**

1. **Audit existing components** for missing translation keys
2. **Add missing translations** to the translation service
3. **Update templates** to use translation pipes/directives
4. **Test language switching** functionality
5. **Verify RTL layout** works correctly

The translation system is now comprehensive and ready for production use with full English and Arabic support! 🌍
