import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estados para gestionar el usuario y el login
  const [usuari, setUsuari] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isBilbiotecari, setIsBilbiotecari] = useState(false);
  const [isAdministrador, setIsAdministrador] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar la visibilidad del perfil
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  // Estado para controlar la visibilidad del login
  const [mostrarLogin, setMostrarLogin] = useState(false);

  // Función para cerrar sesión
  const handleLogOut = async () => {
    try {
      // Realizar logout en el backend
      await fetch("http://localhost:8000/accounts/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar estados locales
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      setUsuari(null);
      setIsLogged(false);
      setIsAdministrador(false);
      setIsBilbiotecari(false);
      setMostrarPerfil(false);
      setMostrarLogin(false);

      // Redirigir a la página de catálogo en lugar de login
      window.location.href = "/cataleg";
    }
  };

  // Obtener CSRF token de las cookies
  const getCsrfToken = () => {
    const name = "csrftoken=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }

    return "";
  };

  // Verificar la sesión con el backend al cargar
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Primero intentamos recuperar datos del sessionStorage
        const storedUserData = sessionStorage.getItem("userData");
        const storedToken = sessionStorage.getItem("token");

        if (storedUserData && storedToken) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log("Loading stored user data:", userData);

            // Properly detect roles with robust type checking
            const isAdmin =
              userData.is_superuser === true || userData.is_superuser === "true" || userData.is_superuser === 1;
            const isLibrarian = userData.is_staff === true || userData.is_staff === "true" || userData.is_staff === 1;

            console.log(
              "User roles from storage -",
              `is_superuser:`,
              userData.is_superuser,
              `(${typeof userData.is_superuser})`,
              `is_staff:`,
              userData.is_staff,
              `(${typeof userData.is_staff})`,
              `Detected admin:`,
              isAdmin,
              `Detected librarian:`,
              isLibrarian
            );

            // Update state with proper role detection
            setUsuari(userData);
            setIsLogged(true);
            setIsAdministrador(isAdmin);
            setIsBilbiotecari(isLibrarian);

            // Verify data completeness regardless of token type
            if (!userData.first_name || !userData.last_name || typeof userData.is_staff === "undefined") {
              console.log("Fetching complete user data from API...");
              try {
                const response = await fetch("http://localhost:8000/api/usuari/", {
                  headers: {
                    Authorization: `Bearer ${storedToken}`,
                  },
                });

                if (response.ok) {
                  const completeUserData = await response.json();
                  console.log("Received complete user data:", completeUserData);

                  // Explicit role detection from API response
                  const apiIsAdmin =
                    completeUserData.is_superuser === true ||
                    completeUserData.is_superuser === "true" ||
                    completeUserData.is_superuser === 1;
                  const apiIsLibrarian =
                    completeUserData.is_staff === true ||
                    completeUserData.is_staff === "true" ||
                    completeUserData.is_staff === 1;

                  console.log(
                    "User roles from API -",
                    `is_superuser:`,
                    completeUserData.is_superuser,
                    `(${typeof completeUserData.is_superuser})`,
                    `is_staff:`,
                    completeUserData.is_staff,
                    `(${typeof completeUserData.is_staff})`,
                    `Detected admin:`,
                    apiIsAdmin,
                    `Detected librarian:`,
                    apiIsLibrarian
                  );

                  setUsuari(completeUserData);
                  setIsAdministrador(apiIsAdmin);
                  setIsBilbiotecari(apiIsLibrarian);
                  sessionStorage.setItem("userData", JSON.stringify(completeUserData));
                }
              } catch (apiError) {
                console.error("Error fetching user data from API:", apiError);
              }
            }
          } catch (error) {
            console.error("Error processing stored user data:", error);
            // Clear invalid data
            sessionStorage.removeItem("userData");
            sessionStorage.removeItem("token");
            setUsuari(null);
            setIsLogged(false);
            setIsAdministrador(false);
            setIsBilbiotecari(false);
          }
        } else {
          // Handle session endpoint logic...
          // No change needed here
        }
      } catch (error) {
        // Error handling, no change needed
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuari,
        setUsuari,
        isLogged,
        setIsLogged,
        isBilbiotecari,
        isAdministrador,
        errorProfile,
        setErrorProfile,
        mostrarPerfil,
        setMostrarPerfil,
        mostrarLogin,
        setMostrarLogin,
        handleLogOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
