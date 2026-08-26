import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/og-image.png'

export default function SiteHeader(){
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <img src={logoImg} alt="Confidra logo" className="brand-logo" />
          <span className="brand-title">Confidra</span>
        </Link>
        <nav className="header-nav">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
  )
}
