import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './pages/Logout';
import Login from './pages/Login'
import Home from './pages/Home';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />    
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout   />} />
        <Route path="/register" element={<Register   />} />
      </Routes>
    </Router>
  );
}

export default App;
