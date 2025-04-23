import "./App.css";
import CatalogSearchPage from "./components/CatalogSearchPage";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import "./styles/styles.css";
import ModoAdminCSV from "./components/ModoAdminCSV";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <ModoAdminCSV />
        <CatalogSearchPage />
      </div>
    </AuthProvider>
  );
}
export default App;
