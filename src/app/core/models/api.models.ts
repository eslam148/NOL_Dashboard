// API Response Models based on the Admin API Documentation

/**
 * Enums matching C# backend
 */
export enum FuelType {
  Gasoline = 1,
  Diesel = 2,
  Hybrid = 3,
  Electric = 4,
  PluginHybrid = 5
}

export enum TransmissionType {
  Manual = 1,
  Automatic = 2
}

export enum CarStatus {
  Available = 1,
  Rented = 2,
  Maintenance = 3,
  OutOfService = 4
}

/**
 * Validation constants for AdminCreateCarDto
 */
export const CAR_VALIDATION = {
  brandAr: { minLength: 2, maxLength: 100, required: true },
  brandEn: { minLength: 2, maxLength: 100, required: true },
  modelAr: { minLength: 2, maxLength: 100, required: true },
  modelEn: { minLength: 2, maxLength: 100, required: true },
  year: { min: 1900, max: 2030, required: true },
  colorAr: { minLength: 2, maxLength: 50, required: true },
  colorEn: { minLength: 2, maxLength: 50, required: true },
  plateNumber: { minLength: 3, maxLength: 20, required: true },
  seatingCapacity: { min: 1, max: 20, required: true },
  numberOfDoors: { min: 2, max: 6, required: true },
  maxSpeed: { min: 80, max: 400, required: true },
  engine: { minLength: 3, maxLength: 200, required: true },
  dailyRate: { min: 0.01, max: 10000, required: true },
  weeklyRate: { min: 0.01, max: 50000, required: true },
  monthlyRate: { min: 0.01, max: 200000, required: true },
  descriptionAr: { maxLength: 1000, required: false },
  descriptionEn: { maxLength: 1000, required: false },
  mileage: { min: 0, max: 1000000, required: false }
} as const;

/**
 * Default values for AdminCreateCarDto
 */
export const DEFAULT_CAR_VALUES: Partial<AdminCreateCarDto> = {
  // Required string fields - provide empty strings so user must fill them
  brandAr: '',
  brandEn: '',
  modelAr: '',
  modelEn: '',
  colorAr: '',
  colorEn: '',
  plateNumber: '',
  engine: '',
  
  // Required numeric fields with sensible defaults
  year: new Date().getFullYear(),
  seatingCapacity: 5,
  numberOfDoors: 4,
  maxSpeed: 180,
  dailyRate: 100,
  weeklyRate: 600,
  monthlyRate: 2400,
  
  // Required enums
  transmissionType: TransmissionType.Automatic,
  fuelType: FuelType.Gasoline,
  
  // Required IDs - will be set by form
  categoryId: 1,
  branchId: 1,
  
  // Optional fields
  status: CarStatus.Available,
  mileage: 0
};

/**
 * Standard API Response Format
 */
export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
  errors?: string[];
  statusCode: number;
  statusCodeValue: number;
}

/**
 * Paginated Response Format
 */
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;      // API uses "currentPage" instead of "pageNumber"
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Authentication DTOs
 */
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    preferredLanguage: 'Arabic' | 'English';
  };
  expiresAt: string;
}

/**
 * Dashboard DTOs
 */
export interface DashboardFilterDto {
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
  branchId?: number;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface DashboardStatsDto {
  overallStats: {
    totalBookings: number;
    totalRevenue: number;
    activeCars: number;
    totalCustomers: number;
    pendingBookings: number;
    completedBookings: number;
    averageBookingValue: number;
    carUtilizationRate: number;
  };
  revenueStats: {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    yearRevenue: number;
    revenueGrowthRate: number;
    monthlyRevenue: Array<{
      year: number;
      month: number;
      monthName: string;
      revenue: number;
      bookingCount: number;
    }>;
  };
  bookingStats: {
    todayBookings: number;
    weekBookings: number;
    monthBookings: number;
    yearBookings: number;
    cancelledBookings: number;
    cancellationRate: number;
    bookingsByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
  carStats: {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    maintenanceCars: number;
    outOfServiceCars: number;
    utilizationRate: number;
  };
  customerStats: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    customerRetentionRate: number;
    averageLoyaltyPoints: number;
  };
}

/**
 * Export and Report DTOs
 */
export interface ExportRequestDto {
  format: 'excel' | 'pdf';
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
}

export interface ReportUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

/**
 * Common Filter Base Interface
 */
export interface BaseFilterDto {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Bulk Operation DTOs
 */
export interface BulkOperationResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  processedIds: (string | number)[];
}

/**
 * Import Result DTO
 */
export interface ImportResult<T> {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedItems: T[];
}

/**
 * Error Response DTO
 */
export interface ErrorResponse {
  succeeded: false;
  message: string;
  errors: string[];
  statusCode: number;
  statusCodeValue: number;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

/**
 * Validation Response
 */
export interface ValidationResponse {
  isValid: boolean;
  errors?: string[];
  suggestions?: string[];
}

/**
 * Analytics Base Interface
 */
export interface BaseAnalyticsDto {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  growthRate: number;
  periodComparison: {
    current: number;
    previous: number;
    changePercentage: number;
  };
}

/**
 * System Settings DTO
 */
export interface SystemSettingsDto {
  key: string;
  value: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity Log DTO
 */
export interface ActivityLogDto {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Notification DTO
 */
export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

/**
 * Car Management DTOs
 */
export interface CarFilterDto extends BaseFilterDto {
  status?: CarStatus;
  categoryId?: number;
  branchId?: number;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  dailyRateFrom?: number;
  dailyRateTo?: number;
  transmissionType?: TransmissionType;
  fuelType?: FuelType;
}

export interface AdminCarDto {
  id: number;
  brand: string;  // API returns single brand field, not bilingual
  model: string;  // API returns single model field, not bilingual
  year: number;
  color: string;  // API returns single color field, not bilingual
  plateNumber?: string; // Optional: include if API provides plate number
  seatingCapacity: number;
  numberOfDoors: number;
  maxSpeed: number;
  engine: string;
  transmissionType: string;
  fuelType: string;
  dailyPrice: number;    // API uses "dailyPrice" not "dailyRate"
  weeklyPrice: number;   // API uses "weeklyPrice" not "weeklyRate"
  monthlyPrice: number;  // API uses "monthlyPrice" not "monthlyRate"
  status: string;
  imageUrl?: string;
  description?: string;  // API uses single description field
  mileage: number;
  features?: string;     // Optional features field
  category: {            // API returns full category object
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    sortOrder: number;
  };
  branch: {              // API returns full branch object
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    workingHours: string;
  };
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  totalRevenue: number;
  utilizationRate: number;
  lastBookingDate?: string;
  nextMaintenanceDate?: string;
  maintenanceHistory: CarMaintenanceRecordDto[];
  isFavorite: boolean;
  avrageRate: number;    // Note: API has typo "avrageRate" instead of "averageRate"
  rateCount: number;
}

export interface AdminCreateCarDto {
  // Required fields with validation constraints
  brandAr: string;        // Required, 2-100 chars
  brandEn: string;        // Required, 2-100 chars
  modelAr: string;        // Required, 2-100 chars
  modelEn: string;        // Required, 2-100 chars
  year: number;           // Required, 1900-2030
  colorAr: string;        // Required, 2-50 chars
  colorEn: string;        // Required, 2-50 chars
  plateNumber: string;    // Required, 3-20 chars
  seatingCapacity: number; // Required, 1-20
  numberOfDoors: number;   // Required, 2-6
  maxSpeed: number;        // Required, 80-400 km/h
  engine: string;          // Required, 3-200 chars
  transmissionType: TransmissionType; // Required enum
  fuelType: FuelType;      // Required enum
  dailyRate: number;       // Required, 0.01-10000
  weeklyRate: number;      // Required, 0.01-50000
  monthlyRate: number;     // Required, 0.01-200000
  categoryId: number;      // Required
  branchId: number;        // Required
  
  // Optional fields
  status?: CarStatus;      // Default: Available
  imageUrl?: string;       // Optional URL
  descriptionAr?: string;  // Optional, max 1000 chars
  descriptionEn?: string;  // Optional, max 1000 chars
  mileage?: number;        // Optional, 0-1000000
  features?: string;       // Optional
}

export interface UpdateCarStatusDto {
  status: CarStatus;
  notes?: string;
}

export interface AdminUpdateCarDto {
  brandAr?: string;
  brandEn?: string;
  modelAr?: string;
  modelEn?: string;
  year?: number;
  colorAr?: string;
  colorEn?: string;
  plateNumber?: string;
  seatingCapacity?: number;
  numberOfDoors?: number;
  maxSpeed?: number; // Maximum speed in km/h
  engine?: string; // Engine specifications
  transmissionType?: TransmissionType;
  fuelType?: FuelType;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  status?: CarStatus;
  imageUrl?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  mileage?: number;
  features?: string;
  categoryId?: number;
  branchId?: number;
}

export interface CarMaintenanceRecordDto {
  id: number;
  maintenanceDate: string;
  maintenanceType: string;
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: string;
}

export interface CarAnalyticsDto {
  carId: number;
  carInfo: string;
  totalBookings: number;
  totalRevenue: number;
  utilizationRate: number;
  averageBookingValue: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: MonthlyCarRevenueDto[];
  bookingTrends: CarBookingTrendDto[];
}

export interface MonthlyCarRevenueDto {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  bookingCount: number;
  daysRented: number;
}

export interface CarBookingTrendDto {
  date: string;
  bookingCount: number;
  revenue: number;
}

export interface BulkCarOperationDto {
  carIds: number[];
  operation: 'delete' | 'updateStatus' | 'updateBranch' | 'updateCategory';
  newStatus?: CarStatus;
  newBranchId?: number;
  newCategoryId?: number;
}

export interface CarImportDto {
  brandAr: string;
  brandEn: string;
  modelAr: string;
  modelEn: string;
  year: number;
  colorAr: string;
  colorEn: string;
  plateNumber: string;
  seatingCapacity: number;
  numberOfDoors: number;
  maxSpeed: number; // Maximum speed in km/h
  engine: string; // Engine specifications
  transmissionType: string;
  fuelType: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  status: string;
  imageUrl?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  mileage: number;
  features?: string;
  categoryName: string;
  branchName: string;
}

/**
 * Booking Management DTOs
 */
export interface BookingFilterDto extends BaseFilterDto {
  status?: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  customerId?: string;
  carId?: number;
  branchId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  totalAmountFrom?: number;
  totalAmountTo?: number;
}

export interface AdminBookingDto {
  id: number;
  userId: string;
  carId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  receivingBranchId: number;
  deliveryBranchId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carBrand: string;
  carModel: string;
  carPlateNumber: string;
  receivingBranchName: string;
  deliveryBranchName: string;
  extrasDetails: Array<{
    extraTypeName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentDetails: Array<{
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    paymentDate: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateBookingDto {
  userId: string;
  carId: number;
  startDate: string;
  endDate: string;
  receivingBranchId: number;
  deliveryBranchId: number;
  extras?: Array<{
    extraTypePriceId: number;
    quantity: number;
  }>;
  notes?: string;
  discountAmount?: number;
  discountReason?: string;
}

export interface UpdateBookingStatusDto {
  status: 'Pending' | 'Confirmed' | 'Open' | 'Completed' | 'Canceled';
  notes?: string;
}

export interface CancelBookingDto {
  cancellationReason: string;
  refundAmount?: number;
}

export interface BulkBookingOperationDto {
  bookingIds: number[];
  operation: 'updateStatus' | 'cancel' | 'delete';
  newStatus?: string;
  cancellationReason?: string;
  notes?: string;
}

/**
 * Customer Management DTOs
 */
export interface CustomerFilterDto extends BaseFilterDto {
  name?: string;
  email?: string;
  phone?: string;
  userRole?: string;
  preferredLanguage?: 'Arabic' | 'English';
  isActive?: boolean;
  emailVerified?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  minBookings?: number;
  maxBookings?: number;
  minSpent?: number;
  maxSpent?: number;
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
}

export interface AdminCustomerDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userRole: string;
  preferredLanguage: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginDate?: string;
  lastBookingDate?: string;
  totalBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  totalLoyaltyPoints: number;
  availableLoyaltyPoints: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
}

export interface AwardLoyaltyPointsDto {
  customerId: string;
  points: number;
  reason: string;
  expiryDate?: string;
}

export interface RedeemLoyaltyPointsDto {
  customerId: string;
  points: number;
  reason: string;
}

/**
 * Admin Management DTOs
 */
export interface AdminFilterDto extends BaseFilterDto {
  name?: string;
  email?: string;
  userRole?: 'Employee' | 'BranchManager' | 'Admin' | 'SuperAdmin';
  isActive?: boolean;
  branchId?: number;
  createdDateFrom?: string;
  createdDateTo?: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userRole: string;
  preferredLanguage: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginDate?: string;
  createdByAdmin: string;
  assignedBranches: number[];
  assignedBranchNames: string[];
}

export interface CreateAdminUserDto {
  email: string;
  fullName: string;
  phoneNumber?: string;
  userRole: 'Employee' | 'BranchManager' | 'Admin' | 'SuperAdmin';
  preferredLanguage?: 'Arabic' | 'English';
  password: string;
  confirmPassword: string;
  assignedBranches?: number[];
  permissions?: string[];
  sendWelcomeEmail?: boolean;
}

/**
 * Advertisement Management DTOs
 */
export interface AdvertisementFilterDto extends BaseFilterDto {
  title?: string;
  status?: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
  type?: 'Banner' | 'Popup' | 'Sidebar';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface AdminAdvertisementDto {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  linkUrl?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  displayOrder: number;
  targetAudience?: string;
  clickCount: number;
  impressionCount: number;
  clickThroughRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateAdvertisementDto {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'Banner' | 'Popup' | 'Sidebar';
  status: 'Active' | 'Inactive' | 'Scheduled';
  startDate: string;
  endDate: string;
  displayOrder?: number;
  targetAudience?: string;
}

export interface UpdateAdvertisementStatusDto {
  status: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
}

/**
 * Branch Management DTOs
 */
export interface BranchDto {
  id: number;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  workingHours: string;
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  monthlyRevenue: number;
}

export interface CreateBranchDto {
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  workingHours: string;
}
