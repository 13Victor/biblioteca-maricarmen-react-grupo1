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

      // Redirigir a la página de login
      window.location.href = "/login?logged_out=true";
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
          const userData = JSON.parse(storedUserData);
          setUsuari(userData);
          setIsLogged(true);
          setIsAdministrador(userData.is_superuser);
          setIsBilbiotecari(userData.is_staff);

          // A pesar de tener datos en sessionStorage, verificamos con el backend
          // para mantener la consistencia y obtener datos actualizados
          try {
            const response = await fetch("http://localhost:8000/api/usuari/", {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });

            if (response.ok) {
              const freshUserData = await response.json();
              // Si hay diferencias, actualizamos
              if (JSON.stringify(freshUserData) !== JSON.stringify(userData)) {
                setUsuari(freshUserData);
                sessionStorage.setItem("userData", JSON.stringify(freshUserData));
                setIsAdministrador(freshUserData.is_superuser);
                setIsBilbiotecari(freshUserData.is_staff);
              }
            }
          } catch (err) {
            // Si falla la verificación, seguimos usando los datos del sessionStorage
            console.log("Usando datos de sesión locales, error al verificar:", err);
          }
        } else {
          // Si no hay datos en sessionStorage, intentamos con la API de sesión
          const response = await fetch("http://localhost:8000/api/auth/session/", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();

            if (data.isAuthenticated && data.user) {
              setUsuari(data.user);
              setIsLogged(true);
              setIsAdministrador(data.user.is_superuser);
              setIsBilbiotecari(data.user.is_staff);

              // Guardar en sessionStorage para compatibilidad
              sessionStorage.setItem("userData", JSON.stringify(data.user));
              sessionStorage.setItem("token", "session-auth"); // Un valor simbólico
            }
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setErrorProfile("Error al verificar la sesión");
      } finally {
        setLoading(false);
      }
    };

    // Verificar autenticación al cargar
    checkAuthentication();

    // Verificar si hay query params de autenticación
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logged_in") === "true") {
      // Acabamos de iniciar sesión correctamente
      setMostrarPerfil(true);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Si hay un token en los parámetros, guardarlo
      const token = urlParams.get("token");
      if (token) {
        sessionStorage.setItem("token", token);
        // Intentar obtener datos del usuario con este token
        fetch("http://localhost:8000/api/usuari/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((userData) => {
            setUsuari(userData);
            sessionStorage.setItem("userData", JSON.stringify(userData));
            setIsAdministrador(userData.is_superuser);
            setIsBilbiotecari(userData.is_staff);
          })
          .catch((err) => console.error("Error al obtener datos con el token:", err));
      }
    }
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
