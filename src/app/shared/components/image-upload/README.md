# Image Upload Component

A reusable Angular component for uploading images with drag & drop support, preview, and validation.

## Features

- ✅ Drag & drop file upload
- ✅ Multiple or single file selection
- ✅ Image preview with thumbnails
- ✅ File validation (type, size, count)
- ✅ Form integration (ControlValueAccessor)
- ✅ Responsive design
- ✅ Accessibility support
- ✅ Bilingual support (English/Arabic)
- ✅ Customizable configuration

## Usage

### Basic Usage

```typescript
import { ImageUploadComponent, UploadedImage } from './shared/components/image-upload';

@Component({
  template: `
    <app-image-upload
      [(ngModel)]="uploadedImages"
      [config]="uploadConfig"
      (filesSelected)="onFilesSelected($event)"
      (fileRemoved)="onFileRemoved($event)"
      (uploadError)="onUploadError($event)">
    </app-image-upload>
  `
})
export class MyComponent {
  uploadedImages: UploadedImage[] = [];
  
  uploadConfig = {
    maxFiles: 5,
    maxFileSize: 5, // MB
    multiple: true,
    showPreview: true,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  };

  onFilesSelected(images: UploadedImage[]) {
    console.log('Files selected:', images);
  }

  onFileRemoved(imageId: string) {
    console.log('File removed:', imageId);
  }

  onUploadError(error: string) {
    console.error('Upload error:', error);
  }
}
```

### With Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="myForm">
      <app-image-upload
        formControlName="images"
        [config]="uploadConfig">
      </app-image-upload>
    </form>
  `
})
export class MyComponent {
  myForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      images: [[]] // Array of UploadedImage objects
    });
  }
}
```

### Single File Upload

```typescript
uploadConfig = {
  multiple: false,
  maxFiles: 1,
  showPreview: true,
  allowedTypes: ['image/jpeg', 'image/png']
};
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxFiles` | number | 5 | Maximum number of files allowed |
| `maxFileSize` | number | 5 | Maximum file size in MB |
| `allowedTypes` | string[] | `['image/jpeg', 'image/jpg', 'image/png', 'image/webp']` | Allowed MIME types |
| `multiple` | boolean | true | Allow multiple file selection |
| `showPreview` | boolean | true | Show image previews |
| `showRemoveButton` | boolean | true | Show remove buttons on previews |
| `placeholder` | string | 'common.imageUpload.dragDropFiles' | Custom placeholder text |
| `accept` | string | 'image/*' | HTML input accept attribute |

## Events

| Event | Type | Description |
|-------|------|-------------|
| `filesSelected` | `EventEmitter<UploadedImage[]>` | Emitted when files are selected |
| `fileRemoved` | `EventEmitter<string>` | Emitted when a file is removed |
| `uploadError` | `EventEmitter<string>` | Emitted when an upload error occurs |

## Data Structure

### UploadedImage Interface

```typescript
interface UploadedImage {
  id: string;        // Unique identifier
  file: File;        // Original file object
  preview: string;   // Data URL for preview
  name: string;      // File name
  size: number;      // File size in bytes
  type: string;      // MIME type
}
```

## Styling

The component uses CSS custom properties for theming. You can override the default styles:

```css
.image-upload-container {
  --upload-border-color: #d1d5db;
  --upload-background: #f9fafb;
  --upload-primary-color: #3b82f6;
  --upload-error-color: #dc2626;
}
```

## Accessibility

- Full keyboard navigation support
- ARIA labels and descriptions
- Screen reader friendly
- Focus management
- High contrast support

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Angular 17+
- Bootstrap Icons (for icons)
- Angular Reactive Forms
- Angular Common Module
