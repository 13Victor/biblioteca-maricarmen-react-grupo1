import "../styles/Footer.css";
import esteveGif from "../assets/esteve.gif"; // Suponiendo que está en esta ubicación

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="gif-container">
                    <img src={esteveGif} alt="Footer gif" width="600" height="160" />
                </div>
            </div>
        </footer>
    );
}
