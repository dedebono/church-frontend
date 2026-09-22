import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle({
  variant = 'button',
  className = '',
  id = 'theme-toggle-btn',
  showLabel = true,
}) {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`theme-toggle-segmented ${className}`} id={id} role="group" aria-label="Pilih Tema">
        <button
          type="button"
          id={`${id}-dark`}
          className={`theme-segment-btn ${isDark ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          title="Aktifkan Tema Gelap"
        >
          <Moon size={14} className="theme-segment-icon" />
          <span>Gelap</span>
        </button>
        <button
          type="button"
          id={`${id}-light`}
          className={`theme-segment-btn ${!isDark ? 'active' : ''}`}
          onClick={() => setTheme('light')}
          aria-pressed={!isDark}
          title="Aktifkan Tema Terang"
        >
          <Sun size={14} className="theme-segment-icon" />
          <span>Terang</span>
        </button>
      </div>
    );
  }

  if (variant === 'compact' || variant === 'icon') {
    return (
      <button
        type="button"
        id={id}
        className={`theme-toggle-icon-btn ${className}`}
        onClick={toggleTheme}
        title={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
        aria-label={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
      >
        <div className={`theme-icon-wrapper ${isDark ? 'is-dark' : 'is-light'}`}>
          {isDark ? <Sun size={18} className="theme-sun-icon" /> : <Moon size={18} className="theme-moon-icon" />}
        </div>
      </button>
    );
  }

  // Default: variant === 'button' / 'pill'
  return (
    <button
      type="button"
      id={id}
      className={`theme-toggle-pill-btn ${isDark ? 'mode-dark' : 'mode-light'} ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
      aria-label={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
    >
      <div className="theme-pill-icon-box">
        {isDark ? <Moon size={15} /> : <Sun size={15} />}
      </div>
      {showLabel && (
        <span className="theme-pill-label">
          {isDark ? 'Tema Gelap' : 'Tema Terang'}
        </span>
      )}
      <div className="theme-pill-switch" aria-hidden="true">
        <div className={`theme-pill-switch-knob ${isDark ? 'knob-dark' : 'knob-light'}`} />
      </div>
    </button>
  );
}
