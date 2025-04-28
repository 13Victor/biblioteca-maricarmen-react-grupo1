import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const LibrarianRoute = ({ children }) => {
  // Use the AuthContext directly instead of handling our own state
  const { isBilbiotecari, isLogged } = useContext(AuthContext);
  
  console.log("LibrarianRoute - isLogged:", isLogged, "isBilbiotecari:", isBilbiotecari);

  // A simple check if user is logged in and is a librarian
  // If not, redirect to the catalog page
  if (!isLogged || !isBilbiotecari) {
    return <Navigate to="/cataleg" replace />;
  }

  // If we get here, the user is logged in and is a librarian
  return children;
};

export default LibrarianRoute;
