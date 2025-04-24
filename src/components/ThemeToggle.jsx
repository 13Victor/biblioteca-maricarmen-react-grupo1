import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, setIsDark } = useContext(ThemeContext);

    return (
        <button 
            onClick={() => setIsDark(!isDark)}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
            }}
            aria-label="Toggle theme"
        >
            {isDark ? '🔆' : '🌙'}
        </button>
    );
}