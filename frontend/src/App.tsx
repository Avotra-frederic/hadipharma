import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/home/Home"
import Main from "./components/layouts/Main"
import Pharmacy from "./pages/home/Pharmacy"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import UserProfile from "./pages/home/UserProfil"
import ProfileOrders from "./pages/home/ProfileOrders"
import ProfilePrescriptions from "./pages/home/ProfilePrescriptions"
import ProfileFavorites from "./pages/home/ProfileFavorites"
import ProfileAddresses from "./pages/home/ProfileAddresses"
import ProfilePayments from "./pages/home/ProfilePayments"
import ProfileSettings from "./pages/home/ProfileSettings"
import SettingsNotifications from "./pages/home/SettingsNotifications"
import SettingsSecurity from "./pages/home/SettingsSecurity"
import SettingsPrivacy from "./pages/home/SettingsPrivacy"
import NotFound from "./pages/error/NotFound"
import { ProtectedRoute, GuestRoute, AdminRoute, SuperAdminRoute } from "./features/auth"
import Pharmacies from "./pages/home/Pharmacies"
import RegisterPharmacy from "./pages/home/RegisterPharmacy"
import AdminPanel from "./pages/admin/AdminPanel"
import SuperAdminPanel from "./pages/admin/SuperAdminPanel"
import Cart from "./pages/home/Cart"
import Checkout from "./pages/home/Checkout"
import Help from "./pages/home/Help"
import SearchPage from "./pages/home/Search"
import { CartProvider } from "./features/cart"
import { ToastProvider } from "./features/ui/toast"
import { NotificationProvider, usePharmacyValidationNotification } from "./features/notifications"
import { MobileAppShell } from "./mobile/MobileAppShell"
import { MobileHome } from "./mobile/MobileHome"
import { MobileOrders } from "./mobile/MobileOrders"

function NotificationToasts() {
  usePharmacyValidationNotification();
  return null;
}

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
      <NotificationToasts />
      <CartProvider>
        <BrowserRouter>
          <Routes>
          <Route path="*" Component={NotFound} />
          <Route path="/mobile" element={
            <MobileAppShell>
              <MobileHome />
            </MobileAppShell>
          } />
          <Route path="/mobile/orders" element={
            <MobileAppShell>
              <MobileOrders />
            </MobileAppShell>
          } />
          <Route path="" Component={Main}>
            <Route path="" Component={Home} />
            <Route path="/pharmacy/:id" Component={Pharmacy} />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/pharmacies" Component={Pharmacies} />
          <Route path="/help" Component={Help} />
          <Route path="/search" Component={SearchPage} />

          <Route path="/profil" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/profil/commandes" element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          } />
          <Route path="/profil/ordonnances" element={
            <ProtectedRoute>
              <ProfilePrescriptions />
            </ProtectedRoute>
          } />
          <Route path="/profil/favoris" element={
            <ProtectedRoute>
              <ProfileFavorites />
            </ProtectedRoute>
          } />
          <Route path="/profil/adresses" element={
            <ProtectedRoute>
              <ProfileAddresses />
            </ProtectedRoute>
          } />
          <Route path="/profil/paiements" element={
            <ProtectedRoute>
              <ProfilePayments />
            </ProtectedRoute>
          } />
          <Route path="/profil/parametres" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />
          <Route path="/profil/parametres/notifications" element={
            <ProtectedRoute>
              <SettingsNotifications />
            </ProtectedRoute>
          } />
          <Route path="/profil/parametres/securite" element={
            <ProtectedRoute>
              <SettingsSecurity />
            </ProtectedRoute>
          } />
          <Route path="/profil/parametres/confidentialite" element={
            <ProtectedRoute>
              <SettingsPrivacy />
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/register" element={
            <ProtectedRoute>
              <RegisterPharmacy />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/superadmin" element={
            <SuperAdminRoute>
              <SuperAdminPanel />
            </SuperAdminRoute>
          } />
          <Route path="/auth/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/auth/register" element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />
        </Routes>
        </BrowserRouter>
      </CartProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App
