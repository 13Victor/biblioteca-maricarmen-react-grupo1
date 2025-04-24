
import CatalogSearchPage from './components/CatalogSearchPage';
import Header from './components/Header';
import { AuthProvider } from "./context/AuthContext";
import "./styles/styles.css";
import ModoAdminCSV from './components/ModoAdminCSV';
import Footer from './components/Footer';
import Aside from './components/Aside';
import { useState } from 'react';
import "./styles/App.css";

function App() {
  const [currentComponent, setCurrentComponent] = useState('catalog');

  const handleComponentChange = (component) => {
    setCurrentComponent(component);
  };

  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <Aside onComponentChange={handleComponentChange} />
        <div id="main-content">
          {currentComponent === 'catalog' && <CatalogSearchPage />}
          {currentComponent === 'importCSV' && <ModoAdminCSV />}
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
export default App;