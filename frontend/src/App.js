import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './pages/Logout';
import Login from './pages/Login'
import Home from './pages/Home';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Chat from './pages/Chat';
import MyProducts from './pages/MyProducts';
import AddProduct from './pages/AddProduct';

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
      </Routes>
    </Router>
  );
}

export default App;
