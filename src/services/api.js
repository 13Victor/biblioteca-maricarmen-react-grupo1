// API base URL - ajusta según tu configuración
const API_BASE_URL = "http://localhost:8000/api"; // Cambiar a la URL de producción cuando sea necesario

// Función para obtener libros
export const getBooks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/llibres/`);
    if (!response.ok) {
      throw new Error("Error al obtener libros");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getBooks:", error);
    return [];
  }
};

// Función para obtener ejemplares
export const getExemplars = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/exemplars/`);
    if (!response.ok) {
      throw new Error("Error al obtener ejemplares");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getExemplars:", error);
    return [];
  }
};

// Función para obtener ejemplares por item de catálogo
export const getExemplarsByItem = async (itemId) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/exemplars/by-item/${itemId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener ejemplares del item (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getExemplarsByItem:", error);
    return [];
  }
};

// Función para obtener un ejemplar específico por ID
export const getExemplarById = async (exemplarId) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      throw new Error("No hay token de autenticación. Debes iniciar sesión.");
    }

    console.log(`Requesting exemplar ${exemplarId} with token`);
    
    const response = await fetch(`${API_BASE_URL}/exemplars/${exemplarId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    // Log response details for debugging
    console.log(`Response status: ${response.status}`);
    
    if (response.status === 401) {
      throw new Error("No estás autorizado para ver este ejemplar");
    }
    
    if (response.status === 404) {
      throw new Error("Ejemplar no encontrado");
    }
    
    if (!response.ok) {
      let errorMessage = `Error al obtener el ejemplar (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Exemplar data:", data);
    return data;
  } catch (error) {
    console.error("Error en getExemplarById:", error);
    throw error;
  }
};

// Función para obtener usuarios disponibles para préstamos
export const getAvailableUsers = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      throw new Error("No hay token de autenticación. Debes iniciar sesión.");
    }

    console.log(`Requesting available users with token: ${token.substring(0, 10)}...`);
    
    const response = await fetch(`${API_BASE_URL}/usuarios-disponibles/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      throw new Error(`Error al obtener usuarios (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getAvailableUsers:", error);
    throw error;
  }
};

// Función para crear un préstamo
export const createLoan = async (loanData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(`${API_BASE_URL}/prestecs/crear/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(loanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || `Error al crear el préstamo (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createLoan:", error);
    throw error;
  }
};

// Función para búsqueda con autocompletado
export const searchSuggestions = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const response = await fetch(`${API_BASE_URL}/cataleg/search/suggestions/?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la respuesta del servidor:", errorText);
      throw new Error(`Error al obtener sugerencias (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en searchSuggestions:", error);
    return [];
  }
};

// Función para búsqueda completa
export const searchCatalog = async (query) => {
  try {
    const url =
      query.trim() === ""
        ? `${API_BASE_URL}/cataleg/search/`
        : `${API_BASE_URL}/cataleg/search/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la respuesta del servidor:", errorText);
      throw new Error(`Error al realizar la búsqueda (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en searchCatalog:", error);
    throw error;
  }
};
