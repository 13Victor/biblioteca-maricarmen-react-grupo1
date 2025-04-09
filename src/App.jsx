import './App.css';
import BookList from './components/BookList';
import './styles.css';
import Header from './components/Header';
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
    <div className="App">
      <Header />
      <BookList />
    </div>
    </AuthProvider>
  );
}

export default App;
