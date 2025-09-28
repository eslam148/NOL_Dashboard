import { Component, Input, Output, EventEmitter, forwardRef, signal, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { TranslationService } from '../../../core/services/translation.service';

export interface ImageUploadConfig {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
  showPreview?: boolean;
  showRemoveButton?: boolean;
  placeholder?: string;
  accept?: string;
}

export interface UploadedImage {
  id: string;
  file?: File;
  url?: string;
  preview: string;
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements ControlValueAccessor, OnInit {
  private cdr = inject(ChangeDetectorRef);
  private fileUploadService = inject(FileUploadService);
  private translationService = inject(TranslationService);
  
  @Input() config: ImageUploadConfig = {};
  @Input() disabled = false;
  @Input() label = 'common.imageUpload.selectFiles';
  @Input() errorMessage = '';
  
  @Output() filesSelected = new EventEmitter<UploadedImage[]>();
  @Output() fileRemoved = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  // Signals for reactive state
  uploadedImages = signal<UploadedImage[]>([]);
  isDragOver = signal(false);
  isLoading = signal(false);
  
  // Default configuration
  private defaultConfig: Required<ImageUploadConfig> = {
    maxFiles: 5,
    maxFileSize: 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    multiple: true,
    showPreview: true,
    showRemoveButton: true,
    placeholder: 'common.imageUpload.dragDropFiles',
    accept: 'image/*'
  };

  get finalConfig(): Required<ImageUploadConfig> {
    return { ...this.defaultConfig, ...this.config };
  }

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    console.log('📸 ImageUploadComponent initialized');
  }

  writeValue(value: any): void {
    console.log('📸 ImageUpload writeValue called with:', value);
    
    if (typeof value === 'string' && value) {
      // Handle string URL value from form control
      const image: UploadedImage = {
        id: Date.now().toString(),
        name: this.fileUploadService.getFileNameFromUrl(value),
        url: value,
        preview: value,
        size: 0,
        type: 'image/*'
      };
      this.uploadedImages.set([image]);
    } else if (Array.isArray(value)) {
      // Handle array of UploadedImage objects
      this.uploadedImages.set(value || []);
    } else {
      // Handle null/undefined values
      this.uploadedImages.set([]);
    }
    
    console.log('📸 ImageUpload uploadedImages set to:', this.uploadedImages());
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    if (this.disabled) return;

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  private async handleFiles(files: File[]): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Validate files
      const validationResult = this.validateFiles(files);
      if (!validationResult.isValid) {
        this.uploadError.emit(validationResult.error);
        return;
      }

      // Process files
      const newImages: UploadedImage[] = [];
      for (const file of files) {
        const uploadedImage = await this.createUploadedImage(file);
        newImages.push(uploadedImage);
      }

      // Update images based on configuration
      const currentImages = this.uploadedImages();
      let updatedImages: UploadedImage[];

      if (this.finalConfig.multiple) {
        // Add to existing images
        updatedImages = [...currentImages, ...newImages].slice(0, this.finalConfig.maxFiles);
      } else {
        // Replace with new image
        updatedImages = newImages.slice(0, 1);
      }

      console.log('📸 ImageUpload handleFiles - setting uploadedImages to:', updatedImages);
      this.uploadedImages.set(updatedImages);
      // Emit the URL string for reactive forms
      const imageUrl = updatedImages.length > 0 ? updatedImages[0].url : '';
      this.onChange(imageUrl);
      this.onTouched();
      this.filesSelected.emit(updatedImages);
      console.log('📸 ImageUpload handleFiles - uploadedImages after set:', this.uploadedImages());
      
      // Trigger change detection to update the UI
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error handling files:', error);
      this.uploadError.emit('common.imageUpload.errorProcessingFiles');
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateFiles(files: File[]): { isValid: boolean; error?: string } {
    const config = this.finalConfig;

    // Check file count
    const currentCount = this.uploadedImages().length;
    const totalCount = currentCount + files.length;
    
    if (!config.multiple && files.length > 1) {
      return { isValid: false, error: 'common.imageUpload.singleFileOnly' };
    }

    if (totalCount > config.maxFiles) {
      return { isValid: false, error: 'common.imageUpload.maxFilesExceeded' };
    }

    // Validate each file
    for (const file of files) {
      // Check file type
      if (!config.allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'common.imageUpload.invalidFileType' };
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > config.maxFileSize) {
        return { isValid: false, error: 'common.imageUpload.fileTooLarge' };
      }
    }

    return { isValid: true };
  }

  private async createUploadedImage(file: File): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedImage: UploadedImage = {
          id: this.generateId(),
          file,
          preview: reader.result as string,
          name: file.name,
          size: file.size,
          type: file.type
        };
        resolve(uploadedImage);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  removeImage(imageId: string): void {
    if (this.disabled) return;

    const currentImages = this.uploadedImages();
    const updatedImages = currentImages.filter(img => img.id !== imageId);
    
    this.uploadedImages.set(updatedImages);
    // Emit the URL string for reactive forms
    const imageUrl = updatedImages.length > 0 ? updatedImages[0].url : '';
    this.onChange(imageUrl);
    this.onTouched();
    this.fileRemoved.emit(imageId);
    
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  get canAddMoreFiles(): boolean {
    const currentCount = this.uploadedImages().length;
    return currentCount < this.finalConfig.maxFiles;
  }

  get isMultiple(): boolean {
    return this.finalConfig.multiple;
  }

  get showPreview(): boolean {
    return this.finalConfig.showPreview;
  }

  get showRemoveButton(): boolean {
    return this.finalConfig.showRemoveButton;
  }

  get acceptTypes(): string {
    return this.finalConfig.accept;
  }

  get placeholderText(): string {
    return this.finalConfig.placeholder;
  }

  trackByImageId(index: number, image: UploadedImage): string {
    return image.id;
  }

  // Public getters for template access
  get maxFiles(): number {
    return this.finalConfig.maxFiles;
  }

  get allowedTypes(): string[] {
    return this.finalConfig.allowedTypes;
  }

  get maxFileSize(): number {
    return this.finalConfig.maxFileSize;
  }
}
