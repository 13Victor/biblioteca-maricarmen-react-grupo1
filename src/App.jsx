import './App.css';
import BookList from './components/BookList';
import './styles.css';
import CatalogSearch from './components/CatalogSearch';
import CatalogSearchPage from './components/CatalogSearchPage';
import Header from './components/Header';
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
    <div className="App">
      <Header />
      <CatalogSearchPage />
    </div>
    </AuthProvider>
  );
}

export default App;
