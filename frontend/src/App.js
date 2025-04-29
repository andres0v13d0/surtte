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
        <Route path="/messages/user-chat" element={<UserChat />} />
      </Routes>
    </Router>
  );
}

export default App;
