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
  weeklyRate: number;
  monthlyRate: number;
  status: VehicleStatus;
  branchId: string;
  features: string[];
  images: string[];
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
  vehicle: Vehicle;
  branchId: string;
  branch: Branch;
  startDate: Date;
  endDate: Date;
  pickupTime: string;
  returnTime: string;
  status: BookingStatus;
  totalDays: number;
  baseRate: number;
  additionalServices: BookedService[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  licenseNumber: string;
  licenseExpiryDate: Date;
  address: string;
  city: string;
  country: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  role: AdminRole;
  permissions: Permission[];
  branchIds: string[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
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
