import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import "./styles/styles.css";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [currentComponent, setCurrentComponent] = useState('catalog');

  const handleComponentChange = (component) => {
    setCurrentComponent(component);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;
