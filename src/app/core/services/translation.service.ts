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
        logout: 'Logout',
        branches: 'Branches',
        vehicles: 'Vehicles',
        bookings: 'Bookings',
        customers: 'Customers',
        services: 'Additional Services',
        adminUsers: 'Admin Users'
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
        close: 'Close',
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        add: 'Add',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        previous: 'Previous'
      },
      // Car Rental Dashboard
      dashboard: {
        title: 'NOL Car Rental Dashboard',
        subtitle: 'Manage your car rental business efficiently',
        totalVehicles: 'Total Vehicles',
        availableVehicles: 'Available Vehicles',
        activeBookings: 'Active Bookings',
        totalRevenue: 'Total Revenue',
        monthlyRevenue: 'Monthly Revenue',
        totalBranches: 'Total Branches',
        totalCustomers: 'Total Customers',
        maintenanceAlerts: 'Maintenance Alerts',
        quickActions: 'Quick Actions',
        addVehicle: 'Add Vehicle',
        addBranch: 'Add Branch',
        newBooking: 'New Booking',
        addService: 'Add Service',
        welcome: 'Welcome to Car Rental Dashboard',
        welcomeMessage: 'Manage your car rental business efficiently with our comprehensive dashboard.',
        manageBranches: 'Manage Branches',
        manageBranchesDesc: 'Add, edit, and manage rental branch locations',
        manageVehicles: 'Manage Vehicles',
        manageVehiclesDesc: 'Control your vehicle fleet and availability',
        manageBookings: 'Manage Bookings',
        manageBookingsDesc: 'Handle customer reservations and rentals',
        manageCustomers: 'Manage Customers',
        manageCustomersDesc: 'Maintain customer information and history'
      },
      // Branch Management
      branches: {
        title: 'Branch Management',
        subtitle: 'Manage car rental branches',
        addBranch: 'Add Branch',
        addFirstBranch: 'Add First Branch',
        editBranch: 'Edit Branch',
        branchDetails: 'Branch Details',
        searchPlaceholder: 'Search branches...',
        status: 'Status',
        city: 'City',
        allStatuses: 'All Statuses',
        allCities: 'All Cities',
        active: 'Active',
        inactive: 'Inactive',
        maintenance: 'Maintenance',
        showingResults: 'Showing',
        of: 'of',
        branches: 'branches',
        noBranchesFound: 'No branches found',
        noBranchesDescription: 'No branches match your search criteria',
        branchManager: 'Branch Manager',
        operatingHours: 'Operating Hours',
        name: 'Branch Name',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        manager: 'Manager',
        country: 'Country',
        coordinates: 'Coordinates',
        latitude: 'Latitude',
        longitude: 'Longitude',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
        isOpen: 'Open',
        openTime: 'Open Time',
        closeTime: 'Close Time',
        getCurrentLocation: 'Get Current Location',
        mapInstructions: 'Click on the map to set location'
      },
      // Vehicle Management
      vehicles: {
        title: 'Vehicle Management',
        subtitle: 'Manage rental fleet vehicles',
        addVehicle: 'Add Vehicle',
        addFirstVehicle: 'Add First Vehicle',
        editVehicle: 'Edit Vehicle',
        vehicleDetails: 'Vehicle Details',
        searchPlaceholder: 'Search vehicles...',
        category: 'Category',
        status: 'Status',
        make: 'Make',
        allCategories: 'All Categories',
        allStatuses: 'All Statuses',
        allMakes: 'All Makes',
        economy: 'Economy',
        compact: 'Compact',
        midsize: 'Midsize',
        fullsize: 'Full Size',
        luxury: 'Luxury',
        suv: 'SUV',
        van: 'Van',
        truck: 'Truck',
        available: 'Available',
        rented: 'Rented',
        maintenance: 'Maintenance',
        outOfService: 'Out of Service',
        reserved: 'Reserved',
        showingResults: 'Showing',
        of: 'of',
        vehicles: 'vehicles',
        noVehiclesFound: 'No vehicles found',
        noVehiclesDescription: 'No vehicles match your search criteria',
        gasoline: 'Gasoline',
        diesel: 'Diesel',
        electric: 'Electric',
        hybrid: 'Hybrid',
        manual: 'Manual',
        automatic: 'Automatic',
        seats: 'seats',
        miles: 'miles',
        dailyRate: 'Daily Rate',
        weeklyRate: 'Weekly Rate',
        monthlyRate: 'Monthly Rate',
        formComingSoon: 'Vehicle Form Coming Soon',
        formComingSoonDesc: 'The vehicle form is under development and will be available soon.',
        detailComingSoon: 'Vehicle Details Coming Soon',
        detailComingSoonDesc: 'The vehicle detail view is under development and will be available soon.',
        addVehicleDesc: 'Add a new vehicle to your rental fleet',
        vehicleDetailsDesc: 'View detailed information about this vehicle'
      },
      // Bookings Management
      bookings: {
        title: 'Booking Management',
        subtitle: 'Manage customer reservations and rentals',
        comingSoon: 'Booking Management Coming Soon',
        comingSoonDesc: 'Comprehensive booking management system with reservation tracking, customer information, and payment processing.',
        newBookings: 'New Bookings',
        manageReservations: 'Manage Reservations',
        customerInfo: 'Customer Information',
        paymentTracking: 'Payment Tracking'
      },
      // Customer Management
      customers: {
        title: 'Customer Management',
        subtitle: 'Manage customer profiles and rental history',
        comingSoon: 'Customer Management Coming Soon',
        comingSoonDesc: 'Complete customer management system with profiles, rental history, and contact information.',
        addCustomers: 'Add Customers',
        customerProfiles: 'Customer Profiles',
        rentalHistory: 'Rental History',
        contactInfo: 'Contact Information'
      },
      // Additional Services
      services: {
        title: 'Additional Services',
        subtitle: 'Manage rental add-on services and equipment',
        comingSoon: 'Services Management Coming Soon',
        comingSoonDesc: 'Manage additional rental services like GPS navigation, insurance, child seats, and equipment.',
        gpsNavigation: 'GPS Navigation',
        insurance: 'Insurance Options',
        childSeats: 'Child Seats',
        equipment: 'Equipment Rental'
      },
      // Admin Users
      adminUsers: {
        title: 'Admin User Management',
        subtitle: 'Manage administrative users and permissions',
        comingSoon: 'Admin Management Coming Soon',
        comingSoonDesc: 'Role-based admin user management with permissions, activity logging, and access control.',
        addAdmins: 'Add Administrators',
        roleManagement: 'Role Management',
        activityLogs: 'Activity Logs',
        permissions: 'Permissions Control'
      },

    },
    ar: {
      // التنقل
      nav: {
        dashboard: 'لوحة التحكم',
        admin: 'الإدارة',
        users: 'المستخدمين',
        reports: 'التقارير',
        logout: 'تسجيل الخروج',
        branches: 'الفروع',
        vehicles: 'المركبات',
        bookings: 'الحجوزات',
        customers: 'العملاء',
        services: 'الخدمات الإضافية',
        adminUsers: 'مستخدمي الإدارة'
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
        close: 'إغلاق',
        refresh: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        add: 'إضافة',
        edit: 'تعديل',
        view: 'عرض',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق'
      },
      // لوحة تحكم تأجير السيارات
      dashboard: {
        title: 'لوحة تحكم تأجير السيارات NOL',
        subtitle: 'إدارة أعمال تأجير السيارات بكفاءة',
        totalVehicles: 'إجمالي المركبات',
        availableVehicles: 'المركبات المتاحة',
        activeBookings: 'الحجوزات النشطة',
        totalRevenue: 'إجمالي الإيرادات',
        monthlyRevenue: 'الإيرادات الشهرية',
        totalBranches: 'إجمالي الفروع',
        totalCustomers: 'إجمالي العملاء',
        maintenanceAlerts: 'تنبيهات الصيانة',
        quickActions: 'إجراءات سريعة',
        addVehicle: 'إضافة مركبة',
        addBranch: 'إضافة فرع',
        newBooking: 'حجز جديد',
        addService: 'إضافة خدمة',
        welcome: 'مرحباً بك في لوحة تحكم تأجير السيارات',
        welcomeMessage: 'إدارة أعمال تأجير السيارات بكفاءة من خلال لوحة التحكم الشاملة.',
        manageBranches: 'إدارة الفروع',
        manageBranchesDesc: 'إضافة وتعديل وإدارة مواقع فروع التأجير',
        manageVehicles: 'إدارة المركبات',
        manageVehiclesDesc: 'التحكم في أسطول المركبات والتوفر',
        manageBookings: 'إدارة الحجوزات',
        manageBookingsDesc: 'التعامل مع حجوزات العملاء والتأجير',
        manageCustomers: 'إدارة العملاء',
        manageCustomersDesc: 'الاحتفاظ بمعلومات العملاء وتاريخهم'
      },
      // إدارة الفروع
      branches: {
        title: 'إدارة الفروع',
        subtitle: 'إدارة فروع تأجير السيارات',
        addBranch: 'إضافة فرع',
        addFirstBranch: 'إضافة أول فرع',
        editBranch: 'تعديل الفرع',
        branchDetails: 'تفاصيل الفرع',
        searchPlaceholder: 'البحث في الفروع...',
        status: 'الحالة',
        city: 'المدينة',
        allStatuses: 'جميع الحالات',
        allCities: 'جميع المدن',
        active: 'نشط',
        inactive: 'غير نشط',
        maintenance: 'صيانة',
        showingResults: 'عرض',
        of: 'من',
        branches: 'فرع',
        noBranchesFound: 'لم يتم العثور على فروع',
        noBranchesDescription: 'لا توجد فروع تطابق معايير البحث الخاصة بك',
        branchManager: 'مدير الفرع',
        operatingHours: 'ساعات العمل',
        name: 'اسم الفرع',
        address: 'العنوان',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        manager: 'المدير',
        country: 'البلد',
        coordinates: 'الإحداثيات',
        latitude: 'خط العرض',
        longitude: 'خط الطول',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد',
        isOpen: 'مفتوح',
        openTime: 'وقت الفتح',
        closeTime: 'وقت الإغلاق',
        getCurrentLocation: 'الحصول على الموقع الحالي',
        mapInstructions: 'انقر على الخريطة لتحديد الموقع'
      },
      // إدارة المركبات
      vehicles: {
        title: 'إدارة المركبات',
        subtitle: 'إدارة أسطول المركبات المؤجرة',
        addVehicle: 'إضافة مركبة',
        addFirstVehicle: 'إضافة أول مركبة',
        editVehicle: 'تعديل المركبة',
        vehicleDetails: 'تفاصيل المركبة',
        searchPlaceholder: 'البحث في المركبات...',
        category: 'الفئة',
        status: 'الحالة',
        make: 'الماركة',
        allCategories: 'جميع الفئات',
        allStatuses: 'جميع الحالات',
        allMakes: 'جميع الماركات',
        economy: 'اقتصادية',
        compact: 'مدمجة',
        midsize: 'متوسطة',
        fullsize: 'كبيرة',
        luxury: 'فاخرة',
        suv: 'دفع رباعي',
        van: 'فان',
        truck: 'شاحنة',
        available: 'متاحة',
        rented: 'مؤجرة',
        maintenance: 'صيانة',
        outOfService: 'خارج الخدمة',
        reserved: 'محجوزة',
        showingResults: 'عرض',
        of: 'من',
        vehicles: 'مركبة',
        noVehiclesFound: 'لم يتم العثور على مركبات',
        noVehiclesDescription: 'لا توجد مركبات تطابق معايير البحث الخاصة بك',
        gasoline: 'بنزين',
        diesel: 'ديزل',
        electric: 'كهربائية',
        hybrid: 'هجين',
        manual: 'يدوي',
        automatic: 'أوتوماتيك',
        seats: 'مقاعد',
        miles: 'ميل',
        dailyRate: 'السعر اليومي',
        weeklyRate: 'السعر الأسبوعي',
        monthlyRate: 'السعر الشهري',
        formComingSoon: 'نموذج المركبة قريباً',
        formComingSoonDesc: 'نموذج المركبة قيد التطوير وسيكون متاحاً قريباً.',
        detailComingSoon: 'تفاصيل المركبة قريباً',
        detailComingSoonDesc: 'عرض تفاصيل المركبة قيد التطوير وسيكون متاحاً قريباً.',
        addVehicleDesc: 'إضافة مركبة جديدة إلى أسطول التأجير',
        vehicleDetailsDesc: 'عرض معلومات مفصلة عن هذه المركبة'
      },
      // إدارة الحجوزات
      bookings: {
        title: 'إدارة الحجوزات',
        subtitle: 'إدارة حجوزات العملاء والتأجير',
        comingSoon: 'إدارة الحجوزات قريباً',
        comingSoonDesc: 'نظام إدارة حجوزات شامل مع تتبع الحجوزات ومعلومات العملاء ومعالجة المدفوعات.',
        newBookings: 'حجوزات جديدة',
        manageReservations: 'إدارة الحجوزات',
        customerInfo: 'معلومات العملاء',
        paymentTracking: 'تتبع المدفوعات'
      },
      // إدارة العملاء
      customers: {
        title: 'إدارة العملاء',
        subtitle: 'إدارة ملفات العملاء وتاريخ التأجير',
        comingSoon: 'إدارة العملاء قريباً',
        comingSoonDesc: 'نظام إدارة عملاء كامل مع الملفات الشخصية وتاريخ التأجير ومعلومات الاتصال.',
        addCustomers: 'إضافة عملاء',
        customerProfiles: 'ملفات العملاء',
        rentalHistory: 'تاريخ التأجير',
        contactInfo: 'معلومات الاتصال'
      },
      // الخدمات الإضافية
      services: {
        title: 'الخدمات الإضافية',
        subtitle: 'إدارة خدمات ومعدات التأجير الإضافية',
        comingSoon: 'إدارة الخدمات قريباً',
        comingSoonDesc: 'إدارة الخدمات الإضافية للتأجير مثل نظام تحديد المواقع والتأمين ومقاعد الأطفال والمعدات.',
        gpsNavigation: 'نظام تحديد المواقع',
        insurance: 'خيارات التأمين',
        childSeats: 'مقاعد الأطفال',
        equipment: 'تأجير المعدات'
      },
      // مستخدمي الإدارة
      adminUsers: {
        title: 'إدارة المستخدمين الإداريين',
        subtitle: 'إدارة المستخدمين الإداريين والصلاحيات',
        comingSoon: 'إدارة المديرين قريباً',
        comingSoonDesc: 'إدارة المستخدمين الإداريين القائمة على الأدوار مع الصلاحيات وتسجيل الأنشطة والتحكم في الوصول.',
        addAdmins: 'إضافة مديرين',
        roleManagement: 'إدارة الأدوار',
        activityLogs: 'سجلات الأنشطة',
        permissions: 'التحكم في الصلاحيات'
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
