// Car Rental System Data Models

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  manager: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  category: VehicleCategory;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  doors: number;
  color: string;
  mileage: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  status: VehicleStatus;
  branchId: string;
  features?: string[];
  images?: string[];
  notes?: string;
  insuranceExpiry?: Date;
  registrationExpiry?: Date;
  maintenanceHistory: MaintenanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleCategory = 'economy' | 'compact' | 'midsize' | 'fullsize' | 'luxury' | 'suv' | 'van' | 'truck';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'out_of_service' | 'reserved';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection' | 'cleaning';
  description: string;
  cost: number;
  performedBy: string;
  performedAt: Date;
  nextMaintenanceDate?: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer: Customer;
  vehicleId: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    category: VehicleCategory;
    dailyRate: number;
  };
  startDate: Date;
  endDate: Date;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  additionalServices: {
    serviceId: string;
    name: string;
    dailyRate: number;
    totalAmount: number;
  }[];
  specialRequests?: string;
  driverLicense: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'customer' | 'admin';
  notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'Open' | 'completed' | 'Canceled' ;
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type CustomerType = 'regular' | 'premium' | 'corporate';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: Date;
  nationality: string;
  gender?: 'male' | 'female' | 'other';
  driverLicense: {
    number: string;
    issuingCountry: string;
    issueDate: Date;
    expiryDate: Date;
    licenseClass: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  customerType: CustomerType;
  preferredLanguage?: 'en' | 'ar';
  marketingConsent: boolean;
  profileImage?: string;
  loyaltyPoints: number;
  totalRentals: number;
  totalSpent: number;
  averageRating: number;
  status: 'active' | 'inactive' | 'blocked';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents?: {
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    passport?: string;
    nationalId?: string;
  };
  preferences?: {
    vehicleType?: string[];
    features?: string[];
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastRentalDate?: Date;
  createdBy: string;
  isActive: boolean;
  isBlacklisted: boolean;
  licenseNumber:string;

}

export interface RentalHistory {
  id: string;
  customerId: string;
  vehicleId: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  mileageStart: number;
  mileageEnd?: number;
  fuelLevelStart: string;
  fuelLevelEnd?: string;
  damages: string[];
  rating?: number;
  review?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  isAvailable: boolean;
  maxQuantity: number;
  icon: string;
  image?: string;
  features?: string[];
  restrictions?: string[];
  minimumRentalDays?: number;
  availableAtBranches?: string[];
  popularityScore?: number;
  discountPercentage?: number;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type ServiceCategory = 'navigation' | 'safety' | 'comfort' | 'insurance' | 'equipment';

export interface BookedService {
  serviceId: string;
  service: AdditionalService;
  quantity: number;
  dailyRate: number;
  totalAmount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  alternatePhone?: string;
  role: AdminRole;
  permissions: Permission[];
  branchIds: string[];
  status: 'active' | 'inactive' | 'suspended';
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  employeeId?: string;
  department?: string;
  hireDate?: Date;
  salary?: number;
  notes?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
 }

export type AdminRole = 'super_admin' | 'branch_manager' | 'staff' | 'viewer';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: AdminUser;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Dashboard Statistics
export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBranches: number;
  totalCustomers: number;
  maintenanceAlerts: number;
}

// Filter and Search Interfaces
export interface VehicleFilter {
  category?: VehicleCategory;
  status?: VehicleStatus;
  branchId?: string;
  make?: string;
  fuelType?: string;
  transmission?: string;
  minRate?: number;
  maxRate?: number;
}

export interface BookingFilter {
  status?: BookingStatus;
  branchId?: string;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  vehicleId?: string;
}

export interface BranchFilter {
  status?: 'active' | 'inactive' | 'maintenance';
  city?: string;
  country?: string;
}

// Advertisement Management
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl?: string;
  type: AdvertisementType;
  status: AdvertisementStatus;
  startDate: Date;
  endDate: Date;
  targetAudience: TargetAudience;
  budget?: number;
  impressions: number;
  clicks: number;
  conversions: number;
  priority: number;
  branchIds?: string[];
  vehicleCategories?: VehicleCategory[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdvertisementType = 'banner' | 'popup' | 'sidebar' | 'featured' | 'promotion';
export type AdvertisementStatus = 'draft' | 'active' | 'paused' | 'expired' | 'archived';

export interface TargetAudience {
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: 'male' | 'female' | 'all';
  location?: string[];
  interests?: string[];
  customerType?: CustomerType[];
}

export interface AdvertisementAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  costPerClick?: number;
  costPerConversion?: number;
  revenueGenerated?: number;
  topPerformingAds: Advertisement[];
  performanceByType: {
    type: AdvertisementType;
    impressions: number;
    clicks: number;
    conversions: number;
  }[];
}

export interface AdvertisementFilter {
  type?: AdvertisementType;
  status?: AdvertisementStatus;
  branchId?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}


