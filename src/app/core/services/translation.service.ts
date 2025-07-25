import { Injectable, signal } from '@angular/core';

export interface Translation {
  [key: string]: string | Translation;
}

export type SupportedLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = signal<SupportedLanguage>('en');
  private translations: Record<SupportedLanguage, Translation> = {
    en: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        admin: 'Admin',
        users: 'Users',
        reports: 'Reports',
        logout: 'Logout'
      },
      // Login Page
      login: {
        title: 'NOL Dashboard',
        subtitle: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        signingIn: 'Signing in...',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        emailRequired: 'Email is required',
        emailInvalid: 'Please enter a valid email',
        passwordRequired: 'Password is required',
        demoCredentials: 'Demo Credentials:',
        admin: 'Admin',
        user: 'User',
        manager: 'Manager'
      },
      // Users Management
      users: {
        title: 'User Management',
        subtitle: 'Manage user accounts and permissions',
        addNewUser: 'Add New User',
        exportUsers: 'Export Users',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        actions: 'Actions',
        edit: 'Edit',
        disable: 'Disable',
        active: 'Active',
        inactive: 'Inactive',
        adminUser: 'Admin User',
        managerUser: 'Manager User',
        regularUser: 'Regular User'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        confirm: 'Confirm',
        close: 'Close'
      }
    },
    ar: {
      // التنقل
      nav: {
        dashboard: 'لوحة التحكم',
        admin: 'الإدارة',
        users: 'المستخدمين',
        reports: 'التقارير',
        logout: 'تسجيل الخروج'
      },
      // صفحة تسجيل الدخول
      login: {
        title: 'لوحة تحكم NOL',
        subtitle: 'سجل دخولك إلى حسابك',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        signIn: 'تسجيل الدخول',
        signingIn: 'جاري تسجيل الدخول...',
        showPassword: 'إظهار كلمة المرور',
        hidePassword: 'إخفاء كلمة المرور',
        emailRequired: 'البريد الإلكتروني مطلوب',
        emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
        passwordRequired: 'كلمة المرور مطلوبة',
        demoCredentials: 'بيانات تجريبية:',
        admin: 'مدير',
        user: 'مستخدم',
        manager: 'مدير قسم'
      },
      // إدارة المستخدمين
      users: {
        title: 'إدارة المستخدمين',
        subtitle: 'إدارة حسابات المستخدمين والصلاحيات',
        addNewUser: 'إضافة مستخدم جديد',
        exportUsers: 'تصدير المستخدمين',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        role: 'الدور',
        status: 'الحالة',
        actions: 'الإجراءات',
        edit: 'تعديل',
        disable: 'تعطيل',
        active: 'نشط',
        inactive: 'غير نشط',
        adminUser: 'مستخدم مدير',
        managerUser: 'مستخدم مدير قسم',
        regularUser: 'مستخدم عادي'
      },
      // عام
      common: {
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        warning: 'تحذير',
        info: 'معلومات',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        confirm: 'تأكيد',
        close: 'إغلاق'
      }
    }
  };

  constructor() {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('nol-dashboard-language') as SupportedLanguage;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      this.currentLanguage.set(savedLang);
    }
    
    // Apply RTL/LTR direction
    this.updateDirection();
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage();
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);
    localStorage.setItem('nol-dashboard-language', language);
    this.updateDirection();
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage()];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  private updateDirection(): void {
    const direction = this.currentLanguage() === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = this.currentLanguage();
  }

  isRTL(): boolean {
    return this.currentLanguage() === 'ar';
  }
}
