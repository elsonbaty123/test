'use client'

import React from 'react'

interface QRCodeProps {
  data: string
  size?: number
  className?: string
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  data, 
  size = 100, 
  className = '' 
}) => {
  // Simple QR code generator using Google Charts API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&margin=10`

  return (
    <img 
      src={qrCodeUrl} 
      alt="QR Code" 
      className={`qr-code ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Fallback if QR service is unavailable
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        
        // Create a simple text fallback
        const fallback = document.createElement('div')
        fallback.textContent = 'QR Code'
        fallback.style.width = `${size}px`
        fallback.style.height = `${size}px`
        fallback.style.border = '1px solid #ccc'
        fallback.style.display = 'flex'
        fallback.style.alignItems = 'center'
        fallback.style.justifyContent = 'center'
        fallback.style.fontSize = '12px'
        fallback.style.color = '#666'
        
        target.parentNode?.insertBefore(fallback, target)
      }}
    />
  )
}