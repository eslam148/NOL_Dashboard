import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import {
  Branch, Vehicle, Booking, Customer, AdditionalService, AdminUser,
  DashboardStats, VehicleFilter, BookingFilter, BranchFilter,
  VehicleStatus, BookingStatus, ActivityLog
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
}
