import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import {
  Branch, Vehicle, Booking, Customer, AdditionalService, AdminUser,
  DashboardStats, VehicleFilter, BookingFilter, BranchFilter,
  VehicleStatus, BookingStatus, PaymentStatus, ActivityLog, CustomerType, RentalHistory
} from '../models/car-rental.models';

@Injectable({
  providedIn: 'root'
})
export class CarRentalService {
  private isLoading = signal(false);

  // Mock data for demonstration
  private mockBranches: Branch[] = [
    {
      id: '1',
      name: 'Downtown Branch',
      address: '123 Main Street',
      city: 'Dubai',
      country: 'UAE',
      phone: '+971-4-123-4567',
      email: 'downtown@nolrental.com',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      operatingHours: {
        monday: { open: '08:00', close: '20:00', isOpen: true },
        tuesday: { open: '08:00', close: '20:00', isOpen: true },
        wednesday: { open: '08:00', close: '20:00', isOpen: true },
        thursday: { open: '08:00', close: '20:00', isOpen: true },
        friday: { open: '08:00', close: '20:00', isOpen: true },
        saturday: { open: '09:00', close: '18:00', isOpen: true },
        sunday: { open: '09:00', close: '18:00', isOpen: true }
      },
      manager: 'Ahmed Al-Rashid',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      name: 'Airport Branch',
      address: 'Dubai International Airport, Terminal 3',
      city: 'Dubai',
      country: 'UAE',
      phone: '+971-4-987-6543',
      email: 'airport@nolrental.com',
      coordinates: { lat: 25.2532, lng: 55.3657 },
      operatingHours: {
        monday: { open: '06:00', close: '23:00', isOpen: true },
        tuesday: { open: '06:00', close: '23:00', isOpen: true },
        wednesday: { open: '06:00', close: '23:00', isOpen: true },
        thursday: { open: '06:00', close: '23:00', isOpen: true },
        friday: { open: '06:00', close: '23:00', isOpen: true },
        saturday: { open: '06:00', close: '23:00', isOpen: true },
        sunday: { open: '06:00', close: '23:00', isOpen: true }
      },
      manager: 'Sarah Johnson',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-07-18')
    }
  ];

  private mockVehicles: Vehicle[] = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      licensePlate: 'DXB-12345',
      vin: '1HGBH41JXMN109186',
      category: 'midsize',
      fuelType: 'gasoline',
      transmission: 'automatic',
      seats: 5,
      doors: 4,
      color: 'White',
      mileage: 15000,
      dailyRate: 150,
      weeklyRate: 900,
      monthlyRate: 3500,
      status: 'available',
      branchId: '1',
      features: ['GPS', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
      images: ['camry1.jpg', 'camry2.jpg'],
      maintenanceHistory: [],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      make: 'BMW',
      model: 'X5',
      year: 2024,
      licensePlate: 'DXB-67890',
      vin: '5UXWX7C5XBA123456',
      category: 'luxury',
      fuelType: 'gasoline',
      transmission: 'automatic',
      seats: 7,
      doors: 5,
      color: 'Black',
      mileage: 5000,
      dailyRate: 350,
      weeklyRate: 2100,
      monthlyRate: 8000,
      status: 'rented',
      branchId: '1',
      features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Sound'],
      images: ['bmwx5_1.jpg', 'bmwx5_2.jpg'],
      maintenanceHistory: [],
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-07-19')
    },
    {
      id: '3',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      licensePlate: 'DXB-11111',
      vin: '2HGFC2F59NH123456',
      category: 'compact',
      fuelType: 'gasoline',
      transmission: 'manual',
      seats: 5,
      doors: 4,
      color: 'Silver',
      mileage: 25000,
      dailyRate: 120,
      status: 'available',
      branchId: '2',
      features: ['Bluetooth', 'USB Ports'],
      images: ['civic1.jpg'],
      maintenanceHistory: [],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-07-18')
    }
  ];

  constructor() {}

  // Loading state
  getLoadingState(): boolean {
    return this.isLoading();
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardStats> {
    this.isLoading.set(true);
    return of({
      totalVehicles: 45,
      availableVehicles: 32,
      activeBookings: 18,
      totalRevenue: 125000,
      monthlyRevenue: 45000,
      totalBranches: 5,
      totalCustomers: 1250,
      maintenanceAlerts: 3
    }).pipe(
      delay(1000),
      map(stats => {
        this.isLoading.set(false);
        return stats;
      })
    );
  }

  // Branch Management
  getBranches(filter?: BranchFilter): Observable<Branch[]> {
    this.isLoading.set(true);
    let filteredBranches = [...this.mockBranches];

    if (filter) {
      if (filter.status) {
        filteredBranches = filteredBranches.filter(b => b.status === filter.status);
      }
      if (filter.city) {
        filteredBranches = filteredBranches.filter(b => 
          b.city.toLowerCase().includes(filter.city!.toLowerCase())
        );
      }
    }

    return of(filteredBranches).pipe(
      delay(800),
      map(branches => {
        this.isLoading.set(false);
        return branches;
      })
    );
  }

  getBranchById(id: string): Observable<Branch | null> {
    const branch = this.mockBranches.find(b => b.id === id) || null;
    return of(branch).pipe(delay(500));
  }

  createBranch(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Observable<Branch> {
    const newBranch: Branch = {
      ...branch,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockBranches.push(newBranch);
    return of(newBranch).pipe(delay(1000));
  }

  updateBranch(id: string, updates: Partial<Branch>): Observable<Branch> {
    const index = this.mockBranches.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBranches[index] = {
        ...this.mockBranches[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockBranches[index]).pipe(delay(1000));
    }
    throw new Error('Branch not found');
  }

  deleteBranch(id: string): Observable<boolean> {
    const index = this.mockBranches.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBranches.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  // Vehicle Management
  getVehicles(filter?: VehicleFilter): Observable<Vehicle[]> {
    this.isLoading.set(true);
    let filteredVehicles = [...this.mockVehicles];

    if (filter) {
      if (filter.category) {
        filteredVehicles = filteredVehicles.filter(v => v.category === filter.category);
      }
      if (filter.status) {
        filteredVehicles = filteredVehicles.filter(v => v.status === filter.status);
      }
      if (filter.branchId) {
        filteredVehicles = filteredVehicles.filter(v => v.branchId === filter.branchId);
      }
    }

    return of(filteredVehicles).pipe(
      delay(800),
      map(vehicles => {
        this.isLoading.set(false);
        return vehicles;
      })
    );
  }

  getVehicleById(id: string): Observable<Vehicle | null> {
    const vehicle = this.mockVehicles.find(v => v.id === id) || null;
    return of(vehicle).pipe(delay(500));
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockVehicles.push(newVehicle);
    return of(newVehicle).pipe(delay(1000));
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Observable<Vehicle> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.mockVehicles[index] = {
        ...this.mockVehicles[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockVehicles[index]).pipe(delay(1000));
    }
    throw new Error('Vehicle not found');
  }

  deleteVehicle(id: string): Observable<boolean> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.mockVehicles.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  updateVehicleStatus(id: string, status: VehicleStatus): Observable<Vehicle> {
    return this.updateVehicle(id, { status });
  }

  // Additional Services Management
  private mockServices: AdditionalService[] = [
    {
      id: '1',
      name: 'GPS Navigation System',
      description: 'Advanced GPS navigation with real-time traffic updates',
      category: 'navigation',
      dailyRate: 15,
      weeklyRate: 90,
      monthlyRate: 300,
      isAvailable: true,
      maxQuantity: 50,
      icon: 'bi-compass',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      name: 'Child Safety Seat',
      description: 'Premium child safety seat for ages 2-8 years',
      category: 'safety',
      dailyRate: 12,
      weeklyRate: 70,
      monthlyRate: 250,
      isAvailable: true,
      maxQuantity: 25,
      icon: 'bi-person-hearts',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-07-18')
    },
    {
      id: '3',
      name: 'Comprehensive Insurance',
      description: 'Full coverage insurance with zero deductible',
      category: 'insurance',
      dailyRate: 25,
      weeklyRate: 150,
      monthlyRate: 500,
      isAvailable: true,
      maxQuantity: 100,
      icon: 'bi-shield-check',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-07-15')
    },
    {
      id: '4',
      name: 'Ski Equipment Rack',
      description: 'Professional ski and snowboard equipment rack',
      category: 'equipment',
      dailyRate: 20,
      weeklyRate: 120,
      monthlyRate: 400,
      isAvailable: false,
      maxQuantity: 15,
      icon: 'bi-snow2',
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-07-10')
    },
    {
      id: '5',
      name: 'Premium Comfort Package',
      description: 'Luxury seat covers, air freshener, and premium amenities',
      category: 'comfort',
      dailyRate: 18,
      weeklyRate: 100,
      monthlyRate: 350,
      isAvailable: true,
      maxQuantity: 30,
      icon: 'bi-star',
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-07-12')
    }
  ];

  getAdditionalServices(): Observable<AdditionalService[]> {
    this.isLoading.set(true);
    return of([...this.mockServices]).pipe(
      delay(800),
      map(services => {
        this.isLoading.set(false);
        return services;
      })
    );
  }

  getServiceById(id: string): Observable<AdditionalService | null> {
    const service = this.mockServices.find(s => s.id === id) || null;
    return of(service).pipe(delay(500));
  }

  createService(service: Omit<AdditionalService, 'id' | 'createdAt' | 'updatedAt'>): Observable<AdditionalService> {
    const newService: AdditionalService = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockServices.push(newService);
    return of(newService).pipe(delay(1000));
  }

  updateService(id: string, updates: Partial<AdditionalService>): Observable<AdditionalService> {
    const index = this.mockServices.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockServices[index] = {
        ...this.mockServices[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockServices[index]).pipe(delay(1000));
    }
    throw new Error('Service not found');
  }

  deleteService(id: string): Observable<boolean> {
    const index = this.mockServices.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockServices.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  toggleServiceAvailability(id: string): Observable<AdditionalService> {
    const service = this.mockServices.find(s => s.id === id);
    if (service) {
      service.isAvailable = !service.isAvailable;
      service.updatedAt = new Date();
      return of(service).pipe(delay(500));
    }
    throw new Error('Service not found');
  }

  // Admin User Management
  private mockAdminUsers: AdminUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@nolrental.com',
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      role: 'super_admin',
      permissions: [
        { resource: 'branches', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] }
      ],
      branchIds: [],
      isActive: true,
      lastLogin: new Date('2024-07-25T08:30:00'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      username: 'manager_dubai',
      email: 'manager.dubai@nolrental.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'branch_manager',
      permissions: [
        { resource: 'branches', actions: ['read', 'update'] },
        { resource: 'vehicles', actions: ['create', 'read', 'update'] },
        { resource: 'bookings', actions: ['create', 'read', 'update'] }
      ],
      branchIds: ['1', '2'],
      isActive: true,
      lastLogin: new Date('2024-07-24T14:15:00'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-07-18')
    },
    {
      id: '3',
      username: 'staff_001',
      email: 'staff001@nolrental.com',
      firstName: 'Mohammed',
      lastName: 'Hassan',
      role: 'staff',
      permissions: [
        { resource: 'vehicles', actions: ['read', 'update'] },
        { resource: 'bookings', actions: ['create', 'read', 'update'] }
      ],
      branchIds: ['1'],
      isActive: true,
      lastLogin: new Date('2024-07-25T09:45:00'),
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-07-22')
    },
    {
      id: '4',
      username: 'viewer_001',
      email: 'viewer001@nolrental.com',
      firstName: 'Fatima',
      lastName: 'Al-Zahra',
      role: 'viewer',
      permissions: [
        { resource: 'branches', actions: ['read'] },
        { resource: 'vehicles', actions: ['read'] },
        { resource: 'bookings', actions: ['read'] }
      ],
      branchIds: ['1', '2'],
      isActive: false,
      lastLogin: new Date('2024-07-20T16:30:00'),
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-07-15')
    }
  ];

  private mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      userId: '1',
      user: this.mockAdminUsers[0],
      action: 'CREATE',
      resource: 'vehicle',
      resourceId: '1',
      details: { make: 'Toyota', model: 'Camry', licensePlate: 'DXB-12345' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date('2024-07-25T10:30:00')
    },
    {
      id: '2',
      userId: '2',
      user: this.mockAdminUsers[1],
      action: 'UPDATE',
      resource: 'booking',
      resourceId: '5',
      details: { status: 'confirmed', previousStatus: 'pending' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: new Date('2024-07-25T09:15:00')
    },
    {
      id: '3',
      userId: '3',
      user: this.mockAdminUsers[2],
      action: 'READ',
      resource: 'vehicle',
      resourceId: '2',
      details: { action: 'view_details' },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      timestamp: new Date('2024-07-25T08:45:00')
    }
  ];

  getAdminUsers(): Observable<AdminUser[]> {
    this.isLoading.set(true);
    return of([...this.mockAdminUsers]).pipe(
      delay(800),
      map(users => {
        this.isLoading.set(false);
        return users;
      })
    );
  }

  getAdminUserById(id: string): Observable<AdminUser | null> {
    const user = this.mockAdminUsers.find(u => u.id === id) || null;
    return of(user).pipe(delay(500));
  }

  createAdminUser(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Observable<AdminUser> {
    const newUser: AdminUser = {
      ...user,
      id: Date.now().toString(),
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockAdminUsers.push(newUser);
    return of(newUser).pipe(delay(1000));
  }

  updateAdminUser(id: string, updates: Partial<AdminUser>): Observable<AdminUser> {
    const index = this.mockAdminUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockAdminUsers[index] = {
        ...this.mockAdminUsers[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockAdminUsers[index]).pipe(delay(1000));
    }
    throw new Error('Admin user not found');
  }

  deleteAdminUser(id: string): Observable<boolean> {
    const index = this.mockAdminUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockAdminUsers.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  toggleAdminUserStatus(id: string): Observable<AdminUser> {
    const user = this.mockAdminUsers.find(u => u.id === id);
    if (user) {
      user.isActive = !user.isActive;
      user.updatedAt = new Date();
      return of(user).pipe(delay(500));
    }
    throw new Error('Admin user not found');
  }

  getActivityLogs(userId?: string): Observable<ActivityLog[]> {
    this.isLoading.set(true);
    let logs = [...this.mockActivityLogs];

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    return of(logs).pipe(
      delay(600),
      map(logs => {
        this.isLoading.set(false);
        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      })
    );
  }

  // Customer Management
  private mockCustomers: Customer[] = [
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Al-Mansouri',
      email: 'ahmed.mansouri@email.com',
      phone: '+971-50-123-4567',
      dateOfBirth: new Date('1985-03-15'),
      nationality: 'UAE',
      licenseNumber: 'DL-12345678',
      licenseExpiryDate: new Date('2026-03-15'),
      address: {
        street: '123 Sheikh Zayed Road',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        zipCode: '12345'
      },
      emergencyContact: {
        name: 'Fatima Al-Mansouri',
        phone: '+971-50-987-6543',
        relationship: 'Spouse'
      },
      customerType: 'premium',
      loyaltyPoints: 2500,
      totalRentals: 15,
      totalSpent: 12500,
      averageRating: 4.8,
      isActive: true,
      isBlacklisted: false,
      notes: 'Excellent customer, always returns vehicles in perfect condition.',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-07-20'),
      lastRentalDate: new Date('2024-07-15')
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+971-55-234-5678',
      dateOfBirth: new Date('1990-07-22'),
      nationality: 'USA',
      licenseNumber: 'US-87654321',
      licenseExpiryDate: new Date('2025-07-22'),
      address: {
        street: '456 Marina Walk',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        zipCode: '54321'
      },
      emergencyContact: {
        name: 'John Johnson',
        phone: '+1-555-123-4567',
        relationship: 'Father'
      },
      customerType: 'regular',
      loyaltyPoints: 850,
      totalRentals: 8,
      totalSpent: 4200,
      averageRating: 4.5,
      isActive: true,
      isBlacklisted: false,
      notes: 'Tourist customer, prefers luxury vehicles.',
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-07-18'),
      lastRentalDate: new Date('2024-07-10')
    },
    {
      id: '3',
      firstName: 'Mohammed',
      lastName: 'Hassan',
      email: 'mohammed.hassan@email.com',
      phone: '+971-52-345-6789',
      dateOfBirth: new Date('1988-11-08'),
      nationality: 'Egypt',
      licenseNumber: 'EG-11223344',
      licenseExpiryDate: new Date('2025-11-08'),
      address: {
        street: '789 Al Wasl Road',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        zipCode: '67890'
      },
      emergencyContact: {
        name: 'Amira Hassan',
        phone: '+971-52-987-6543',
        relationship: 'Sister'
      },
      customerType: 'corporate',
      loyaltyPoints: 1200,
      totalRentals: 12,
      totalSpent: 8900,
      averageRating: 4.2,
      isActive: true,
      isBlacklisted: false,
      notes: 'Corporate account, frequent business traveler.',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-07-22'),
      lastRentalDate: new Date('2024-07-20')
    },
    {
      id: '4',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@email.com',
      phone: '+971-56-456-7890',
      dateOfBirth: new Date('1992-05-12'),
      nationality: 'Singapore',
      licenseNumber: 'SG-99887766',
      licenseExpiryDate: new Date('2024-12-31'),
      address: {
        street: '321 Business Bay',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        zipCode: '98765'
      },
      emergencyContact: {
        name: 'David Chen',
        phone: '+65-9876-5432',
        relationship: 'Brother'
      },
      customerType: 'regular',
      loyaltyPoints: 450,
      totalRentals: 3,
      totalSpent: 1800,
      averageRating: 4.0,
      isActive: false,
      isBlacklisted: true,
      notes: 'Late return issues, payment disputes.',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-06-30'),
      lastRentalDate: new Date('2024-06-25')
    }
  ];

  private mockRentalHistory: RentalHistory[] = [
    {
      id: '1',
      customerId: '1',
      vehicleId: '1',
      vehicle: { make: 'Toyota', model: 'Camry', year: 2023, licensePlate: 'DXB-12345' },
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-18'),
      actualReturnDate: new Date('2024-07-18'),
      totalDays: 3,
      dailyRate: 150,
      totalAmount: 450,
      status: 'completed',
      pickupLocation: 'Dubai International Airport',
      dropoffLocation: 'Dubai International Airport',
      mileageStart: 15000,
      mileageEnd: 15350,
      fuelLevelStart: 'full',
      fuelLevelEnd: 'full',
      damages: [],
      rating: 5,
      review: 'Excellent service and clean vehicle!'
    },
    {
      id: '2',
      customerId: '1',
      vehicleId: '2',
      vehicle: { make: 'BMW', model: 'X5', year: 2023, licensePlate: 'DXB-67890' },
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-15'),
      actualReturnDate: new Date('2024-06-15'),
      totalDays: 5,
      dailyRate: 250,
      totalAmount: 1250,
      status: 'completed',
      pickupLocation: 'Downtown Dubai',
      dropoffLocation: 'Dubai Mall',
      mileageStart: 8000,
      mileageEnd: 8420,
      fuelLevelStart: 'full',
      fuelLevelEnd: '3/4',
      damages: [],
      rating: 5,
      review: 'Perfect for family trip!'
    },
    {
      id: '3',
      customerId: '2',
      vehicleId: '3',
      vehicle: { make: 'Mercedes', model: 'C-Class', year: 2023, licensePlate: 'DXB-11111' },
      startDate: new Date('2024-07-10'),
      endDate: new Date('2024-07-12'),
      actualReturnDate: new Date('2024-07-12'),
      totalDays: 2,
      dailyRate: 200,
      totalAmount: 400,
      status: 'completed',
      pickupLocation: 'Dubai Marina',
      dropoffLocation: 'Dubai Marina',
      mileageStart: 12000,
      mileageEnd: 12180,
      fuelLevelStart: 'full',
      fuelLevelEnd: 'full',
      damages: [],
      rating: 4,
      review: 'Good car, smooth ride.'
    }
  ];

  getCustomers(): Observable<Customer[]> {
    this.isLoading.set(true);
    return of([...this.mockCustomers]).pipe(
      delay(800),
      map(customers => {
        this.isLoading.set(false);
        return customers;
      })
    );
  }

  getCustomerById(id: string): Observable<Customer | null> {
    const customer = this.mockCustomers.find(c => c.id === id) || null;
    return of(customer).pipe(delay(500));
  }

  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRentals' | 'totalSpent' | 'loyaltyPoints' | 'averageRating'>): Observable<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      totalRentals: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockCustomers.push(newCustomer);
    return of(newCustomer).pipe(delay(1000));
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers[index] = {
        ...this.mockCustomers[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockCustomers[index]).pipe(delay(1000));
    }
    throw new Error('Customer not found');
  }

  deleteCustomer(id: string): Observable<boolean> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  toggleCustomerStatus(id: string): Observable<Customer> {
    const customer = this.mockCustomers.find(c => c.id === id);
    if (customer) {
      customer.isActive = !customer.isActive;
      customer.updatedAt = new Date();
      return of(customer).pipe(delay(500));
    }
    throw new Error('Customer not found');
  }

  toggleCustomerBlacklist(id: string): Observable<Customer> {
    const customer = this.mockCustomers.find(c => c.id === id);
    if (customer) {
      customer.isBlacklisted = !customer.isBlacklisted;
      customer.updatedAt = new Date();
      return of(customer).pipe(delay(500));
    }
    throw new Error('Customer not found');
  }

  getCustomerRentalHistory(customerId: string): Observable<RentalHistory[]> {
    const history = this.mockRentalHistory.filter(rental => rental.customerId === customerId);
    return of(history).pipe(
      delay(600),
      map(history => history.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()))
    );
  }

  // Booking Management
  private mockBookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'NOL-2024-001',
      customerId: '1',
      customer: this.mockCustomers[0],
      vehicleId: '1',
      vehicle: {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        licensePlate: 'DXB-12345',
        category: 'midsize',
        dailyRate: 150
      },
      startDate: new Date('2024-07-28'),
      endDate: new Date('2024-07-31'),
      totalDays: 3,
      dailyRate: 150,
      subtotal: 450,
      taxes: 22.5,
      fees: 15,
      totalAmount: 487.5,
      status: 'confirmed',
      paymentStatus: 'paid',
      pickupLocation: 'Dubai International Airport',
      dropoffLocation: 'Dubai International Airport',
      pickupTime: '10:00',
      dropoffTime: '10:00',
      additionalServices: [
        { serviceId: '1', name: 'GPS Navigation System', dailyRate: 15, totalAmount: 45 }
      ],
      specialRequests: 'Please ensure the vehicle is clean and fueled.',
      driverLicense: 'DL-12345678',
      emergencyContact: {
        name: 'Fatima Al-Mansouri',
        phone: '+971-50-987-6543'
      },
      createdAt: new Date('2024-07-25T09:30:00'),
      updatedAt: new Date('2024-07-25T14:20:00'),
      createdBy: 'customer',
      notes: 'VIP customer - priority service'
    },
    {
      id: '2',
      bookingNumber: 'NOL-2024-002',
      customerId: '2',
      customer: this.mockCustomers[1],
      vehicleId: '2',
      vehicle: {
        id: '2',
        make: 'BMW',
        model: 'X5',
        year: 2023,
        licensePlate: 'DXB-67890',
        category: 'suv',
        dailyRate: 250
      },
      startDate: new Date('2024-07-30'),
      endDate: new Date('2024-08-05'),
      totalDays: 6,
      dailyRate: 250,
      subtotal: 1500,
      taxes: 75,
      fees: 25,
      totalAmount: 1600,
      status: 'pending',
      paymentStatus: 'pending',
      pickupLocation: 'Downtown Dubai',
      dropoffLocation: 'Dubai Mall',
      pickupTime: '14:00',
      dropoffTime: '18:00',
      additionalServices: [
        { serviceId: '2', name: 'Child Safety Seat', dailyRate: 12, totalAmount: 72 },
        { serviceId: '3', name: 'Comprehensive Insurance', dailyRate: 25, totalAmount: 150 }
      ],
      specialRequests: 'Need child seat for 5-year-old.',
      driverLicense: 'US-87654321',
      emergencyContact: {
        name: 'John Johnson',
        phone: '+1-555-123-4567'
      },
      createdAt: new Date('2024-07-26T11:15:00'),
      updatedAt: new Date('2024-07-26T11:15:00'),
      createdBy: 'admin',
      notes: 'Tourist booking - verify international license'
    },
    {
      id: '3',
      bookingNumber: 'NOL-2024-003',
      customerId: '3',
      customer: this.mockCustomers[2],
      vehicleId: '3',
      vehicle: {
        id: '3',
        make: 'Mercedes',
        model: 'C-Class',
        year: 2023,
        licensePlate: 'DXB-11111',
        category: 'luxury',
        dailyRate: 200
      },
      startDate: new Date('2024-07-26'),
      endDate: new Date('2024-07-28'),
      totalDays: 2,
      dailyRate: 200,
      subtotal: 400,
      taxes: 20,
      fees: 10,
      totalAmount: 430,
      status: 'active',
      paymentStatus: 'paid',
      pickupLocation: 'Business Bay',
      dropoffLocation: 'Business Bay',
      pickupTime: '09:00',
      dropoffTime: '17:00',
      additionalServices: [],
      specialRequests: '',
      driverLicense: 'EG-11223344',
      emergencyContact: {
        name: 'Amira Hassan',
        phone: '+971-52-987-6543'
      },
      createdAt: new Date('2024-07-24T16:45:00'),
      updatedAt: new Date('2024-07-26T09:00:00'),
      createdBy: 'customer',
      notes: 'Corporate account - expedited processing'
    },
    {
      id: '4',
      bookingNumber: 'NOL-2024-004',
      customerId: '1',
      customer: this.mockCustomers[0],
      vehicleId: '4',
      vehicle: {
        id: '4',
        make: 'Nissan',
        model: 'Altima',
        year: 2022,
        licensePlate: 'DXB-22222',
        category: 'midsize',
        dailyRate: 120
      },
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-22'),
      totalDays: 2,
      dailyRate: 120,
      subtotal: 240,
      taxes: 12,
      fees: 8,
      totalAmount: 260,
      status: 'completed',
      paymentStatus: 'paid',
      pickupLocation: 'Dubai Marina',
      dropoffLocation: 'Dubai Marina',
      pickupTime: '12:00',
      dropoffTime: '12:00',
      additionalServices: [
        { serviceId: '1', name: 'GPS Navigation System', dailyRate: 15, totalAmount: 30 }
      ],
      specialRequests: '',
      driverLicense: 'DL-12345678',
      emergencyContact: {
        name: 'Fatima Al-Mansouri',
        phone: '+971-50-987-6543'
      },
      createdAt: new Date('2024-07-18T10:20:00'),
      updatedAt: new Date('2024-07-22T12:30:00'),
      createdBy: 'customer',
      notes: 'Completed successfully - excellent customer'
    },
    {
      id: '5',
      bookingNumber: 'NOL-2024-005',
      customerId: '4',
      customer: this.mockCustomers[3],
      vehicleId: '5',
      vehicle: {
        id: '5',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        licensePlate: 'DXB-33333',
        category: 'compact',
        dailyRate: 100
      },
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-17'),
      totalDays: 2,
      dailyRate: 100,
      subtotal: 200,
      taxes: 10,
      fees: 5,
      totalAmount: 215,
      status: 'cancelled',
      paymentStatus: 'refunded',
      pickupLocation: 'Dubai International Airport',
      dropoffLocation: 'Dubai International Airport',
      pickupTime: '15:00',
      dropoffTime: '15:00',
      additionalServices: [],
      specialRequests: '',
      driverLicense: 'SG-99887766',
      emergencyContact: {
        name: 'David Chen',
        phone: '+65-9876-5432'
      },
      createdAt: new Date('2024-07-12T14:30:00'),
      updatedAt: new Date('2024-07-14T09:15:00'),
      createdBy: 'customer',
      notes: 'Cancelled due to travel changes - full refund processed'
    }
  ];

  getBookings(): Observable<Booking[]> {
    this.isLoading.set(true);
    return of([...this.mockBookings]).pipe(
      delay(800),
      map(bookings => {
        this.isLoading.set(false);
        return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      })
    );
  }

  getBookingById(id: string): Observable<Booking | null> {
    const booking = this.mockBookings.find(b => b.id === id) || null;
    return of(booking).pipe(delay(500));
  }

  createBooking(booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      bookingNumber: `NOL-2024-${String(this.mockBookings.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockBookings.push(newBooking);
    return of(newBooking).pipe(delay(1000));
  }

  updateBooking(id: string, updates: Partial<Booking>): Observable<Booking> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBookings[index] = {
        ...this.mockBookings[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockBookings[index]).pipe(delay(1000));
    }
    throw new Error('Booking not found');
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.updateBooking(id, { status });
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Observable<Booking> {
    return this.updateBooking(id, { paymentStatus });
  }

  deleteBooking(id: string): Observable<boolean> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBookings.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    const customerBookings = this.mockBookings.filter(booking => booking.customerId === customerId);
    return of(customerBookings).pipe(
      delay(600),
      map(bookings => bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    );
  }

  getBookingsByDateRange(startDate: Date, endDate: Date): Observable<Booking[]> {
    const filteredBookings = this.mockBookings.filter(booking =>
      booking.startDate >= startDate && booking.endDate <= endDate
    );
    return of(filteredBookings).pipe(
      delay(600),
      map(bookings => bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    );
  }
}
