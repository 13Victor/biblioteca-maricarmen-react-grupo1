import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";
import SocialLoginButton from "./SocialLoginButton";
import { GoogleIcon, MicrosoftIcon } from "./Icons";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Login() {
    const { setIsLogged, setMostrarLogin, setMostrarPerfil } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [doFetch, setDoFetch] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Comprobar si hay un error en los parámetros de URL
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            if (errorParam === 'auth_failed') {
                setError('La autenticación ha fallado. Por favor, inténtalo de nuevo.');
            } else if (errorParam === 'invalid_state') {
                setError('Error de seguridad. Por favor, inténtalo de nuevo.');
            } else if (errorParam === 'token_error') {
                setError('Error al obtener el token. Por favor, inténtalo de nuevo.');
            } else if (errorParam === 'no_email') {
                setError('No se pudo obtener tu correo electrónico. Asegúrate de permitir el acceso a tu email.');
            } else if (errorParam === 'server_error') {
                setError('Error en el servidor. Por favor, inténtalo más tarde.');
            }
        }
    }, [searchParams]);

    // Comprobar si hay un token en la URL (callback de autenticación social)
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Hacer una solicitud al backend para verificar el token
            fetch(`http://localhost:8000/api/token/?social_token=${token}`)
                .then(response => {
                    if (!response.ok) throw new Error("Token inválido");
                    return response.json();
                })
                .then(data => {
                    if (data.token) {
                        sessionStorage.setItem("token", data.token);
                        sessionStorage.setItem("userData", JSON.stringify(data.user));
                        setIsLogged(true);
                        setMostrarLogin(false);
                        setMostrarPerfil(true);
                        navigate('/'); // Redirigir a la página principal
                    }
                })
                .catch(err => {
                    setError("Error de autenticación: " + err.message);
                });
        }
    }, [searchParams, setIsLogged, setMostrarLogin, setMostrarPerfil, navigate]);

    // Login tradicional con usuario y contraseña
    useEffect(() => {
        if (!doFetch) return;

    setIsLoading(true);
    setError(null);
    // Usar la URL completa de la API
    fetch(`${API_BASE_URL}/api/token/`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(username + ":" + password)}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Usuari o contrassenya incorrectes");
        return response.json();
      })
      .then((data) => {
        sessionStorage.setItem("token", data.token);
        setIsLogged(true);
        setMostrarLogin(false);
        // setMostrarPerfil(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setIsLoading(false);
        setDoFetch(false);
      });
  }, [doFetch, setIsLogged, setMostrarLogin, setMostrarPerfil]);

    return (
        <div id="login-container">
            <h1>Login</h1>
            {error && <p style={{ color: "red", padding: "5px" }}>{error}</p>}
            
            {/* Botones de inicio de sesión social */}
            <div className="social-login-section">
                <SocialLoginButton 
                    provider="google" 
                    text="Continuar con Google" 
                    icon={<GoogleIcon />} 
                />
                <SocialLoginButton 
                    provider="microsoft" 
                    text="Continuar con Microsoft" 
                    icon={<MicrosoftIcon />} 
                />
                
                <div className="divider">
                    <span>O</span>
                </div>
            </div>
            
            {/* Formulario de inicio de sesión tradicional */}
            <form onSubmit={(e) => { e.preventDefault(); setDoFetch(true); }}>
                <div>
                    <label>Usuari:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Contrasenya:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Carregant..." : "Iniciar Sessió"}
                </button>
            </form>
        </div>
    );
}