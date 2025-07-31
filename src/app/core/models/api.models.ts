// API Response Models based on the Admin API Documentation

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
  totalCount: number;
  pageNumber: number;
  pageSize: number;
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
  status?: 'Available' | 'Rented' | 'Maintenance' | 'OutOfService';
  categoryId?: number;
  branchId?: number;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  dailyRateFrom?: number;
  dailyRateTo?: number;
  transmissionType?: 'Manual' | 'Automatic';
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
}

export interface AdminCarDto {
  id: number;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  seatingCapacity: number;
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
  categoryId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  totalRevenue: number;
  utilizationRate: number;
  lastBookingDate?: string;
  nextMaintenanceDate?: string;
}

export interface AdminCreateCarDto {
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  seatingCapacity: number;
  transmissionType: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  status?: 'Available' | 'Rented' | 'Maintenance' | 'OutOfService';
  imageUrl?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  mileage?: number;
  features?: string;
  categoryId: number;
  branchId: number;
}

export interface UpdateCarStatusDto {
  status: 'Available' | 'Rented' | 'Maintenance' | 'OutOfService';
  notes?: string;
}

export interface BulkCarOperationDto {
  carIds: number[];
  operation: 'delete' | 'updateStatus' | 'updateBranch' | 'updateCategory';
  newStatus?: string;
  newBranchId?: number;
  newCategoryId?: number;
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
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
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
