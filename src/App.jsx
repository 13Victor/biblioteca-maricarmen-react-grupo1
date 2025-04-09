import './App.css';
import CatalogSearchPage from './components/CatalogSearchPage';
import Header from './components/Header';
import { AuthProvider } from "./context/AuthContext";
import ImportCSV from "./components/ImportCSV";
import "./styles/styles.css";

function App() {
  return (
    <AuthProvider>
    <div className="App">
      <Header />
      <CatalogSearchPage />
      <div className="ImportCSV">
        <ImportCSV />
      </div>
    </div>
    </AuthProvider>
  );

}
export default App;