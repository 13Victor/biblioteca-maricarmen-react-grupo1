// API base URL - ajusta según tu configuración
const API_BASE_URL = 'http://localhost:8000/api';

// Función para obtener libros
export const getBooks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/llibres/`);
    if (!response.ok) {
      throw new Error('Error al obtener libros');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getBooks:', error);
    return [];
  }
};

// Función para obtener ejemplares
export const getExemplars = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/exemplars/`);
    if (!response.ok) {
      throw new Error('Error al obtener ejemplares');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getExemplars:', error);
    return [];
  }
};

// Función para búsqueda con autocompletado
export const searchSuggestions = async (query) => {
  if (!query || query.trim() === '') return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/cataleg/search/suggestions/?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta del servidor:', errorText);
      throw new Error(`Error al obtener sugerencias (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en searchSuggestions:', error);
    return [];
  }
};

// Función para búsqueda completa
export const searchCatalog = async (query) => {
  try {
    const url = query.trim() === '' 
      ? `${API_BASE_URL}/cataleg/search/` 
      : `${API_BASE_URL}/cataleg/search/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta del servidor:', errorText);
      throw new Error(`Error al realizar la búsqueda (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en searchCatalog:', error);
    throw error;
  }
};