import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="gif-container">
          {/* Aquí puedes colocar tu gif */}
          <img 
            src="../../public/esteve.gif" 
            alt="Footer gif" 
            width="600" 
            height="160"
          />
        </div>
      </div>
    </footer>
  );
}