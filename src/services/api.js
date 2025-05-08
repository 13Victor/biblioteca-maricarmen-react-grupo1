// API base URL - ajusta según tu configuración
const API_BASE_URL = "http://localhost:8000/api";

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

export const getExemplarsByItem = async (itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/exemplars/by-item/${itemId}`);

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
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
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
            let errorMessage = "Error al crear el préstamo";

            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.mensaje) {
                    errorMessage = errorData.mensaje;
                }
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
                errorMessage = `Error al crear el préstamo (${response.status})`;
            }

            throw new Error(errorMessage);
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

// Función para obtener sugerencias de búsqueda de ejemplares
export const searchExemplarSuggestions = async (query) => {
    if (!query || query.trim() === "") return [];

    try {
        const response = await fetch(`${API_BASE_URL}/exemplars/search/suggestions/?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error en la respuesta del servidor:", errorText);
            throw new Error(`Error al obtener sugerencias de ejemplares (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en searchExemplarSuggestions:", error);
        return [];
    }
};

// Función para realizar búsqueda completa de ejemplares
export const searchExemplars = async (query) => {
    try {
        const url =
            query.trim() === ""
                ? `${API_BASE_URL}/exemplars/search/`
                : `${API_BASE_URL}/exemplars/search/?q=${encodeURIComponent(query)}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error en la respuesta del servidor:", errorText);
            throw new Error(`Error al realizar la búsqueda de ejemplares (${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en searchExemplars:", error);
        throw error;
    }
};

// Función para generar etiquetas PDF desde el backend
export const generateLabelsPDF = async (exemplarIds) => {
    try {
        const token = sessionStorage.getItem("token");
        console.log("Enviando solicitud para generar etiquetas:", exemplarIds);

        // Configurar la petición correctamente - quita la barra final de la URL
        const response = await fetch(`${API_BASE_URL}/exemplars/generate-labels`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                exemplar_ids: exemplarIds,
            }),
            credentials: "include",
            redirect: "follow",
        });

        console.log("Estado de respuesta:", response.status, response.statusText);
        console.log("Tipo de contenido:", response.headers.get("content-type"));

        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al generar etiquetas (${response.status})`);
            } else {
                const errorText = await response.text();
                throw new Error(`Error al generar etiquetas (${response.status}): ${errorText || response.statusText}`);
            }
        }

        // Si llegamos aquí, sabemos que la respuesta es OK
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/pdf")) {
            return await response.blob();
        } else {
            throw new Error(`Respuesta inesperada del servidor: ${contentType}`);
        }
    } catch (error) {
        console.error("Error en generateLabelsPDF:", error);
        throw error;
    }
};
