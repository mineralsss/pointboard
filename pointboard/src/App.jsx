import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Base from "./base";
import Login from "./Login";
import MainMenu from "./MainMenu";
import Register from "./Register";

// Home component - you can replace this with your actual home page
function Home() {
  return (
    <Base>
      <div>
        <h1>Chào mừng đến với PointBoard!</h1>
        <p>Đăng nhập hoặc Đăng ký để tiếp tục.</p>
      </div>
    </Base>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mainmenu" element={<MainMenu />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
