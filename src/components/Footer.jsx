import React from 'react'
import logoImg from '../assets/Logo.png'

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src={logoImg} alt="Confidra logo" style={{width:40,height:40}} />
            <h3>Confidra</h3>
          </div>
          <p>Integrated telehealth for metabolic, sexual, and hormonal wellness.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>[TO CONFIRM]</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Confidra Healthcare. All rights reserved.</div>
    </footer>
  )
}
