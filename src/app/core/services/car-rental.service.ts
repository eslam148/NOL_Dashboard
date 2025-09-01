import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay, map, catchError, throwError, switchMap } from 'rxjs';
import {
  Branch, Vehicle, Booking, Customer, AdditionalService, AdminUser, AdminRole,
  DashboardStats, VehicleFilter, BookingFilter, BranchFilter,
  VehicleStatus, VehicleCategory, BookingStatus, PaymentStatus, ActivityLog, CustomerType, RentalHistory,
  Advertisement, AdvertisementFilter, AdvertisementAnalytics, AdvertisementType, AdvertisementStatus
} from '../models/car-rental.models';
import { CarApiService } from './car-api.service';
import { AdminApiService } from './admin-api.service';
import { BookingApiService } from './booking-api.service';
import { AdvertisementApiService } from './advertisement-api.service';
import { BranchApiService } from './branch-api.service';
import { DashboardApiService } from './dashboard-api.service';
import { CustomerApiService } from './customer-api.service';
import {
  AdminCarDto,
  AdminCreateCarDto,
  AdminUpdateCarDto,
  CarFilterDto,
  UpdateCarStatusDto,
  BulkCarOperationDto,
  CarImportDto,
  CarAnalyticsDto,
  CarMaintenanceRecordDto,
  MonthlyCarRevenueDto,
  CarBookingTrendDto,
  FuelType,
  TransmissionType,
  CarStatus,
  PaginatedResponse,
  AdminUserDto,
  CreateAdminUserDto,
  AdminFilterDto,
  AdminBookingDto,
  AdminCreateBookingDto,
  BookingFilterDto,
  UpdateBookingStatusDto,
  CancelBookingDto
} from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarRentalService {
  private carApiService = inject(CarApiService);
  private adminApiService = inject(AdminApiService);
  private bookingApiService = inject(BookingApiService);
  private advertisementApiService = inject(AdvertisementApiService);
  private branchApiService = inject(BranchApiService);
  private dashboardApiService = inject(DashboardApiService);
  private customerApiService = inject(CustomerApiService);
  private isLoading = signal(false);

  // Feature flags for API integration
  private useRealApi = !environment.features.mockData;

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
  getDashboardStats(filter?: any): Observable<DashboardStats> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      console.log('📊 Fetching dashboard stats with filter:', filter);

      return this.dashboardApiService.getDashboardStats(filter).pipe(
        map((dashboardStatsDto) => {
          this.isLoading.set(false);

          console.log('📦 Dashboard Stats API Response:', dashboardStatsDto);

          // Convert DashboardStatsDto to DashboardStats
          const convertedStats = this.convertDashboardStatsDtoToStats(dashboardStatsDto);
          console.log('🔄 Converted dashboard stats:', convertedStats);

          return convertedStats;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching dashboard stats:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Dashboard API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Dashboard API might be unreachable');
          }

          // Return fallback mock data instead of throwing error to prevent app crash
          return of(this.getMockDashboardStats());
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for dashboard stats');
    return of(this.getMockDashboardStats()).pipe(
      delay(1000),
      map(stats => {
        this.isLoading.set(false);
        return stats;
      })
    );
  }

  private getMockDashboardStats(): DashboardStats {
    return {
      totalVehicles: 45,
      availableVehicles: 32,
      activeBookings: 18,
      totalRevenue: 125000,
      monthlyRevenue: 45000,
      totalBranches: 5,
      totalCustomers: 1250,
      maintenanceAlerts: 3
    };
  }

  // Dashboard Analytics Methods
  getPopularCars(count: number = 10, filter?: any): Observable<any[]> {
    if (this.useRealApi) {
      console.log('📊 Fetching popular cars with count:', count, 'filter:', filter);

      return this.dashboardApiService.getPopularCars(count, filter).pipe(
        map((popularCars) => {
          console.log('📦 Popular Cars API Response:', popularCars);
          return popularCars || [];
        }),
        catchError((error) => {
          console.error('❌ Error fetching popular cars:', error);
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for popular cars');
    return of([
      { carId: 1, carInfo: 'Toyota Camry 2023', bookingCount: 25, revenue: 15000 },
      { carId: 2, carInfo: 'Honda Accord 2023', bookingCount: 22, revenue: 13500 },
      { carId: 3, carInfo: 'Nissan Altima 2023', bookingCount: 18, revenue: 11000 }
    ]).pipe(delay(800));
  }

  getRecentBookings(count: number = 10): Observable<any[]> {
    if (this.useRealApi) {
      console.log('📊 Fetching recent bookings with count:', count);

      return this.dashboardApiService.getRecentBookings(count).pipe(
        map((recentBookings) => {
          console.log('📦 Recent Bookings API Response:', recentBookings);
          return recentBookings || [];
        }),
        catchError((error) => {
          console.error('❌ Error fetching recent bookings:', error);
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for recent bookings');
    return of([
      { id: 1, customerName: 'Ahmed Al-Mansouri', carInfo: 'Toyota Camry', status: 'Active', totalAmount: 450 },
      { id: 2, customerName: 'Sarah Johnson', carInfo: 'Honda Accord', status: 'Completed', totalAmount: 380 },
      { id: 3, customerName: 'Mohammed Ali', carInfo: 'Nissan Altima', status: 'Pending', totalAmount: 320 }
    ]).pipe(delay(800));
  }

  getRevenueAnalytics(filter?: any): Observable<any> {
    if (this.useRealApi) {
      console.log('📊 Fetching revenue analytics with filter:', filter);

      return this.dashboardApiService.getRevenueAnalytics(filter).pipe(
        map((revenueAnalytics) => {
          console.log('📦 Revenue Analytics API Response:', revenueAnalytics);
          return revenueAnalytics;
        }),
        catchError((error) => {
          console.error('❌ Error fetching revenue analytics:', error);
          return of({});
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for revenue analytics');
    return of({
      todayRevenue: 2500,
      weekRevenue: 15000,
      monthRevenue: 45000,
      yearRevenue: 125000,
      revenueGrowthRate: 12.5
    }).pipe(delay(800));
  }

  // Branch Management
  getBranches(filter?: BranchFilter): Observable<Branch[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      // Convert BranchFilter to BranchFilterDto
      const branchFilter = this.convertBranchFilterToDto(filter);

      console.log('🏢 Fetching branches with filter:', branchFilter);

      return this.branchApiService.getBranches(branchFilter).pipe(
        map((paginatedResponse) => {
          this.isLoading.set(false);

          console.log('📦 Branch API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid branch paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Branch response data is not an array:', paginatedResponse.data);
            return [];
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} branch DTOs to Branch objects`);

          const convertedBranches = this.convertBranchDtosToBranches(paginatedResponse.data);
          console.log('🔄 Converted branches:', convertedBranches);

          return convertedBranches;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching branches:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Branch API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Branch API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for branches');
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
    if (this.useRealApi) {
      console.log('🏢 Fetching branch by ID from API:', id);

      return this.branchApiService.getBranchById(parseInt(id)).pipe(
        map((branchDto) => {
          console.log('✅ Branch API response:', branchDto);
          return this.convertBranchDtoToBranch(branchDto);
        }),
        catchError((error) => {
          console.error('❌ Error fetching branch by ID:', error);

          // Check if it's a 404 error (branch not found)
          if (error.status === 404) {
            console.warn('🔍 Branch not found with ID:', id);
            return of(null);
          }

          // For other errors, return null instead of throwing to prevent app crash
          return of(null);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for branch by ID:', id);
    const branch = this.mockBranches.find(b => b.id === id) || null;
    return of(branch).pipe(delay(500));
  }

  createBranch(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Observable<Branch> {
    if (this.useRealApi) {
      // Convert Branch to CreateBranchDto
      const createBranchDto = this.convertBranchToCreateDto(branch);

      return this.branchApiService.createBranch(createBranchDto).pipe(
        map((createdBranch) => {
          return this.convertBranchDtoToBranch(createdBranch);
        }),
        catchError((error) => {
          console.error('Error creating branch:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
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
    if (this.useRealApi) {
      // Convert partial Branch to UpdateBranchDto
      const updateBranchDto = this.convertPartialBranchToUpdateDto(updates);

      return this.branchApiService.updateBranch(parseInt(id), updateBranchDto).pipe(
        map((updatedBranch) => this.convertBranchDtoToBranch(updatedBranch)),
        catchError((error) => {
          console.error('Error updating branch:', error);
          throw error;
        })
      );
    }

    // Fallback to mock data
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
    if (this.useRealApi) {
      return this.branchApiService.deleteBranch(parseInt(id)).pipe(
        catchError((error) => {
          console.error('Error deleting branch:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockBranches.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBranches.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  // Direct API methods for new branch structure
  createBranchDirect(branchData: any): Observable<any> {
    if (this.useRealApi) {
      console.log('🏢 Creating branch with direct API call:', branchData);

      return this.branchApiService.createBranch(branchData).pipe(
        map((createdBranch) => {
          console.log('✅ Branch created successfully:', createdBranch);
          return createdBranch;
        }),
        catchError((error) => {
          console.error('❌ Error creating branch:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for branch creation');
    const newBranch = {
      id: Date.now().toString(),
      ...branchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.mockBranches.push(newBranch as any);
    return of(newBranch).pipe(delay(1000));
  }

  updateBranchDirect(id: string, branchData: any): Observable<any> {
    if (this.useRealApi) {
      console.log('🏢 Updating branch with direct API call:', id, branchData);

      return this.branchApiService.updateBranch(parseInt(id), branchData).pipe(
        map((updatedBranch) => {
          console.log('✅ Branch updated successfully:', updatedBranch);
          return updatedBranch;
        }),
        catchError((error) => {
          console.error('❌ Error updating branch:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for branch update');
    const index = this.mockBranches.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBranches[index] = {
        ...this.mockBranches[index],
        ...branchData,
        updatedAt: new Date()
      };
      return of(this.mockBranches[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }

  // Paginated branch methods
  getBranchesPaginated(filter?: any): Observable<PaginatedResponse<Branch>> {
    if (this.useRealApi) {
      console.log('🏢 Fetching paginated branches with filter:', filter);

      return this.branchApiService.getBranches(filter).pipe(
        map((paginatedResponse) => {
          console.log('📦 Branch API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid branch paginated response structure:', paginatedResponse);
            return {
              data: [],
              totalCount: 0,
              currentPage: 1,
              pageSize: 10,
              totalPages: 0,
              hasPreviousPage: false,
              hasNextPage: false
            };
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Branch response data is not an array:', paginatedResponse.data);
            return {
              data: [],
              totalCount: 0,
              currentPage: 1,
              pageSize: 10,
              totalPages: 0,
              hasPreviousPage: false,
              hasNextPage: false
            };
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} branch DTOs to Branch objects`);

          const convertedBranches = this.convertBranchDtosToBranches(paginatedResponse.data);
          console.log('🔄 Converted branches:', convertedBranches);

          return {
            data: convertedBranches,
            totalCount: paginatedResponse.totalCount,
            currentPage: paginatedResponse.currentPage,
            pageSize: paginatedResponse.pageSize,
            totalPages: paginatedResponse.totalPages,
            hasPreviousPage: paginatedResponse.hasPreviousPage,
            hasNextPage: paginatedResponse.hasNextPage
          };
        }),
        catchError((error) => {
          console.error('❌ Error fetching paginated branches:', error);

          // Return empty paginated response instead of throwing error
          return of({
            data: [],
            totalCount: 0,
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          });
        })
      );
    }

    // Fallback to mock data with pagination simulation
    console.log('🎭 Using mock data for paginated branches');
    const pageSize = filter?.pageSize || 10;
    const currentPage = filter?.page || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    let filteredBranches = [...this.mockBranches];

    // Apply filters to mock data
    if (filter?.name) {
      filteredBranches = filteredBranches.filter(branch =>
        branch.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }

    if (filter?.isActive !== undefined) {
      filteredBranches = filteredBranches.filter(branch =>
        branch.status === (filter.isActive ? 'active' : 'inactive')
      );
    }

    if (filter?.city) {
      filteredBranches = filteredBranches.filter(branch =>
        branch.city.toLowerCase() === filter.city.toLowerCase()
      );
    }

    const totalCount = filteredBranches.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = filteredBranches.slice(startIndex, endIndex);

    return of({
      data: paginatedData,
      totalCount: totalCount,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    }).pipe(delay(800));
  }

  // Vehicle Management
  getVehicles(filter?: VehicleFilter): Observable<Vehicle[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      // Convert VehicleFilter to CarFilterDto
      const carFilter: CarFilterDto = this.convertVehicleFilterToCarFilter(filter);

      console.log('🚗 Fetching cars with filter:', carFilter);

      return this.carApiService.getCars(carFilter).pipe(
        map((paginatedResponse: PaginatedResponse<AdminCarDto>) => {
          this.isLoading.set(false);

          console.log('📦 Car API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid car paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Car response data is not an array:', paginatedResponse.data);
            return [];
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} car DTOs to Vehicle objects`);

          const convertedVehicles = this.convertAdminCarDtosToVehicles(paginatedResponse.data);
          console.log('🔄 Converted vehicles:', convertedVehicles);

          return convertedVehicles;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching cars:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Car API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Car API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
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
    if (this.useRealApi) {
      return this.carApiService.getCarById(parseInt(id)).pipe(
        map((car: AdminCarDto) => this.convertAdminCarDtoToVehicle(car)),
        catchError((error) => {
          console.error('Error fetching car by ID:', error);
          return of(null);
        })
      );
    }

    // Fallback to mock data
    const vehicle = this.mockVehicles.find(v => v.id === id) || null;
    return of(vehicle).pipe(delay(500));
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Vehicle> {
    if (this.useRealApi) {
      // Convert Vehicle to AdminCreateCarDto
      const createCarDto: AdminCreateCarDto = this.convertVehicleToCreateCarDto(vehicle);

      return this.carApiService.createCar(createCarDto).pipe(
        map((createdCar: AdminCarDto) => {
          return this.convertAdminCarDtoToVehicle(createdCar);
        }),
        catchError((error) => {
          console.error('Error creating car:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockVehicles.push(newVehicle);
    return of(newVehicle).pipe(delay(1000));
  }

  // Direct AdminCarDto methods for forms
  createCar(carDto: AdminCreateCarDto): Observable<Vehicle> {
    if (this.useRealApi) {
      return this.carApiService.createCar(carDto).pipe(
        map((createdCar: AdminCarDto) => {
          return this.convertAdminCarDtoToVehicle(createdCar);
        }),
        catchError((error) => {
          console.error('Error creating car:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data - convert AdminCreateCarDto to Vehicle for mock
    const mockVehicle: Vehicle = {
      id: Date.now().toString(),
      make: carDto.brandEn || carDto.brandAr,
      model: carDto.modelEn || carDto.modelAr,
      year: carDto.year,
      licensePlate: carDto.plateNumber,
      vin: `VIN${Date.now()}`,
      category: 'economy' as VehicleCategory,
      fuelType: 'gasoline' as any,
      transmission: 'automatic' as any,
      seats: carDto.seatingCapacity,
      doors: carDto.numberOfDoors,
      color: carDto.colorEn || carDto.colorAr,
      mileage: carDto.mileage || 0,
      dailyRate: carDto.dailyRate,
      weeklyRate: carDto.weeklyRate,
      monthlyRate: carDto.monthlyRate,
      status: 'available' as VehicleStatus,
      branchId: carDto.branchId.toString(),
      features: carDto.features ? [carDto.features] : [],
      images: [],
      maintenanceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockVehicles.push(mockVehicle);
    return of(mockVehicle).pipe(delay(1000));
  }

  updateCar(id: number, carDto: AdminCreateCarDto): Observable<Vehicle> {
    if (this.useRealApi) {
      // Convert AdminCreateCarDto to AdminUpdateCarDto
      const updateDto: AdminUpdateCarDto = {
        brandAr: carDto.brandAr,
        brandEn: carDto.brandEn,
        modelAr: carDto.modelAr,
        modelEn: carDto.modelEn,
        colorAr: carDto.colorAr,
        colorEn: carDto.colorEn,
        year: carDto.year,
        plateNumber: carDto.plateNumber,
        seatingCapacity: carDto.seatingCapacity,
        numberOfDoors: carDto.numberOfDoors,
        maxSpeed: carDto.maxSpeed,
        engine: carDto.engine,
        transmissionType: carDto.transmissionType,
        fuelType: carDto.fuelType,
        dailyRate: carDto.dailyRate,
        weeklyRate: carDto.weeklyRate,
        monthlyRate: carDto.monthlyRate,
        status: carDto.status,
        imageUrl: carDto.imageUrl,
        descriptionAr: carDto.descriptionAr,
        descriptionEn: carDto.descriptionEn,
        mileage: carDto.mileage,
        features: carDto.features,
        categoryId: carDto.categoryId,
        branchId: carDto.branchId
      };

      return this.carApiService.updateCar(id, updateDto).pipe(
        map((updatedCar: AdminCarDto) => {
          return this.convertAdminCarDtoToVehicle(updatedCar);
        }),
        catchError((error) => {
          console.error('Error updating car:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const vehicleIndex = this.mockVehicles.findIndex(v => v.id === id.toString());
    if (vehicleIndex !== -1) {
      const updatedVehicle = {
        ...this.mockVehicles[vehicleIndex],
        make: carDto.brandEn || carDto.brandAr,
        model: carDto.modelEn || carDto.modelAr,
        year: carDto.year,
        updatedAt: new Date()
      };
      this.mockVehicles[vehicleIndex] = updatedVehicle;
      return of(updatedVehicle).pipe(delay(1000));
    }
    return throwError(() => new Error('Vehicle not found'));
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Observable<Vehicle> {
    if (this.useRealApi) {
      // Convert partial Vehicle updates to AdminCreateCarDto
      const updateCarDto = this.convertPartialVehicleToUpdateCarDto(updates);

      return this.carApiService.updateCar(parseInt(id), updateCarDto).pipe(
        map((updatedCar: AdminCarDto) => {
          return this.convertAdminCarDtoToVehicle(updatedCar);
        }),
        catchError((error) => {
          console.error('Error updating car:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
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
    if (this.useRealApi) {
      return this.carApiService.deleteCar(parseInt(id)).pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting car:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.mockVehicles.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  updateVehicleStatus(id: string, status: VehicleStatus): Observable<Vehicle> {
    if (this.useRealApi) {
      const statusUpdate: UpdateCarStatusDto = {
        status: this.mapVehicleStatusToCarStatus(status) || CarStatus.Available
      };

      return this.carApiService.updateCarStatus(parseInt(id), statusUpdate).pipe(
        map((updatedCar: AdminCarDto) => this.convertAdminCarDtoToVehicle(updatedCar)),
        catchError((error) => {
          console.error('Error updating car status:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
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
      updatedAt: new Date('2024-07-20'),
      createdBy: '1'
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
      updatedAt: new Date('2024-07-18'),
      createdBy: '1'
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
      updatedAt: new Date('2024-07-15'),
      createdBy: '1'
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
      updatedAt: new Date('2024-07-10'),
      createdBy: '1'
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
      updatedAt: new Date('2024-07-12'),
      createdBy: '1'
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

    this.mockServices.unshift(newService);
    return of(newService).pipe(delay(1000));
  }

  updateService(id: string, service: Partial<AdditionalService>): Observable<AdditionalService | null> {
    const index = this.mockServices.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockServices[index] = {
        ...this.mockServices[index],
        ...service,
        updatedAt: new Date()
      };
      return of(this.mockServices[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
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
      phone: '+971501234567',
      status: 'active',
      isActive: true,
      lastLogin: new Date('2024-07-25T08:30:00'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-07-20'),
      createdBy: '1'
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
      phone: '+971507654321',
      status: 'active',
      isActive: true,
      lastLogin: new Date('2024-07-24T14:15:00'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-07-18'),
      createdBy: '1'
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
      phone: '+971509876543',
      status: 'active',
      isActive: true,
      lastLogin: new Date('2024-07-25T09:45:00'),
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-07-22'),
      createdBy: '1'
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
      phone: '+971502468135',
      status: 'inactive',
      isActive: false,
      lastLogin: new Date('2024-07-20T16:30:00'),
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-07-15'),
      createdBy: '1'
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

  getAdminUsers(filter?: AdminFilterDto): Observable<AdminUser[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      // Add default filter to only get admin users (not customers)
      const adminFilter: AdminFilterDto = {
        ...filter,
        // Only get users with admin roles, not customers
        userRole: filter?.userRole || undefined // Let the API return all admin roles if not specified
      };

      console.log('🔍 Fetching admins with filter:', adminFilter);

      return this.adminApiService.getAdmins(adminFilter).pipe(
        map((paginatedResponse: PaginatedResponse<AdminUserDto>) => {
          this.isLoading.set(false);

          console.log('📦 Paginated API Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Response data is not an array:', paginatedResponse.data);
            return [];
          }

          // Filter out customers - only keep admin users
          const adminUsers = paginatedResponse.data.filter(user =>
            user.userRole && user.userRole !== 'Customer'
          );

          console.log(`✅ Found ${paginatedResponse.data.length} total users, ${adminUsers.length} admin users`);
          console.log('🔍 Admin users to convert:', adminUsers);

          const convertedAdmins = this.convertAdminUserDtosToAdminUsers(adminUsers);
          console.log('🔄 Converted admins:', convertedAdmins);

          return convertedAdmins;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching admins:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for admins');
    return of([...this.mockAdminUsers]).pipe(
      delay(800),
      map(users => {
        this.isLoading.set(false);
        return users;
      })
    );
  }

  getAdminUserById(id: string): Observable<AdminUser | null> {
    if (this.useRealApi) {
      return this.adminApiService.getAdminById(id).pipe(
        map((adminDto: AdminUserDto) => this.convertAdminUserDtoToAdminUser(adminDto)),
        catchError((error) => {
          console.error('Error fetching admin by ID:', error);
          return of(null);
        })
      );
    }

    // Fallback to mock data
    const user = this.mockAdminUsers.find(u => u.id === id) || null;
    return of(user).pipe(delay(500));
  }

  createAdminUser(adminUser: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Observable<AdminUser> {
    if (this.useRealApi) {
      // Convert AdminUser to CreateAdminUserDto
      const createAdminDto: CreateAdminUserDto = this.convertAdminUserToCreateAdminDto(adminUser);

      return this.adminApiService.createAdmin(createAdminDto).pipe(
        map((createdAdmin: AdminUserDto) => {
          return this.convertAdminUserDtoToAdminUser(createdAdmin);
        }),
        catchError((error) => {
          console.error('Error creating admin:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const newAdminUser: AdminUser = {
      ...adminUser,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockAdminUsers.unshift(newAdminUser);
    return of(newAdminUser).pipe(delay(1000));
  }

  updateAdminUser(id: string, adminUser: Partial<AdminUser>): Observable<AdminUser | null> {
    if (this.useRealApi) {
      // Convert partial AdminUser updates to CreateAdminUserDto
      const updateAdminDto = this.convertPartialAdminUserToUpdateDto(adminUser);

      return this.adminApiService.updateAdmin(id, updateAdminDto).pipe(
        map((updatedAdmin: AdminUserDto) => {
          return this.convertAdminUserDtoToAdminUser(updatedAdmin);
        }),
        catchError((error) => {
          console.error('Error updating admin:', error);
          return of(null);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockAdminUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockAdminUsers[index] = {
        ...this.mockAdminUsers[index],
        ...adminUser,
        updatedAt: new Date()
      };
      return of(this.mockAdminUsers[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }



  deleteAdminUser(id: string): Observable<boolean> {
    if (this.useRealApi) {
      // Note: The API doesn't have a delete endpoint, so we'll deactivate instead
      return this.adminApiService.deactivateAdmin(id).pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deactivating admin:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockAdminUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockAdminUsers.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  toggleAdminUserStatus(id: string): Observable<AdminUser> {
    if (this.useRealApi) {
      // First get the current admin to check status
      return this.adminApiService.getAdminById(id).pipe(
        switchMap((admin: AdminUserDto) => {
          // Toggle status: if active, deactivate; if inactive, activate
          if (admin.isActive) {
            return this.adminApiService.deactivateAdmin(id);
          } else {
            return this.adminApiService.activateAdmin(id);
          }
        }),
        map((updatedAdmin: AdminUserDto) => this.convertAdminUserDtoToAdminUser(updatedAdmin)),
        catchError((error) => {
          console.error('Error toggling admin status:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const user = this.mockAdminUsers.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
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
      driverLicense: {
        number: 'DL-12345678',
        issuingCountry: 'UAE',
        issueDate: new Date('2021-03-15'),
        expiryDate: new Date('2026-03-15'),
        licenseClass: 'B'
      },
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
      marketingConsent: true,
      status: 'active',
      verificationStatus: 'verified',
      isActive: true,
      isBlacklisted: false,
      licenseNumber: 'DL-12345678',
      notes: 'Excellent customer, always returns vehicles in perfect condition.',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-07-20'),
      lastRentalDate: new Date('2024-07-15'),
      createdBy: '1'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+971-55-234-5678',
      dateOfBirth: new Date('1990-07-22'),
      nationality: 'USA',
      driverLicense: {
        number: 'US-87654321',
        issuingCountry: 'USA',
        issueDate: new Date('2020-07-22'),
        expiryDate: new Date('2025-07-22'),
        licenseClass: 'B'
      },
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
      marketingConsent: false,
      status: 'active',
      verificationStatus: 'verified',
      isActive: true,
      isBlacklisted: false,
      licenseNumber: 'US-87654321',
      notes: 'Tourist customer, prefers luxury vehicles.',
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-07-18'),
      lastRentalDate: new Date('2024-07-10'),
      createdBy: '1'
    },
    {
      id: '3',
      firstName: 'Mohammed',
      lastName: 'Hassan',
      email: 'mohammed.hassan@email.com',
      phone: '+971-52-345-6789',
      dateOfBirth: new Date('1988-11-08'),
      nationality: 'Egypt',
      driverLicense: {
        number: 'EG-11223344',
        issuingCountry: 'Egypt',
        issueDate: new Date('2020-11-08'),
        expiryDate: new Date('2025-11-08'),
        licenseClass: 'B'
      },
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
      marketingConsent: true,
      status: 'active',
      verificationStatus: 'verified',
      isActive: true,
      isBlacklisted: false,
      licenseNumber: 'EG-11223344',
      notes: 'Corporate account, frequent business traveler.',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-07-22'),
      lastRentalDate: new Date('2024-07-20'),
      createdBy: '1'
    },
    {
      id: '4',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@email.com',
      phone: '+971-56-456-7890',
      dateOfBirth: new Date('1992-05-12'),
      nationality: 'Singapore',
      driverLicense: {
        number: 'SG-99887766',
        issuingCountry: 'Singapore',
        issueDate: new Date('2019-12-31'),
        expiryDate: new Date('2024-12-31'),
        licenseClass: 'B'
      },
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
      marketingConsent: false,
      status: 'inactive',
      verificationStatus: 'pending',
      isActive: false,
      isBlacklisted: true,
      licenseNumber: 'SG-99887766',
      notes: 'Late return issues, payment disputes.',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-06-30'),
      lastRentalDate: new Date('2024-06-25'),
      createdBy: '1'
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

  getCustomers(filter?: any): Observable<Customer[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      // Convert filter to CustomerFilterDto
      const customerFilter = this.convertCustomerFilterToDto(filter);

      console.log('👥 Fetching customers with filter:', customerFilter);

      return this.customerApiService.getCustomers(customerFilter).pipe(
        map((paginatedResponse) => {
          this.isLoading.set(false);

          console.log('📦 Customer API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid customer paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Customer response data is not an array:', paginatedResponse.data);
            return [];
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} customer DTOs to Customer objects`);

          const convertedCustomers = this.convertAdminCustomerDtosToCustomers(paginatedResponse.data);
          console.log('🔄 Converted customers:', convertedCustomers);

          return convertedCustomers;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching customers:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Customer API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Customer API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for customers');
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

  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'lastRentalDate'>): Observable<Customer> {
    if (this.useRealApi) {
      // Note: Customer creation is typically handled by the customer registration API
      // This method would need to be implemented if admin customer creation is required
      console.warn('Customer creation via admin API not implemented - using mock data');
    }

    // Fallback to mock data (customer creation is typically done through registration)
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockCustomers.unshift(newCustomer);
    return of(newCustomer).pipe(delay(1000));
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer | null> {
    if (this.useRealApi) {
      // Note: Customer updates are typically handled by the customer profile API
      // Admin updates would need specific admin customer update endpoints
      console.warn('Customer update via admin API not implemented - using mock data');
    }

    // Fallback to mock data
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers[index] = {
        ...this.mockCustomers[index],
        ...customer,
        updatedAt: new Date()
      };
      return of(this.mockCustomers[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }

  // Booking Management Methods
  createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Observable<Booking> {
    if (this.useRealApi) {
      // Convert Booking to AdminCreateBookingDto
      const createBookingDto: AdminCreateBookingDto = this.convertBookingToCreateBookingDto(booking);

      return this.bookingApiService.createBooking(createBookingDto).pipe(
        map((createdBooking: AdminBookingDto) => {
          return this.convertAdminBookingDtoToBooking(createdBooking);
        }),
        catchError((error) => {
          console.error('Error creating booking:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockBookings.unshift(newBooking);
    return of(newBooking).pipe(delay(1000));
  }

  updateBooking(id: string, booking: Partial<Booking>): Observable<Booking | null> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBookings[index] = {
        ...this.mockBookings[index],
        ...booking,
        updatedAt: new Date()
      };
      return of(this.mockBookings[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }

  getBookingById(id: string): Observable<Booking | null> {
    const booking = this.mockBookings.find(b => b.id === id) || null;
    return of(booking).pipe(delay(500));
  }



  deleteCustomer(id: string): Observable<boolean> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  // Customer Analytics and Loyalty Methods
  getCustomerAnalytics(): Observable<any> {
    if (this.useRealApi) {
      console.log('👥 Fetching customer analytics');

      return this.customerApiService.getCustomerAnalytics().pipe(
        map((analytics) => {
          console.log('📦 Customer Analytics API Response:', analytics);
          return analytics;
        }),
        catchError((error) => {
          console.error('❌ Error fetching customer analytics:', error);
          return of(this.getMockCustomerAnalytics());
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for customer analytics');
    return of(this.getMockCustomerAnalytics()).pipe(delay(800));
  }

  private getMockCustomerAnalytics(): any {
    return {
      totalCustomers: 1250,
      activeCustomers: 980,
      newCustomersThisMonth: 45,
      customerRetentionRate: 85.5,
      averageLifetimeValue: 2500,
      averageLoyaltyPoints: 150
    };
  }

  awardLoyaltyPoints(customerId: string, points: number, reason: string): Observable<boolean> {
    if (this.useRealApi) {
      const awardData = {
        customerId,
        points,
        reason
      };

      return this.customerApiService.awardLoyaltyPoints(awardData).pipe(
        catchError((error) => {
          console.error('❌ Error awarding loyalty points:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    console.log(`🎭 Mock: Awarding ${points} loyalty points to customer ${customerId} for ${reason}`);
    return of(true).pipe(delay(1000));
  }

  redeemLoyaltyPoints(customerId: string, points: number, reason: string): Observable<boolean> {
    if (this.useRealApi) {
      const redeemData = {
        customerId,
        points,
        reason
      };

      return this.customerApiService.redeemLoyaltyPoints(redeemData).pipe(
        catchError((error) => {
          console.error('❌ Error redeeming loyalty points:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    console.log(`🎭 Mock: Redeeming ${points} loyalty points from customer ${customerId} for ${reason}`);
    return of(true).pipe(delay(1000));
  }

  getCustomerLoyaltyPointsSummary(customerId: string): Observable<any> {
    if (this.useRealApi) {
      return this.customerApiService.getCustomerLoyaltyPointsSummary(customerId).pipe(
        catchError((error) => {
          console.error('❌ Error fetching loyalty points summary:', error);
          return of({});
        })
      );
    }

    // Fallback to mock data
    return of({
      totalPoints: 250,
      availablePoints: 180,
      lifetimeEarned: 850,
      lifetimeRedeemed: 670,
      expiringPoints: 20,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }).pipe(delay(800));
  }

  getCustomersAtChurnRisk(): Observable<any[]> {
    if (this.useRealApi) {
      return this.customerApiService.getCustomersAtChurnRisk().pipe(
        catchError((error) => {
          console.error('❌ Error fetching customers at churn risk:', error);
          return of([]);
        })
      );
    }

    // Fallback to mock data
    return of([
      { customerId: '1', customerName: 'Ahmed Al-Mansouri', lastBookingDate: '2024-01-15', riskScore: 85 },
      { customerId: '2', customerName: 'Sarah Johnson', lastBookingDate: '2024-02-10', riskScore: 72 },
      { customerId: '3', customerName: 'Mohammed Ali', lastBookingDate: '2024-01-28', riskScore: 68 }
    ]).pipe(delay(800));
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
      paidAmount: 487.5,
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
      paidAmount: 0,
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
      paidAmount: 430,
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
      paidAmount: 260,
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
      paidAmount: 215,
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

  getBookings(filter?: BookingFilterDto): Observable<Booking[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      console.log('📅 Fetching bookings with filter:', filter);

      return this.bookingApiService.getBookings(filter).pipe(
        map((paginatedResponse: PaginatedResponse<AdminBookingDto>) => {
          this.isLoading.set(false);

          console.log('📦 Booking API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid booking paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Booking response data is not an array:', paginatedResponse.data);
            return [];
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} booking DTOs to Booking objects`);

          const convertedBookings = this.convertAdminBookingDtosToBookings(paginatedResponse.data);
          console.log('🔄 Converted bookings:', convertedBookings);

          return convertedBookings;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching bookings:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Booking API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Booking API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for bookings');
    return of([...this.mockBookings]).pipe(
      delay(800),
      map(bookings => {
        this.isLoading.set(false);
        return bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      })
    );
  }



  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking | null> {
    if (this.useRealApi) {
      const statusUpdate: UpdateBookingStatusDto = {
        status: this.mapBookingStatusToApiStatus(status)
      };

      return this.bookingApiService.updateBookingStatus(parseInt(id), statusUpdate).pipe(
        map((updatedBooking: AdminBookingDto) => this.convertAdminBookingDtoToBooking(updatedBooking)),
        catchError((error) => {
          console.error('Error updating booking status:', error);
          return of(null);
        })
      );
    }

    // Fallback to mock data
    return this.updateBooking(id, { status });
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Observable<Booking | null> {
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

  // Advertisement Management Mock Data
  private mockAdvertisements: Advertisement[] = [
    {
      id: '1',
      title: 'Summer Car Rental Special',
      description: 'Get 20% off on all luxury vehicles this summer. Book now and save big!',
      imageUrl: 'assets/ads/summer-special.jpg',
      targetUrl: '/car-rental/vehicles?category=luxury',
      type: 'banner',
      status: 'active',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      targetAudience: {
        ageRange: { min: 25, max: 55 },
        gender: 'all',
        location: ['Dubai', 'Abu Dhabi'],
        interests: ['luxury', 'travel'],
        customerType: ['premium', 'corporate']
      },
      budget: 5000,
      impressions: 15420,
      clicks: 892,
      conversions: 67,
      priority: 1,
      branchIds: ['1', '2'],
      vehicleCategories: ['luxury', 'suv'],
      createdBy: '1',
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      title: 'Weekend Economy Deals',
      description: 'Perfect for weekend getaways! Economy cars starting from $50/day.',
      imageUrl: 'assets/ads/weekend-deals.jpg',
      targetUrl: '/car-rental/vehicles?category=economy',
      type: 'featured',
      status: 'active',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      targetAudience: {
        ageRange: { min: 18, max: 35 },
        gender: 'all',
        location: ['Dubai', 'Sharjah', 'Ajman'],
        interests: ['budget', 'weekend'],
        customerType: ['regular']
      },
      budget: 2500,
      impressions: 8750,
      clicks: 445,
      conversions: 28,
      priority: 2,
      branchIds: ['1', '3'],
      vehicleCategories: ['economy', 'compact'],
      createdBy: '2',
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-07-18')
    },
    {
      id: '3',
      title: 'Corporate Fleet Solutions',
      description: 'Streamline your business travel with our corporate fleet management.',
      imageUrl: 'assets/ads/corporate-fleet.jpg',
      targetUrl: '/car-rental/corporate',
      type: 'sidebar',
      status: 'paused',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-10-31'),
      targetAudience: {
        ageRange: { min: 30, max: 60 },
        gender: 'all',
        location: ['Dubai', 'Abu Dhabi'],
        interests: ['business', 'corporate'],
        customerType: ['corporate']
      },
      budget: 8000,
      impressions: 12300,
      clicks: 567,
      conversions: 89,
      priority: 3,
      branchIds: ['1', '2', '4'],
      vehicleCategories: ['midsize', 'fullsize', 'luxury'],
      createdBy: '1',
      createdAt: new Date('2024-04-25'),
      updatedAt: new Date('2024-07-15')
    },
    {
      id: '4',
      title: 'New Customer Welcome Offer',
      description: 'First-time renters get 15% off + free GPS navigation!',
      imageUrl: 'assets/ads/welcome-offer.jpg',
      targetUrl: '/car-rental/signup',
      type: 'popup',
      status: 'active',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-09-15'),
      targetAudience: {
        ageRange: { min: 21, max: 45 },
        gender: 'all',
        location: ['Dubai', 'Abu Dhabi', 'Sharjah'],
        interests: ['new-customer', 'discount'],
        customerType: ['regular']
      },
      budget: 3000,
      impressions: 6890,
      clicks: 234,
      conversions: 19,
      priority: 4,
      vehicleCategories: ['economy', 'compact', 'midsize'],
      createdBy: '3',
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-07-22')
    },
    {
      id: '5',
      title: 'Holiday Season Promotion',
      description: 'Make your holidays special with our premium vehicles. Book early!',
      imageUrl: 'assets/ads/holiday-promo.jpg',
      targetUrl: '/car-rental/vehicles?category=luxury',
      type: 'banner',
      status: 'draft',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-01-15'),
      targetAudience: {
        ageRange: { min: 25, max: 65 },
        gender: 'all',
        location: ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah'],
        interests: ['holiday', 'luxury', 'family'],
        customerType: ['premium', 'regular']
      },
      budget: 6000,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      priority: 1,
      branchIds: ['1', '2', '3', '4'],
      vehicleCategories: ['luxury', 'suv', 'van'],
      createdBy: '1',
      createdAt: new Date('2024-07-25'),
      updatedAt: new Date('2024-07-25')
    }
  ];

  // Advertisement Management Methods
  getAdvertisements(filter?: AdvertisementFilter): Observable<Advertisement[]> {
    this.isLoading.set(true);

    if (this.useRealApi) {
      // Convert AdvertisementFilter to AdvertisementFilterDto
      const advertisementFilter = this.convertAdvertisementFilterToDto(filter);

      console.log('📢 Fetching advertisements with filter:', advertisementFilter);

      return this.advertisementApiService.getAdvertisements(advertisementFilter).pipe(
        map((paginatedResponse) => {
          this.isLoading.set(false);

          console.log('📦 Advertisement API Paginated Response:', paginatedResponse);

          // Add null checks for the response data
          if (!paginatedResponse || !paginatedResponse.data) {
            console.warn('⚠️ Invalid advertisement paginated response structure:', paginatedResponse);
            return [];
          }

          // Ensure data is an array
          if (!Array.isArray(paginatedResponse.data)) {
            console.warn('⚠️ Advertisement response data is not an array:', paginatedResponse.data);
            return [];
          }

          console.log(`✅ Converting ${paginatedResponse.data.length} advertisement DTOs to Advertisement objects`);

          const convertedAdvertisements = this.convertAdminAdvertisementDtosToAdvertisements(paginatedResponse.data);
          console.log('🔄 Converted advertisements:', convertedAdvertisements);

          return convertedAdvertisements;
        }),
        catchError((error) => {
          this.isLoading.set(false);
          console.error('❌ Error fetching advertisements:', error);

          // Log the full error for debugging
          if (error.error) {
            console.error('🔍 Advertisement API Error Details:', error.error);
          }

          // Check if it's a network error
          if (error.status === 0) {
            console.error('🌐 Network error - Advertisement API might be unreachable');
          }

          // Return empty array instead of throwing error to prevent app crash
          return of([]);
        })
      );
    }

    // Fallback to mock data
    console.log('🎭 Using mock data for advertisements');
    let filteredAds = [...this.mockAdvertisements];

    if (filter) {
      if (filter.type) {
        filteredAds = filteredAds.filter(ad => ad.type === filter.type);
      }
      if (filter.status) {
        filteredAds = filteredAds.filter(ad => ad.status === filter.status);
      }
      if (filter.branchId) {
        filteredAds = filteredAds.filter(ad => ad.branchIds?.includes(filter.branchId!));
      }
      if (filter.startDate) {
        filteredAds = filteredAds.filter(ad => ad.startDate >= filter.startDate!);
      }
      if (filter.endDate) {
        filteredAds = filteredAds.filter(ad => ad.endDate <= filter.endDate!);
      }
      if (filter.createdBy) {
        filteredAds = filteredAds.filter(ad => ad.createdBy === filter.createdBy);
      }
    }

    return of(filteredAds).pipe(
      delay(800),
      map(ads => {
        this.isLoading.set(false);
        return ads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      })
    );
  }

  getAdvertisementById(id: string): Observable<Advertisement | null> {
    const advertisement = this.mockAdvertisements.find(ad => ad.id === id) || null;
    return of(advertisement).pipe(delay(500));
  }

  createAdvertisement(advertisement: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'impressions' | 'clicks' | 'conversions'>): Observable<Advertisement> {
    if (this.useRealApi) {
      // Convert Advertisement to AdminCreateAdvertisementDto
      const createAdvertisementDto = this.convertAdvertisementToCreateDto(advertisement);

      return this.advertisementApiService.createAdvertisement(createAdvertisementDto).pipe(
        map((createdAdvertisement) => {
          return this.convertAdminAdvertisementDtoToAdvertisement(createdAdvertisement);
        }),
        catchError((error) => {
          console.error('Error creating advertisement:', error);
          return throwError(() => error);
        })
      );
    }

    // Fallback to mock data
    const newAdvertisement: Advertisement = {
      ...advertisement,
      id: Date.now().toString(),
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockAdvertisements.unshift(newAdvertisement);
    return of(newAdvertisement).pipe(delay(1000));
  }

  updateAdvertisement(id: string, advertisement: Partial<Advertisement>): Observable<Advertisement | null> {
    if (this.useRealApi) {
      // Convert partial Advertisement to AdminCreateAdvertisementDto
      const updateAdvertisementDto = this.convertPartialAdvertisementToUpdateDto(advertisement);

      return this.advertisementApiService.updateAdvertisement(parseInt(id), updateAdvertisementDto).pipe(
        map((updatedAdvertisement) => this.convertAdminAdvertisementDtoToAdvertisement(updatedAdvertisement)),
        catchError((error) => {
          console.error('Error updating advertisement:', error);
          return of(null);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockAdvertisements.findIndex(ad => ad.id === id);
    if (index !== -1) {
      this.mockAdvertisements[index] = {
        ...this.mockAdvertisements[index],
        ...advertisement,
        updatedAt: new Date()
      };
      return of(this.mockAdvertisements[index]).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }

  deleteAdvertisement(id: string): Observable<boolean> {
    if (this.useRealApi) {
      return this.advertisementApiService.deleteAdvertisement(parseInt(id)).pipe(
        catchError((error) => {
          console.error('Error deleting advertisement:', error);
          return of(false);
        })
      );
    }

    // Fallback to mock data
    const index = this.mockAdvertisements.findIndex(ad => ad.id === id);
    if (index !== -1) {
      this.mockAdvertisements.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  getAdvertisementAnalytics(): Observable<AdvertisementAnalytics> {
    const totalImpressions = this.mockAdvertisements.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = this.mockAdvertisements.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalConversions = this.mockAdvertisements.reduce((sum, ad) => sum + ad.conversions, 0);

    const analytics: AdvertisementAnalytics = {
      totalImpressions,
      totalClicks,
      totalConversions,
      clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      costPerClick: 2.5,
      costPerConversion: 45.8,
      revenueGenerated: 125000,
      topPerformingAds: this.mockAdvertisements
        .filter(ad => ad.status === 'active')
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 5),
      performanceByType: [
        { type: 'banner', impressions: 28120, clicks: 1459, conversions: 156 },
        { type: 'featured', impressions: 8750, clicks: 445, conversions: 28 },
        { type: 'sidebar', impressions: 12300, clicks: 567, conversions: 89 },
        { type: 'popup', impressions: 6890, clicks: 234, conversions: 19 },
        { type: 'promotion', impressions: 4200, clicks: 189, conversions: 12 }
      ]
    };

    return of(analytics).pipe(delay(1200));
  }

  updateAdvertisementStatus(id: string, status: AdvertisementStatus): Observable<Advertisement | null> {
    return this.updateAdvertisement(id, { status });
  }

  getActiveAdvertisements(): Observable<Advertisement[]> {
    const activeAds = this.mockAdvertisements.filter(ad =>
      ad.status === 'active' &&
      ad.startDate <= new Date() &&
      ad.endDate >= new Date()
    );
    return of(activeAds).pipe(delay(400));
  }

  getAdvertisementsByType(type: AdvertisementType): Observable<Advertisement[]> {
    const typeAds = this.mockAdvertisements.filter(ad => ad.type === type);
    return of(typeAds).pipe(delay(500));
  }

  // Conversion methods for API integration
  private convertVehicleFilterToCarFilter(filter?: VehicleFilter): CarFilterDto {
    if (!filter) return {};

    return {
      status: this.mapVehicleStatusToCarStatus(filter.status),
      branchId: filter.branchId ? parseInt(filter.branchId) : undefined,
      brand: filter.make,
      dailyRateFrom: filter.minRate,
      dailyRateTo: filter.maxRate,
      transmissionType: this.mapStringToTransmissionType(filter.transmission),
      fuelType: this.mapStringToFuelType(filter.fuelType),
      page: 1,
      pageSize: 50
    };
  }

  private convertAdminCarDtosToVehicles(cars: AdminCarDto[]): Vehicle[] {
    if (!cars || !Array.isArray(cars)) {
      console.warn('Invalid cars array provided to convertAdminCarDtosToVehicles:', cars);
      return [];
    }

    return cars.map(car => {
      try {
        return this.convertAdminCarDtoToVehicle(car);
      } catch (error) {
        console.error('Error converting car DTO:', car, error);
        // Return null for failed conversions and filter them out
        return null;
      }
    }).filter(vehicle => vehicle !== null) as Vehicle[];
  }

  private convertAdminCarDtoToVehicle(car: AdminCarDto): Vehicle {
    if (!car) {
      throw new Error('Car DTO is null or undefined');
    }

    return {
      id: car.id?.toString() || '',
      make: car.brand || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      licensePlate: `ID-${car.id}`, // Use car ID as license plate since API doesn't provide it
      vin: `VIN${car.id || 'UNKNOWN'}`, // API doesn't provide VIN, so we generate a placeholder
      category: this.mapCarCategoryToVehicleCategory(car.category?.id || 1),
      fuelType: this.mapCarFuelTypeToVehicleFuelType(car.fuelType || 'Gasoline'),
      transmission: (car.transmissionType || 'Manual').toLowerCase() as 'manual' | 'automatic',
      seats: car.seatingCapacity || 4,
      doors: car.numberOfDoors || 4,
      color: car.color || 'Unknown',
      mileage: car.mileage || 0,
      dailyRate: car.dailyPrice || 0,
      weeklyRate: car.weeklyPrice || 0,
      monthlyRate: car.monthlyPrice || 0,
      status: this.mapCarStatusToVehicleStatus(car.status || 'Available'),
      branchId: car.branch?.id?.toString() || '1',
      features: car.features ? car.features.split(',').map((f: string) => f.trim()) : (car.description ? [car.description] : []), // Use features or description
      images: car.imageUrl ? [car.imageUrl] : [],
      maintenanceHistory: [], // This would need to be fetched separately
      createdAt: car.createdAt ? new Date(car.createdAt) : new Date(),
      updatedAt: car.updatedAt ? new Date(car.updatedAt) : new Date()
    };
  }

  private mapVehicleStatusToCarStatus(status?: VehicleStatus): CarStatus | undefined {
    if (!status) return undefined;

    const statusMap: Record<VehicleStatus, CarStatus> = {
      'available': CarStatus.Available,
      'rented': CarStatus.Rented,
      'maintenance': CarStatus.Maintenance,
      'out_of_service': CarStatus.OutOfService,
      'reserved': CarStatus.Available // Map reserved to available for API
    };

    return statusMap[status];
  }

  private mapCarStatusToVehicleStatus(status: string): VehicleStatus {
    const statusMap: Record<string, VehicleStatus> = {
      'Available': 'available',
      'Rented': 'rented',
      'Maintenance': 'maintenance',
      'OutOfService': 'out_of_service'
    };

    return statusMap[status] || 'available';
  }

  private mapCarCategoryToVehicleCategory(categoryId: number): VehicleCategory {
    // This should ideally come from a categories API, but for now we'll use a simple mapping
    const categoryMap: Record<number, VehicleCategory> = {
      1: 'economy',
      2: 'compact',
      3: 'midsize',
      4: 'fullsize',
      5: 'luxury',
      6: 'suv',
      7: 'van'
    };

    return categoryMap[categoryId] || 'economy';
  }

  private mapCarFuelTypeToVehicleFuelType(fuelType: string): 'gasoline' | 'diesel' | 'electric' | 'hybrid' {
    const fuelTypeMap: Record<string, 'gasoline' | 'diesel' | 'electric' | 'hybrid'> = {
      'Petrol': 'gasoline',
      'Diesel': 'diesel',
      'Electric': 'electric',
      'Hybrid': 'hybrid'
    };

    return fuelTypeMap[fuelType] || 'gasoline';
  }

  private convertVehicleToCreateCarDto(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): AdminCreateCarDto {
    return {
      brandAr: vehicle.make,
      brandEn: vehicle.make,
      modelAr: vehicle.model,
      modelEn: vehicle.model,
      year: vehicle.year,
      colorAr: vehicle.color,
      colorEn: vehicle.color,
      plateNumber: vehicle.licensePlate,
      seatingCapacity: vehicle.seats,
      numberOfDoors: vehicle.doors,
      maxSpeed: 180, // Default value since not provided in Vehicle model
      engine: 'Unknown', // Default value since not provided in Vehicle model
      transmissionType: vehicle.transmission === 'automatic' ? TransmissionType.Automatic : TransmissionType.Manual,
      fuelType: this.mapVehicleFuelTypeToCarFuelType(vehicle.fuelType),
      dailyRate: vehicle.dailyRate,
      weeklyRate: vehicle.weeklyRate || vehicle.dailyRate * 7,
      monthlyRate: vehicle.monthlyRate || vehicle.dailyRate * 30,
      status: this.mapVehicleStatusToCarStatus(vehicle.status) || CarStatus.Available,
      imageUrl: vehicle.images?.[0],
      mileage: vehicle.mileage,
      features: vehicle.features?.join(', '),
      categoryId: this.mapVehicleCategoryToCarCategoryId(vehicle.category),
      branchId: parseInt(vehicle.branchId)
    };
  }

  private mapVehicleFuelTypeToCarFuelType(fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'): FuelType {
    const fuelTypeMap: Record<'gasoline' | 'diesel' | 'electric' | 'hybrid', FuelType> = {
      'gasoline': FuelType.Gasoline,
      'diesel': FuelType.Diesel,
      'electric': FuelType.Electric,
      'hybrid': FuelType.Hybrid
    };

    return fuelTypeMap[fuelType];
  }

  private mapStringToTransmissionType(transmission?: string): TransmissionType | undefined {
    if (!transmission) return undefined;
    
    const transmissionMap: Record<string, TransmissionType> = {
      'manual': TransmissionType.Manual,
      'automatic': TransmissionType.Automatic,
      'Manual': TransmissionType.Manual,
      'Automatic': TransmissionType.Automatic
    };
    
    return transmissionMap[transmission];
  }

  private mapStringToFuelType(fuelType?: string): FuelType | undefined {
    if (!fuelType) return undefined;
    
    const fuelTypeMap: Record<string, FuelType> = {
      'gasoline': FuelType.Gasoline,
      'diesel': FuelType.Diesel,
      'electric': FuelType.Electric,
      'hybrid': FuelType.Hybrid,
      'Petrol': FuelType.Gasoline,
      'Diesel': FuelType.Diesel,
      'Electric': FuelType.Electric,
      'Hybrid': FuelType.Hybrid,
      'PluginHybrid': FuelType.PluginHybrid
    };
    
    return fuelTypeMap[fuelType];
  }

  private mapVehicleCategoryToCarCategoryId(category: VehicleCategory): number {
    const categoryMap: Record<VehicleCategory, number> = {
      'economy': 1,
      'compact': 2,
      'midsize': 3,
      'fullsize': 4,
      'luxury': 5,
      'suv': 6,
      'van': 7,
      'truck': 8
    };

    return categoryMap[category] || 1;
  }

  private convertPartialVehicleToUpdateCarDto(updates: Partial<Vehicle>): AdminUpdateCarDto {
    const updateDto: AdminUpdateCarDto = {};

    if (updates.make) {
      updateDto.brandAr = updates.make;
      updateDto.brandEn = updates.make;
    }
    if (updates.model) {
      updateDto.modelAr = updates.model;
      updateDto.modelEn = updates.model;
    }
    if (updates.color) {
      updateDto.colorAr = updates.color;
      updateDto.colorEn = updates.color;
    }
    if (updates.year) updateDto.year = updates.year;
    if (updates.licensePlate) updateDto.plateNumber = updates.licensePlate;
    if (updates.seats) updateDto.seatingCapacity = updates.seats;
    if (updates.doors) updateDto.numberOfDoors = updates.doors;
    if (updates.transmission) updateDto.transmissionType = this.mapStringToTransmissionType(updates.transmission);
    if (updates.fuelType) updateDto.fuelType = this.mapVehicleFuelTypeToCarFuelType(updates.fuelType);
    if (updates.dailyRate) updateDto.dailyRate = updates.dailyRate;
    if (updates.weeklyRate) updateDto.weeklyRate = updates.weeklyRate;
    if (updates.monthlyRate) updateDto.monthlyRate = updates.monthlyRate;
    if (updates.status) updateDto.status = this.mapVehicleStatusToCarStatus(updates.status);
    if (updates.images?.[0]) updateDto.imageUrl = updates.images[0];
    if (updates.mileage) updateDto.mileage = updates.mileage;
    if (updates.features) updateDto.features = updates.features.join(', ');
    if (updates.category) updateDto.categoryId = this.mapVehicleCategoryToCarCategoryId(updates.category);
    if (updates.branchId) updateDto.branchId = parseInt(updates.branchId);

    return updateDto;
  }

  // Admin User conversion methods
  private convertAdminUserDtosToAdminUsers(admins: AdminUserDto[]): AdminUser[] {
    if (!admins || !Array.isArray(admins)) {
      console.warn('Invalid admins array provided to convertAdminUserDtosToAdminUsers:', admins);
      return [];
    }

    return admins.map(admin => {
      try {
        return this.convertAdminUserDtoToAdminUser(admin);
      } catch (error) {
        console.error('Error converting admin DTO:', admin, error);
        // Return a fallback admin object or skip this admin
        return null;
      }
    }).filter(admin => admin !== null) as AdminUser[];
  }

  private convertAdminUserDtoToAdminUser(admin: AdminUserDto): AdminUser {
    if (!admin) {
      throw new Error('Admin DTO is null or undefined');
    }

    // Safely handle fullName splitting
    const fullName = admin.fullName || '';
    const fullNameParts = fullName.split(' ');
    const firstName = fullNameParts[0] || '';
    const lastName = fullNameParts.slice(1).join(' ') || '';

    return {
      id: admin.id || '',
      username: admin.email || '', // Use email as username since API doesn't provide username
      email: admin.email || '',
      firstName: firstName,
      lastName: lastName,
      phone: admin.phoneNumber || '',
      role: this.mapApiRoleToAdminRole(admin.userRole || 'Employee'),
      permissions: [], // API doesn't provide permissions in the user object
      branchIds: admin.assignedBranches?.map(id => id.toString()) || [],
      status: admin.isActive ? 'active' : 'inactive',
      lastLogin: admin.lastLoginDate ? new Date(admin.lastLoginDate) : undefined,
      createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
      updatedAt: admin.updatedAt ? new Date(admin.updatedAt) : new Date(),
      createdBy: admin.createdByAdmin || 'system',
      isActive: admin.isActive || false
    };
  }

  private convertAdminUserToCreateAdminDto(adminUser: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): CreateAdminUserDto {
    return {
      email: adminUser.email,
      fullName: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
      phoneNumber: adminUser.phone,
      userRole: this.mapAdminRoleToApiRole(adminUser.role),
      preferredLanguage: 'English', // Default to English since AdminUser doesn't have language field
      password: 'TempPassword123!', // This should be handled properly in the UI
      confirmPassword: 'TempPassword123!',
      assignedBranches: adminUser.branchIds?.map(id => parseInt(id)),
      permissions: adminUser.permissions?.map(p => `${p.resource}:${p.actions.join(',')}`),
      sendWelcomeEmail: true
    };
  }

  private convertPartialAdminUserToUpdateDto(updates: Partial<AdminUser>): Partial<CreateAdminUserDto> {
    const updateDto: Partial<CreateAdminUserDto> = {};

    if (updates.email) updateDto.email = updates.email;
    if (updates.firstName || updates.lastName) {
      updateDto.fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }
    if (updates.phone) updateDto.phoneNumber = updates.phone;
    if (updates.role) updateDto.userRole = this.mapAdminRoleToApiRole(updates.role);
    if (updates.branchIds) updateDto.assignedBranches = updates.branchIds.map(id => parseInt(id));
    if (updates.permissions) updateDto.permissions = updates.permissions.map(p => `${p.resource}:${p.actions.join(',')}`);

    return updateDto;
  }

  private mapApiRoleToAdminRole(apiRole: string): AdminRole {
    const roleMap: Record<string, AdminRole> = {
      'SuperAdmin': 'super_admin',
      'Admin': 'super_admin', // Map Admin to super_admin since we don't have exact match
      'BranchManager': 'branch_manager',
      'Employee': 'staff',
      'Customer': 'viewer' // Map Customer to viewer (though customers shouldn't be in admin list)
    };

    if (environment.logging.enableApiLogging && !roleMap[apiRole]) {
      console.warn(`🔍 Unknown API role: ${apiRole}, defaulting to 'staff'`);
    }

    return roleMap[apiRole] || 'staff';
  }

  private mapAdminRoleToApiRole(adminRole: AdminRole): 'Employee' | 'BranchManager' | 'Admin' | 'SuperAdmin' {
    const roleMap: Record<AdminRole, 'Employee' | 'BranchManager' | 'Admin' | 'SuperAdmin'> = {
      'super_admin': 'SuperAdmin',
      'branch_manager': 'BranchManager',
      'staff': 'Employee',
      'viewer': 'Employee'
    };

    return roleMap[adminRole];
  }

  // Booking conversion methods
  private convertAdminBookingDtosToBookings(bookings: AdminBookingDto[]): Booking[] {
    if (!bookings || !Array.isArray(bookings)) {
      console.warn('Invalid bookings array provided to convertAdminBookingDtosToBookings:', bookings);
      return [];
    }

    return bookings.map(booking => {
      try {
        return this.convertAdminBookingDtoToBooking(booking);
      } catch (error) {
        console.error('Error converting booking DTO:', booking, error);
        // Return null for failed conversions and filter them out
        return null;
      }
    }).filter(booking => booking !== null) as Booking[];
  }

  private convertAdminBookingDtoToBooking(booking: AdminBookingDto): Booking {
    if (!booking) {
      throw new Error('Booking DTO is null or undefined');
    }

    // Calculate total days
    const startDate = booking.startDate ? new Date(booking.startDate) : new Date();
    const endDate = booking.endDate ? new Date(booking.endDate) : new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: booking.id?.toString() || '',
      bookingNumber: `BK-${booking.id}` || '',
      customerId: booking.userId || '',
      customer: {
        id: booking.userId || '',
        firstName: booking.customerName?.split(' ')[0] || '',
        lastName: booking.customerName?.split(' ').slice(1).join(' ') || '',
        email: booking.customerEmail || '',
        phone: booking.customerPhone || '',
        alternatePhone: undefined,
        dateOfBirth: new Date(), // API doesn't provide DOB
        nationality: 'Unknown', // API doesn't provide nationality
        gender: undefined,
        driverLicense: {
          number: 'Unknown',
          issuingCountry: 'Unknown',
          issueDate: new Date(),
          expiryDate: new Date(),
          licenseClass: 'Unknown'
        },
        address: {
          street: 'Unknown',
          city: 'Unknown',
          state: 'Unknown',
          country: 'Unknown',
          zipCode: 'Unknown'
        },
        emergencyContact: {
          name: 'Unknown',
          phone: 'Unknown',
          relationship: 'Unknown'
        },
        customerType: 'regular' as CustomerType,
        preferredLanguage: 'en',
        marketingConsent: false,
        profileImage: undefined,
        loyaltyPoints: 0,
        totalRentals: 0,
        totalSpent: 0,
        averageRating: 0,
        status: 'active',
        verificationStatus: 'verified',
        documents: undefined,
        preferences: undefined,
        notes: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRentalDate: undefined,
        createdBy: 'system',
        isActive: true,
        isBlacklisted: false,
        licenseNumber: 'Unknown'
      },
      vehicleId: booking.carId?.toString() || '',
      vehicle: {
        id: booking.carId?.toString() || '',
        make: booking.carBrand || '',
        model: booking.carModel || '',
        year: new Date().getFullYear(), // API doesn't provide year
        licensePlate: booking.carPlateNumber || '',
        category: 'economy' as VehicleCategory, // Default category
        dailyRate: booking.totalAmount ? booking.totalAmount / Math.max(totalDays, 1) : 0
      },
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
      dailyRate: booking.totalAmount ? booking.totalAmount / Math.max(totalDays, 1) : 0,
      subtotal: booking.totalAmount || 0,
      taxes: 0, // API doesn't provide tax breakdown
      fees: 0, // API doesn't provide fee breakdown
      totalAmount: booking.totalAmount || 0,
      paidAmount: 0, // API doesn't provide paid amount directly
      status: this.mapApiStatusToBookingStatus(booking.status || 'Pending'),
      paymentStatus: 'pending' as PaymentStatus, // API doesn't provide payment status directly
      pickupLocation: booking.receivingBranchName || '',
      dropoffLocation: booking.deliveryBranchName || '',
      pickupTime: '09:00', // API doesn't provide pickup time
      dropoffTime: '17:00', // API doesn't provide dropoff time
      additionalServices: booking.extrasDetails?.map(extra => ({
        serviceId: extra.extraTypeName,
        name: extra.extraTypeName,
        dailyRate: extra.unitPrice,
        totalAmount: extra.totalPrice
      })) || [],
      specialRequests: undefined,
      driverLicense: 'Unknown', // API doesn't provide driver license
      emergencyContact: {
        name: 'Unknown',
        phone: 'Unknown'
      },
      createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date(),
      createdBy: 'admin' as 'customer' | 'admin',
      notes: undefined // API doesn't provide notes directly
    };
  }

  private convertBookingToCreateBookingDto(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): AdminCreateBookingDto {
    return {
      userId: booking.customerId,
      carId: parseInt(booking.vehicleId),
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      receivingBranchId: 1, // Default branch - this should be determined from pickupLocation
      deliveryBranchId: 1, // Default branch - this should be determined from dropoffLocation
      extras: booking.additionalServices?.map(service => ({
        extraTypePriceId: 1, // This would need to be mapped from service name to ID
        quantity: 1 // Default quantity
      })),
      notes: booking.notes,
      discountAmount: 0, // Not provided in Booking interface
      discountReason: undefined
    };
  }

  private mapBookingStatusToApiStatus(status: BookingStatus): 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' {
    const statusMap: Record<BookingStatus, 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled'> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'Cancelled' // Map no_show to Cancelled since API doesn't have no_show status
    };

    return statusMap[status] || 'Pending';
  }

  private mapApiStatusToBookingStatus(status: string): BookingStatus {
    const statusMap: Record<string, BookingStatus> = {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Active': 'active',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };

    return statusMap[status] || 'pending';
  }

  // Advertisement conversion methods
  private convertAdvertisementFilterToDto(filter?: AdvertisementFilter): any {
    if (!filter) return {};

    return {
      status: this.mapAdvertisementStatusToApiStatus(filter.status),
      type: this.mapAdvertisementTypeToApiType(filter.type),
      startDateFrom: filter.startDate?.toISOString(),
      startDateTo: filter.endDate?.toISOString(),
      page: 1,
      pageSize: 50
    };
  }

  private convertAdminAdvertisementDtosToAdvertisements(advertisements: any[]): Advertisement[] {
    if (!advertisements || !Array.isArray(advertisements)) {
      console.warn('Invalid advertisements array provided to convertAdminAdvertisementDtosToAdvertisements:', advertisements);
      return [];
    }

    return advertisements.map(advertisement => {
      try {
        return this.convertAdminAdvertisementDtoToAdvertisement(advertisement);
      } catch (error) {
        console.error('Error converting advertisement DTO:', advertisement, error);
        // Return null for failed conversions and filter them out
        return null;
      }
    }).filter(advertisement => advertisement !== null) as Advertisement[];
  }

  private convertAdminAdvertisementDtoToAdvertisement(advertisement: any): Advertisement {
    if (!advertisement) {
      throw new Error('Advertisement DTO is null or undefined');
    }

    return {
      id: advertisement.id?.toString() || '',
      title: advertisement.titleEn || advertisement.titleAr || '',
      description: advertisement.descriptionEn || advertisement.descriptionAr || '',
      imageUrl: advertisement.imageUrl || '',
      targetUrl: advertisement.linkUrl,
      type: this.mapApiTypeToAdvertisementType(advertisement.type || 'Banner'),
      status: this.mapApiStatusToAdvertisementStatus(advertisement.status || 'Active'),
      startDate: advertisement.startDate ? new Date(advertisement.startDate) : new Date(),
      endDate: advertisement.endDate ? new Date(advertisement.endDate) : new Date(),
      priority: advertisement.displayOrder || 0,
      branchIds: [], // API doesn't provide branch IDs directly
      targetAudience: {
        gender: 'all',
        location: [],
        interests: [],
        customerType: []
      }, // Default target audience
      impressions: advertisement.impressionCount || 0,
      clicks: advertisement.clickCount || 0,
      conversions: 0, // API doesn't provide conversions
      budget: 0, // API doesn't provide budget
      createdAt: advertisement.createdAt ? new Date(advertisement.createdAt) : new Date(),
      updatedAt: advertisement.updatedAt ? new Date(advertisement.updatedAt) : new Date(),
      createdBy: 'admin' // Default value
    };
  }

  private convertAdvertisementToCreateDto(advertisement: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'impressions' | 'clicks' | 'conversions'>): any {
    return {
      titleAr: advertisement.title, // Using title for both languages for now
      titleEn: advertisement.title,
      descriptionAr: advertisement.description,
      descriptionEn: advertisement.description,
      imageUrl: advertisement.imageUrl,
      linkUrl: advertisement.targetUrl,
      type: this.mapAdvertisementTypeToApiType(advertisement.type),
      status: this.mapAdvertisementStatusToApiStatus(advertisement.status),
      startDate: advertisement.startDate.toISOString(),
      endDate: advertisement.endDate.toISOString(),
      displayOrder: advertisement.priority,
      targetAudience: advertisement.targetAudience
    };
  }

  private convertPartialAdvertisementToUpdateDto(advertisement: Partial<Advertisement>): any {
    const updateDto: any = {};

    if (advertisement.title) {
      updateDto.titleAr = advertisement.title;
      updateDto.titleEn = advertisement.title;
    }
    if (advertisement.description) {
      updateDto.descriptionAr = advertisement.description;
      updateDto.descriptionEn = advertisement.description;
    }
    if (advertisement.imageUrl) updateDto.imageUrl = advertisement.imageUrl;
    if (advertisement.targetUrl) updateDto.linkUrl = advertisement.targetUrl;
    if (advertisement.type) updateDto.type = this.mapAdvertisementTypeToApiType(advertisement.type);
    if (advertisement.status) updateDto.status = this.mapAdvertisementStatusToApiStatus(advertisement.status);
    if (advertisement.startDate) updateDto.startDate = advertisement.startDate.toISOString();
    if (advertisement.endDate) updateDto.endDate = advertisement.endDate.toISOString();
    if (advertisement.priority !== undefined) updateDto.displayOrder = advertisement.priority;
    if (advertisement.targetAudience) updateDto.targetAudience = advertisement.targetAudience;

    return updateDto;
  }

  private mapAdvertisementStatusToApiStatus(status?: AdvertisementStatus): string {
    if (!status) return 'Active';

    const statusMap: Record<AdvertisementStatus, string> = {
      'draft': 'Inactive',
      'active': 'Active',
      'paused': 'Inactive',
      'expired': 'Expired',
      'archived': 'Inactive'
    };

    return statusMap[status] || 'Active';
  }

  private mapApiStatusToAdvertisementStatus(status: string): AdvertisementStatus {
    const statusMap: Record<string, AdvertisementStatus> = {
      'Active': 'active',
      'Inactive': 'paused',
      'Scheduled': 'draft',
      'Expired': 'expired'
    };

    return statusMap[status] || 'active';
  }

  private mapAdvertisementTypeToApiType(type?: AdvertisementType): string {
    if (!type) return 'Banner';

    const typeMap: Record<AdvertisementType, string> = {
      'banner': 'Banner',
      'popup': 'Popup',
      'sidebar': 'Sidebar',
      'featured': 'Banner', // Map featured to Banner since API doesn't have featured
      'promotion': 'Banner' // Map promotion to Banner since API doesn't have promotion
    };

    return typeMap[type] || 'Banner';
  }

  private mapApiTypeToAdvertisementType(type: string): AdvertisementType {
    const typeMap: Record<string, AdvertisementType> = {
      'Banner': 'banner',
      'Popup': 'popup',
      'Sidebar': 'sidebar'
    };

    return typeMap[type] || 'banner';
  }

  // Branch conversion methods
  private convertBranchFilterToDto(filter?: BranchFilter): any {
    if (!filter) return {};

    return {
      isActive: filter.status === 'active' ? true : filter.status === 'inactive' ? false : undefined,
      city: filter.city,
      country: filter.country,
      page: 1,
      pageSize: 50
    };
  }

  private convertBranchDtosToBranches(branches: any[]): Branch[] {
    if (!branches || !Array.isArray(branches)) {
      console.warn('Invalid branches array provided to convertBranchDtosToBranches:', branches);
      return [];
    }

    return branches.map(branch => {
      try {
        return this.convertBranchDtoToBranch(branch);
      } catch (error) {
        console.error('Error converting branch DTO:', branch, error);
        // Return null for failed conversions and filter them out
        return null;
      }
    }).filter(branch => branch !== null) as Branch[];
  }



  private convertBranchDtoToBranch(branch: any): Branch {
    if (!branch) {
      throw new Error('Branch DTO is null or undefined');
    }

    console.log('🔄 Converting branch DTO:', branch);

    return {
      id: branch.id?.toString() || '',
      name: branch.name || '', // API returns single name field
      address: branch.address || '', // API returns single address field
      city: branch.city || '', // API provides city directly
      country: branch.country || 'UAE', // API provides country directly
      phone: branch.phone || '', // API uses 'phone' not 'phoneNumber'
      email: branch.email || '',
      coordinates: {
        lat: branch.latitude || 0,
        lng: branch.longitude || 0
      },
      operatingHours: this.parseWorkingHours(branch.workingHours || '24/7'),
      status: branch.isActive ? 'active' : 'inactive',
      manager: 'Unknown', // API doesn't provide manager info yet
      createdAt: new Date(branch.createdAt || Date.now()),
      updatedAt: new Date(branch.updatedAt || Date.now())
    };
  }

  private convertBranchToCreateDto(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      nameAr: branch.name, // Using name for both languages for now
      nameEn: branch.name,
      addressAr: branch.address,
      addressEn: branch.address,
      phoneNumber: branch.phone,
      email: branch.email,
      latitude: branch.coordinates.lat,
      longitude: branch.coordinates.lng,
      isActive: branch.status === 'active',
      workingHours: this.convertOperatingHoursToString(branch.operatingHours)
    };
  }

  private convertPartialBranchToUpdateDto(branch: Partial<Branch>): any {
    const updateDto: any = {};

    if (branch.name) {
      updateDto.nameAr = branch.name;
      updateDto.nameEn = branch.name;
    }
    if (branch.address) {
      updateDto.addressAr = branch.address;
      updateDto.addressEn = branch.address;
    }
    if (branch.phone) updateDto.phoneNumber = branch.phone;
    if (branch.email) updateDto.email = branch.email;
    if (branch.coordinates) {
      updateDto.latitude = branch.coordinates.lat;
      updateDto.longitude = branch.coordinates.lng;
    }
    if (branch.status) updateDto.isActive = branch.status === 'active';
    if (branch.operatingHours) updateDto.workingHours = this.convertOperatingHoursToString(branch.operatingHours);

    return updateDto;
  }

  private extractCityFromAddress(address: string): string {
    // Simple city extraction logic - in a real app, this would be more sophisticated
    const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
    const foundCity = cities.find(city => address.toLowerCase().includes(city.toLowerCase()));
    return foundCity || 'Dubai'; // Default to Dubai
  }

  private parseWorkingHours(workingHours: string): any {
    // Parse working hours string into operatingHours object
    // For now, return a default structure - in a real app, this would parse the actual string
    const defaultHours = {
      open: '09:00',
      close: '18:00',
      isOpen: true
    };

    return {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours
    };
  }

  private convertOperatingHoursToString(operatingHours: any): string {
    // Convert operatingHours object to string format for API
    // For now, return a simple format - in a real app, this would create a proper string
    return '09:00-18:00 Mon-Sun';
  }

  // Customer conversion methods
  private convertCustomerFilterToDto(filter?: any): any {
    if (!filter) return {};

    return {
      name: filter.name,
      email: filter.email,
      phone: filter.phone,
      userRole: filter.userRole,
      preferredLanguage: filter.preferredLanguage,
      isActive: filter.isActive,
      emailVerified: filter.emailVerified,
      createdDateFrom: filter.createdDateFrom,
      createdDateTo: filter.createdDateTo,
      minBookings: filter.minBookings,
      maxBookings: filter.maxBookings,
      minSpent: filter.minSpent,
      maxSpent: filter.maxSpent,
      minLoyaltyPoints: filter.minLoyaltyPoints,
      maxLoyaltyPoints: filter.maxLoyaltyPoints,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      page: filter.page || 1,
      pageSize: filter.pageSize || 50
    };
  }

  private convertAdminCustomerDtosToCustomers(customers: any[]): Customer[] {
    if (!customers || !Array.isArray(customers)) {
      console.warn('Invalid customers array provided to convertAdminCustomerDtosToCustomers:', customers);
      return [];
    }

    return customers.map(customer => {
      try {
        return this.convertAdminCustomerDtoToCustomer(customer);
      } catch (error) {
        console.error('Error converting customer DTO:', customer, error);
        // Return null for failed conversions and filter them out
        return null;
      }
    }).filter(customer => customer !== null) as Customer[];
  }

  private convertAdminCustomerDtoToCustomer(customer: any): Customer {
    if (!customer) {
      throw new Error('Customer DTO is null or undefined');
    }

    // Split full name into first and last name
    const nameParts = (customer.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: customer.id || '',
      firstName: firstName,
      lastName: lastName,
      email: customer.email || '',
      phone: customer.phoneNumber || '',
      alternatePhone: undefined,
      dateOfBirth: new Date(), // API doesn't provide DOB
      nationality: 'Unknown', // API doesn't provide nationality
      gender: undefined,
      driverLicense: {
        number: 'Unknown',
        issuingCountry: 'Unknown',
        issueDate: new Date(),
        expiryDate: new Date(),
        licenseClass: 'Unknown'
      },
      address: {
        street: 'Unknown',
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        zipCode: 'Unknown'
      },
      emergencyContact: {
        name: 'Unknown',
        phone: 'Unknown',
        relationship: 'Unknown'
      },
      customerType: this.mapApiRoleToCustomerType(customer.userRole || 'Customer'),
      preferredLanguage: customer.preferredLanguage?.toLowerCase() || 'en',
      marketingConsent: false, // API doesn't provide this
      profileImage: undefined,
      loyaltyPoints: customer.availableLoyaltyPoints || 0,
      totalRentals: customer.totalBookings || 0,
      totalSpent: customer.totalSpent || 0,
      averageRating: 0, // API doesn't provide rating
      status: customer.isActive ? 'active' : 'inactive',
      verificationStatus: customer.emailConfirmed ? 'verified' : 'pending',
      documents: undefined,
      preferences: undefined,
      notes: undefined,
      createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
      updatedAt: customer.updatedAt ? new Date(customer.updatedAt) : new Date(),
      lastRentalDate: customer.lastBookingDate ? new Date(customer.lastBookingDate) : undefined,
      createdBy: 'system',
      isActive: customer.isActive,
      isBlacklisted: false, // API doesn't provide this
      licenseNumber: 'Unknown' // API doesn't provide this
    };
  }

  private mapApiRoleToCustomerType(apiRole: string): CustomerType {
    const roleMap: Record<string, CustomerType> = {
      'Customer': 'regular',
      'PremiumCustomer': 'premium',
      'VIPCustomer': 'premium', // Map VIP to premium since we don't have vip type
      'CorporateCustomer': 'corporate'
    };

    return roleMap[apiRole] || 'regular';
  }

  // Dashboard conversion methods
  private convertDashboardStatsDtoToStats(dashboardStatsDto: any): DashboardStats {
    if (!dashboardStatsDto) {
      throw new Error('Dashboard stats DTO is null or undefined');
    }

    const overallStats = dashboardStatsDto.overallStats || {};
    const carStats = dashboardStatsDto.carStats || {};

    return {
      totalVehicles: carStats.totalCars || 0,
      availableVehicles: carStats.availableCars || 0,
      activeBookings: overallStats.pendingBookings || 0,
      totalRevenue: overallStats.totalRevenue || 0,
      monthlyRevenue: dashboardStatsDto.revenueStats?.monthRevenue || 0,
      totalBranches: 5, // API doesn't provide this directly, using default
      totalCustomers: overallStats.totalCustomers || 0,
      maintenanceAlerts: carStats.maintenanceCars || 0
    };
  }

  // Debug method to test API connection
  debugAdminApi(): Observable<any> {
    console.log('🔧 Testing Admin API connection...');
    console.log('🔧 API Base URL:', this.adminApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.adminApiService.getAdmins({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Admin API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Admin API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Car API connection
  debugCarApi(): Observable<any> {
    console.log('🔧 Testing Car API connection...');
    console.log('🔧 Car API Base URL:', this.carApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.carApiService.getCars({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Car API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Car API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Booking API connection
  debugBookingApi(): Observable<any> {
    console.log('🔧 Testing Booking API connection...');
    console.log('🔧 Booking API Base URL:', this.bookingApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.bookingApiService.getBookings({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Booking API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Booking API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Advertisement API connection
  debugAdvertisementApi(): Observable<any> {
    console.log('🔧 Testing Advertisement API connection...');
    console.log('🔧 Advertisement API Base URL:', this.advertisementApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.advertisementApiService.getAdvertisements({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Advertisement API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Advertisement API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Branch API connection
  debugBranchApi(): Observable<any> {
    console.log('🔧 Testing Branch API connection...');
    console.log('🔧 Branch API Base URL:', this.branchApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.branchApiService.getBranches({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Branch API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Branch API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Dashboard API connection
  debugDashboardApi(): Observable<any> {
    console.log('🔧 Testing Dashboard API connection...');
    console.log('🔧 Dashboard API Base URL:', this.dashboardApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test dashboard stats endpoint
    return this.dashboardApiService.getDashboardStats().pipe(
      map(response => {
        console.log('✅ Dashboard API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Dashboard API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Debug method to test Customer API connection
  debugCustomerApi(): Observable<any> {
    console.log('🔧 Testing Customer API connection...');
    console.log('🔧 Customer API Base URL:', this.customerApiService['baseUrl']);
    console.log('🔧 Use Real API:', this.useRealApi);

    if (!this.useRealApi) {
      console.log('🎭 Real API is disabled, using mock data');
      return of({ message: 'Real API is disabled' });
    }

    // Test with minimal filter to see raw response
    return this.customerApiService.getCustomers({ page: 1, pageSize: 5 }).pipe(
      map(response => {
        console.log('✅ Customer API test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Customer API test failed:', error);
        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

 
}
