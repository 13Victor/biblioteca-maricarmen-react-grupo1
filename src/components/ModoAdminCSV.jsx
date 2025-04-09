import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ImportCSV from "./ImportCSV";

export default function ModoAdminCSV() {

//hacer que si el user es bibliotecari o administrador se muestre el componente
    const { isBilbiotecari, isAdministrador } = useContext(AuthContext);

    if (!isBilbiotecari && !isAdministrador) {
        return null;
    }
    return(
        <div className="ImportCSV">
          <ImportCSV />
        </div>
    )
}