import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./styles/App.css";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import Aside from "./components/Aside";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

function App() {

  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <ThemeToggle/>
          <Aside/>
          <main className="main-content">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
