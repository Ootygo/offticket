import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import ListVehicle from './pages/owner/ListVehicle'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import About from './pages/About'
import Login from './pages/Login'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="list-vehicle" element={<ListVehicle />} />
            <Route path="booking/:listingId" element={<Booking />} />
            <Route path="booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="owner/dashboard" element={<OwnerDashboard />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
