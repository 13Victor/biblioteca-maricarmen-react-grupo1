import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/PerfilUsuari.css";

export default function PerfilUsuari() {
  const { usuari, errorProfile, handleLogOut } = useContext(AuthContext);

  if (errorProfile) return <div>{errorProfile}</div>;
  if (!usuari) return <></>;

  return (
    <div id="perfilUsuari-container">
      <h2>{usuari.username}</h2>
      <div>Nom: {usuari.first_name}</div>
      <div>Cognoms: {usuari.last_name}</div>
      <div>Email: {usuari.email}</div>
      <div>Centre: {usuari.centre}</div>
      <div>Cicle: {usuari.cicle}</div>
      <div>Imatge: {usuari.imatge}</div>
      <div>
        Rol:{" "}
        {usuari.is_staff && usuari.is_superuser
          ? "Administrador"
          : usuari.is_staff
          ? "Bibliotecari"
          : "Usuari"}
      </div>
      <br />
      <button onClick={handleLogOut}>Tancar Sessió</button>
    </div>
  );
}
