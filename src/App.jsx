import React from "react";
import "./styles/App.css";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import Aside from "./components/Aside";
import "./styles/darkTheme.css";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Header />
          <ThemeToggle />
          <Aside />
          <main className="main-content">
            <AppRoutes />
          </main>
          {/* <Footer /> */}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
