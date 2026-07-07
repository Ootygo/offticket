// Mock data shaped to match the DynamoDB schema exactly, so swapping
// src/lib/api.js over to real API Gateway calls later requires no page changes.

// Autocomplete suggestions only — From/To fields are free text so owners
// and customers can enter any city, town, or area across Tamil Nadu, not
// just these.
export const TN_PLACES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirupur',
  'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Tirunelveli',
  'Karur', 'Namakkal', 'Ooty', 'Udhagamandalam', 'Mettupalayam', 'Coonoor',
  'Kotagiri', 'Gudalur', 'Pollachi', 'Kanchipuram', 'Cuddalore', 'Villupuram',
  'Dharmapuri', 'Krishnagiri', 'Hosur', 'Nagercoil', 'Sivakasi', 'Rajapalayam',
  'Theni', 'Kodaikanal', 'Palani', 'Karaikudi', 'Pudukkottai', 'Ramanathapuram',
  'Nagapattinam', 'Ariyalur', 'Perambalur', 'Tiruvannamalai',
]

// Backward-compatible alias used by a couple of pages.
export const CITIES = TN_PLACES

// Approximate road distances (km) for commonly-searched Tamil Nadu routes.
// Not exhaustive — VehicleResultCard already renders fine without a distance
// when a route isn't in this table, so this only needs to cover the busiest
// pairs, not every possible combination of TN_PLACES.
export const ROUTE_DISTANCES = {
  'Coimbatore-Ooty': 86, 'Ooty-Coimbatore': 86,
  'Coimbatore-Mettupalayam': 35, 'Mettupalayam-Coimbatore': 35,
  'Mettupalayam-Ooty': 51, 'Ooty-Mettupalayam': 51,
  'Chennai-Coimbatore': 500, 'Coimbatore-Chennai': 500,
  'Chennai-Madurai': 460, 'Madurai-Chennai': 460,
  'Chennai-Tiruchirappalli': 320, 'Tiruchirappalli-Chennai': 320,
  'Chennai-Salem': 340, 'Salem-Chennai': 340,
  'Chennai-Vellore': 140, 'Vellore-Chennai': 140,
  'Chennai-Cuddalore': 190, 'Cuddalore-Chennai': 190,
  'Chennai-Krishnagiri': 300, 'Krishnagiri-Chennai': 300,
  'Chennai-Hosur': 305, 'Hosur-Chennai': 305,
  'Coimbatore-Salem': 160, 'Salem-Coimbatore': 160,
  'Coimbatore-Madurai': 215, 'Madurai-Coimbatore': 215,
  'Coimbatore-Erode': 100, 'Erode-Coimbatore': 100,
  'Coimbatore-Tirupur': 50, 'Tirupur-Coimbatore': 50,
  'Coimbatore-Pollachi': 40, 'Pollachi-Coimbatore': 40,
  'Coimbatore-Palani': 100, 'Palani-Coimbatore': 100,
  'Salem-Erode': 65, 'Erode-Salem': 65,
  'Salem-Tiruchirappalli': 160, 'Tiruchirappalli-Salem': 160,
  'Salem-Namakkal': 55, 'Namakkal-Salem': 55,
  'Madurai-Tiruchirappalli': 130, 'Tiruchirappalli-Madurai': 130,
  'Madurai-Tirunelveli': 150, 'Tirunelveli-Madurai': 150,
  'Madurai-Karaikudi': 90, 'Karaikudi-Madurai': 90,
  'Madurai-Kodaikanal': 120, 'Kodaikanal-Madurai': 120,
  'Madurai-Rajapalayam': 90, 'Rajapalayam-Madurai': 90,
  'Madurai-Dindigul': 65, 'Dindigul-Madurai': 65,
  'Tiruchirappalli-Thanjavur': 55, 'Thanjavur-Tiruchirappalli': 55,
  'Tirunelveli-Thoothukudi': 50, 'Thoothukudi-Tirunelveli': 50,
  'Tirunelveli-Nagercoil': 85, 'Nagercoil-Tirunelveli': 85,
  'Thoothukudi-Sivakasi': 75, 'Sivakasi-Thoothukudi': 75,
}

// Towns within Nilgiris district — routes touching any of these need the
// e-pass banner and the heavy-vehicle peak-season note; the rest of the TN
// network doesn't have this restriction.
export const NILGIRIS_TOWNS = ['Ooty', 'Udhagamandalam', 'Coonoor', 'Kotagiri', 'Gudalur']

export function isNilgirisRoute(fromCity, toCity) {
  return NILGIRIS_TOWNS.includes(fromCity) || NILGIRIS_TOWNS.includes(toCity)
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
  { userId: 'u-004', name: 'Saravanan P', phone: '9944110055', email: 'saravanan@example.com', userType: 'owner', createdAt: '2026-05-15T08:00:00Z', kycStatus: 'verified' },
]

export const mockVehicles = [
  { vehicleId: 'v-101', ownerId: 'u-001', type: 'mini_truck', registrationNumber: 'TN 38 AB 4521', capacity: '750 kg', photo: null, verified: true },
  { vehicleId: 'v-102', ownerId: 'u-002', type: 'truck', registrationNumber: 'TN 43 CJ 9087', capacity: '3000 kg', photo: null, verified: true },
  { vehicleId: 'v-103', ownerId: 'u-001', type: 'cab', registrationNumber: 'TN 38 BX 7712', capacity: '4 seats', photo: null, verified: true },
  { vehicleId: 'v-104', ownerId: 'u-002', type: 'pickup', registrationNumber: 'TN 45 DK 3390', capacity: '1000 kg', photo: null, verified: false },
  { vehicleId: 'v-105', ownerId: 'u-004', type: 'truck', registrationNumber: 'TN 09 EF 6621', capacity: '4000 kg', photo: null, verified: true },
  { vehicleId: 'v-106', ownerId: 'u-004', type: 'cab', registrationNumber: 'TN 58 GH 1123', capacity: '4 seats', photo: null, verified: true },
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
  {
    listingId: 'l-1005',
    vehicleId: 'v-105',
    ownerId: 'u-004',
    ownerName: 'Saravanan P',
    vehicleType: 'truck',
    registrationNumber: 'TN 09 EF 6621',
    fromCity: 'Chennai',
    toCity: 'Madurai',
    departureDate: '2026-07-05',
    departureTime: '06:00',
    availableCapacity: '3200 kg',
    pricePerUnit: 5200,
    normalPrice: 11500,
    driverRating: 4.5,
    tripsCompleted: 47,
    status: 'active',
    createdAt: '2026-07-02T08:00:00Z',
    isHeavyVehicle: true,
  },
  {
    listingId: 'l-1006',
    vehicleId: 'v-106',
    ownerId: 'u-004',
    ownerName: 'Saravanan P',
    vehicleType: 'cab',
    registrationNumber: 'TN 58 GH 1123',
    fromCity: 'Madurai',
    toCity: 'Tiruchirappalli',
    departureDate: '2026-07-05',
    departureTime: '14:30',
    availableCapacity: '3 seats',
    pricePerUnit: 550,
    normalPrice: 1300,
    driverRating: 4.7,
    tripsCompleted: 89,
    status: 'active',
    createdAt: '2026-07-02T09:15:00Z',
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
