import { Injectable, signal } from '@angular/core';

export type ConfirmVariant = 'danger' | 'primary' | 'secondary';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  dialog = signal<PendingConfirm | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    const merged: ConfirmOptions = {
      title: options.title ?? 'Confirm Action',
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      variant: options.variant ?? 'danger'
    };

    return new Promise<boolean>(resolve => {
      this.dialog.set({ options: merged, resolve });
    });
  }

  accept() {
    const pending = this.dialog();
    if (pending) {
      pending.resolve(true);
      this.dialog.set(null);
    }
  }

  cancel() {
    const pending = this.dialog();
    if (pending) {
      pending.resolve(false);
      this.dialog.set(null);
    }
  }
}


