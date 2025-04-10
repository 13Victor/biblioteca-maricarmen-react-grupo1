import "../styles/Footer.css";
import esteveGif from "../assets/esteve.gif";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div>
                    <div className="footer-data">
                        <p>Esteve Terradas i Illa - Codi: 08016781 - CIF: Q5855101A</p>
                        <span>c/ Bonavista, 70, 08940, Cornellà de Llobregat, Catalunya</span>
                        <span>Telèfon: 93 377 11 00</span>
                        <p>Web creada per Víctor Valero, Sergio Fernández i Mar Mèlich</p>
                    </div>
                         
                </div>
                <div className="gif-container">
                    <img src={esteveGif} alt="Footer gif" width="600" height="160" />
                </div>
            </div>
        </footer>
    );
}
