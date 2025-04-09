import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Login.css";

export default function Login() {
    const { setIsLogged, setMostrarLogin, setMostrarPerfil } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [doFetch, setDoFetch] = useState(false);

    useEffect(() => {
        if (!doFetch) return;

        setIsLoading(true);
        setError(null);

        fetch("http://localhost:8000/api/token/", {
            method: "GET",
            headers: {
                "Authorization": `Basic ${btoa(username + ":" + password)}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Usuario o contraseña incorrectos");
                return response.json();
            })
            .then((data) => {
                sessionStorage.setItem("token", data.token);
                setIsLogged(true);
                setMostrarLogin(false); 
                setMostrarPerfil(true); 
            })
            .catch((err) => setError(err.message))
            .finally(() => {
                setIsLoading(false);
                setDoFetch(false);
            });
    }, [doFetch, setIsLogged, setMostrarLogin, setMostrarPerfil]);

    return (
        <div id="login-container">
            <h3>Login</h3>
            <form onSubmit={(e) => { e.preventDefault(); setDoFetch(true); }}>
                {error && <p style={{ color: "red", padding: "5px" }}>{error}</p>}
                <div>
                    <label>Usuario:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Iniciar Sesión"}
                </button>
            </form>
        </div>
    );
}
