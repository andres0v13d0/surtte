import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Logout from './pages/Logout/Logout';
import Login from './pages/Login/Login'
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Categories from './pages/Categories/Categories';
import Chat from './pages/Chat/Chat';
import MyProducts from './pages/MyProducts/MyProducts';
import AddProduct from './pages/AddProduct/AddProduct';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import CartPage from './pages/CartPage/CartPage';
import ProductInfoWrapper from './utils/ProductInfoWrapper/ProductInfoWrapper';
import UserChat from './pages/UserChat/UserChat';
import Favorites from './pages/Favorites/Favorites';
import EditProduct from './pages/EditProduct/EditProduct';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import AdminDash from './pages/AdminDash/AdminDash';
import ProviderRequest from './pages/ProviderRequest/ProviderRequest';
import Plans from './pages/Plans/Plans';
import MyOrders from './pages/MyOrder/MyOrders';
import SearchPage from './pages/SearchPage/SearchPage';
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import OrderInfo from './pages/OrderInfo/OrderInfo';

const titles = {
  '/': 'Inicio - SURTTE',
  '/login': 'Iniciar sesión - SURTTE',
  '/logout': 'Cerrar sesión - SURTTE',
  '/register': 'Registrarse - SURTTE',
  '/profile': 'Perfil - SURTTE',
  '/categories': 'Categorías - SURTTE',
  '/messages': 'Chat - SURTTE',
  '/my-products': 'Mis productos - SURTTE',
  '/add-product': 'Agregar producto - SURTTE',
  '/cart': 'Carrito - SURTTE',
  '/user-chat': 'Chat de usuario - SURTTE',
  '/favorites': 'Favoritos - SURTTE',
  '/my-orders': 'Mis pedidos - SURTTE',
  '/admin': 'Panel de administración - SURTTE',
  '/solicitud': 'Solicitar ser proveedor - SURTTE',
  '/mis-pedidos': 'Mis pedidos - SURTTE',
  '/condiciones': 'Condiciones de uso - SURTTE',
  '/politica': 'Política de privacidad - SURTTE',
  '/orden': 'Información de pedido - SURTTE',
};

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const basePath = location.pathname.split('/')[1] ? `/${location.pathname.split('/')[1]}` : '/';
    document.title = titles[basePath] || 'SURTTE';
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        <Route path="/" element={<Home />} />    
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout   />} />
        <Route path="/register" element={<Register   />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/messages" element={<Chat />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/sub-category/:subCategorySlug" element={<CategoryPage />} />
        <Route path="/category/:categorySlug" element={<CategoryPage />} />
        <Route path="/product/:uuid" element={<ProductInfoWrapper />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/messages/user-chat/:id" element={<UserChat />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/edit-product/:uuid" element={<EditProduct />} />
        <Route path="/my-orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path='/solicitud' element={<ProviderRequest />} />
        <Route path='/plans' element={<Plans />} />
        <Route path='/mis-pedidos' element={<MyOrders />} />
        <Route path="/buscar/:text" element={<SearchPage />} />
        <Route path="/condiciones" element={<TermsAndConditions />} />
        <Route path="/politica" element={<PrivacyPolicy />} />
        <Route path="/orden/:uuid" element={<OrderInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
