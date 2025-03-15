import { Route, Routes} from "react-router-dom"
import AuthLayout from "@/components/auth/auth-layout"
import SignInPage from "@/pages/auth/sign-in"
import SignUpPage from "@/pages/auth/sign-up"
import axios from "axios"
import { Toaster} from 'sonner'
import CheckAuth from "./components/auth/check-auth"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "./store/store"
import { useEffect } from "react"
import { checkAuth } from "./store/auth-slice"
import VerifyEmail from "./pages/auth/verify-email"
import ForgotPassword from "./pages/auth/forgot-password"
import ResetPassword from "./pages/auth/reset-password"
import Header from "./components/header"
import Footer from "./components/footer"
import About from "./pages/about"
import Contact from "./pages/contact"
import Home from "./pages/home"
import Profile from "./pages/user/profile"
import AdminLayout from "./components/admin/admin-layout"
import AdminProducts  from "./pages/admin/products"
import WebInterface from "./pages/admin/web-interface"
import { loadWebInterface } from "./store/web-interface-slice"
import Categories from "./pages/admin/categories"
import UserLayout from "./components/user/user-layout"
import Category from "./pages/admin/categories/category-slug"
import Loading from "./components/custom/loading"
import NotFound from "./components/not-found"
import { getAllCategories } from "./store/admin-slice/category"
import Modals from "./components/modals/modals"
import EventsManagement from "./pages/admin/events-management"
import { getAllEvents } from "./store/admin-slice/event"
import Account from "./pages/admin/account"
import ProductLayout from "./components/product/product-layout"
import Product from "./pages/product/product-id"
import Products from "./pages/product/index"
import Cart from "./pages/user/cart"
import Orders from "./pages/admin/orders"
import AdminProduct from "./pages/admin/products/product-id"
function App() {
  axios.defaults.withCredentials = true
  const {isAuthenticated, isLoading: isCheckAuthLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const {isLoading: isWebInterfaceLoading } = useSelector(
    (state: RootState) => state.webInterface
  )
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch, isAuthenticated]);
  useEffect(() => {
    dispatch(loadWebInterface());
    dispatch(getAllCategories());
    dispatch(getAllEvents());
  }, [dispatch])
  if (isCheckAuthLoading || isWebInterfaceLoading) {
    return <Loading/>
  };
  return (
    <div className="flex flex-col overflow-x-hidden">
      <Toaster position="bottom-right" richColors/>
      <CheckAuth>
      <Modals />
      <Header />
      <div className="min-h-screen min-w-screen">
        <Routes>
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/" element={<Home />} />
          <Route element={
            <AuthLayout />
          }>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail/>} />
          </Route>
          <Route path="/user" element={
            <UserLayout />
          }>
            <Route path="profile" element={<Profile />} />
            <Route path="cart" element={<Cart />} />
          </Route>
          <Route path="/product" element={
            <ProductLayout/>
          }>
            <Route path=":productId" element={<Product />} />
            <Route index element={<Products />} />
          </Route>
          <Route path="/admin" element={
            <AdminLayout />
          }>
            <Route path="products" >
              <Route index element={<AdminProducts />} />
              <Route path=":productId" element={<AdminProduct />} />
            </Route>
            <Route path="web-interface" element={<WebInterface />} />
            <Route path="categories" >
              <Route index element={<Categories />} />
              <Route path="*" element={<Category />} />
            </Route>
            <Route path="events-management" element={<EventsManagement />} />
            <Route path="orders" element={<Orders />} />
            <Route path="account" element={<Account />} />
            <Route index element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      </CheckAuth>
    </div>
  )
}

export default App
