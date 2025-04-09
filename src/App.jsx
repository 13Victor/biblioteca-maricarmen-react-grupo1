import { useState } from 'react';
import './App.css';
import BookList from './components/BookList';
import './styles.css';
import CatalogSearch from './components/CatalogSearch';
import CatalogSearchPage from './components/CatalogSearchPage';

function App() {
  return (
    <div className="App">
      <CatalogSearchPage />
    </div>
  );
}

export default App;
