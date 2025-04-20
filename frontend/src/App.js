import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;
