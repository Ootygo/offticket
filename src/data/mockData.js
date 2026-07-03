// Mock data shaped to match the DynamoDB schema exactly, so swapping
// src/lib/api.js over to real API Gateway calls later requires no page changes.

// Autocomplete suggestions only — From/To fields are free text so owners
// and customers can enter any city, town, or area, not just these.
export const TN_PLACES = [
  'Coimbatore', 'Ooty', 'Udhagamandalam', 'Mettupalayam', 'Coonoor', 'Kotagiri',
  'Gudalur', 'Pollachi', 'Tirupur', 'Erode', 'Salem', 'Karur', 'Namakkal',
  'Dindigul', 'Madurai', 'Tiruchirappalli', 'Thanjavur', 'Chennai', 'Vellore',
  'Kanchipuram', 'Cuddalore', 'Villupuram', 'Dharmapuri', 'Krishnagiri',
  'Hosur', 'Nagercoil', 'Tirunelveli', 'Thoothukudi', 'Sivakasi', 'Rajapalayam',
  'Theni', 'Kodaikanal', 'Palani', 'Karaikudi', 'Pudukkottai', 'Ramanathapuram',
]

// Backward-compatible alias used by a couple of pages.
export const CITIES = TN_PLACES

export const ROUTE_DISTANCES = {
  'Coimbatore-Ooty': 86,
  'Ooty-Coimbatore': 86,
  'Coimbatore-Mettupalayam': 35,
  'Mettupalayam-Coimbatore': 35,
  'Mettupalayam-Ooty': 51,
  'Ooty-Mettupalayam': 51,
}

export const VEHICLE_TYPES = [
  { value: 'mini_truck', label: 'Mini Truck', category: 'goods' },
  { value: 'truck', label: 'Truck', category: 'goods' },
  { value: 'pickup', label: 'Pickup', category: 'goods' },
  { value: 'cab', label: 'Cab (Sedan/SUV)', category: 'passenger' },
]

export const mockUsers = [
  { userId: 'u-001', name: 'Murugan S', phone: '9944110022', email: 'murugan@example.com', userType: 'owner', createdAt: '2026-05-02T08:00:00Z', kycStatus: 'verified' },
  { userId: 'u-002', name: 'Krishnan V', phone: '9944110033', email: 'krishnan@example.com', userType: 'owner', createdAt: '2026-05-10T08:00:00Z', kycStatus: 'verified' },
  { userId: 'u-003', name: 'Devi R', phone: '9944110044', email: 'devi@example.com', userType: 'customer', createdAt: '2026-06-01T08:00:00Z', kycStatus: 'pending' },
]

export const mockVehicles = [
  { vehicleId: 'v-101', ownerId: 'u-001', type: 'mini_truck', registrationNumber: 'TN 38 AB 4521', capacity: '750 kg', photo: null, verified: true },
  { vehicleId: 'v-102', ownerId: 'u-002', type: 'truck', registrationNumber: 'TN 43 CJ 9087', capacity: '3000 kg', photo: null, verified: true },
  { vehicleId: 'v-103', ownerId: 'u-001', type: 'cab', registrationNumber: 'TN 38 BX 7712', capacity: '4 seats', photo: null, verified: true },
  { vehicleId: 'v-104', ownerId: 'u-002', type: 'pickup', registrationNumber: 'TN 45 DK 3390', capacity: '1000 kg', photo: null, verified: false },
]

export const mockListings = [
  {
    listingId: 'l-1001',
    vehicleId: 'v-101',
    ownerId: 'u-001',
    ownerName: 'Murugan S',
    vehicleType: 'mini_truck',
    registrationNumber: 'TN 38 AB 4521',
    fromCity: 'Coimbatore',
    toCity: 'Ooty',
    departureDate: '2026-07-03',
    departureTime: '07:30',
    availableCapacity: '750 kg',
    pricePerUnit: 1400,
    normalPrice: 3200,
    driverRating: 4.6,
    tripsCompleted: 38,
    status: 'active',
    createdAt: '2026-07-01T06:00:00Z',
    isHeavyVehicle: false,
  },
  {
    listingId: 'l-1002',
    vehicleId: 'v-102',
    ownerId: 'u-002',
    ownerName: 'Krishnan V',
    vehicleType: 'truck',
    registrationNumber: 'TN 43 CJ 9087',
    fromCity: 'Coimbatore',
    toCity: 'Ooty',
    departureDate: '2026-07-03',
    departureTime: '09:00',
    availableCapacity: '2200 kg',
    pricePerUnit: 3800,
    normalPrice: 8500,
    driverRating: 4.3,
    tripsCompleted: 61,
    status: 'active',
    createdAt: '2026-07-01T07:10:00Z',
    isHeavyVehicle: true,
  },
  {
    listingId: 'l-1003',
    vehicleId: 'v-103',
    ownerId: 'u-001',
    ownerName: 'Murugan S',
    vehicleType: 'cab',
    registrationNumber: 'TN 38 BX 7712',
    fromCity: 'Ooty',
    toCity: 'Coimbatore',
    departureDate: '2026-07-03',
    departureTime: '16:00',
    availableCapacity: '3 seats',
    pricePerUnit: 350,
    normalPrice: 700,
    driverRating: 4.8,
    tripsCompleted: 122,
    status: 'active',
    createdAt: '2026-07-01T05:45:00Z',
    isHeavyVehicle: false,
  },
  {
    listingId: 'l-1004',
    vehicleId: 'v-104',
    ownerId: 'u-002',
    ownerName: 'Krishnan V',
    vehicleType: 'pickup',
    registrationNumber: 'TN 45 DK 3390',
    fromCity: 'Mettupalayam',
    toCity: 'Ooty',
    departureDate: '2026-07-04',
    departureTime: '10:30',
    availableCapacity: '600 kg',
    pricePerUnit: 900,
    normalPrice: 2000,
    driverRating: 4.1,
    tripsCompleted: 15,
    status: 'active',
    createdAt: '2026-07-01T09:20:00Z',
    isHeavyVehicle: false,
  },
]

export const mockBookings = [
  {
    bookingId: 'OT-20260628-8841',
    listingId: 'l-1003',
    customerId: 'u-003',
    ownerId: 'u-001',
    goodsDetails: null,
    passengerCount: 2,
    totalPrice: 700,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-06-28T10:00:00Z',
  },
]

export const RECENT_TRIPS_COUNT = 1284
