'use client'

import React from 'react'
import { formatNumber } from '@/lib/utils'
import branding from '@/config/branding'

interface CustomerReceiptProps {
  catData: any
  boxSummary: any
  pricing: any
  costs: any
  orderNo?: string
}

export const CustomerReceipt: React.FC<CustomerReceiptProps> = ({
  catData,
  boxSummary,
  pricing,
  costs,
  orderNo: orderNoProp
}) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Build order number if not provided
  const buildOrderNo = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
    return `${branding.orderPrefix}-${y}${m}${day}-${hh}${mm}-${rand}`
  }
  const orderNo = (orderNoProp && String(orderNoProp).trim()) ? String(orderNoProp).trim() : buildOrderNo()

  // Pricing helpers
  const currency = pricing?.currency || 'جنيه'
  const total = Number(costs?.totalCostWithProfit || 0)
  const afterDiscount = Number(costs?.totalCostAfterDiscount || 0)
  const delivery = Number(costs?.deliveryCost || 0)
  const amountDue = Number(costs?.totalCostWithDelivery || (afterDiscount + delivery))
  const discountValue = Math.max(0, total - afterDiscount)

  return (
    <div className="customer-receipt" dir="rtl" style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      background: 'white',
      fontFamily: 'Cairo, Segoe UI, Tahoma, Arial, sans-serif',
      color: '#2c3e50',
      lineHeight: '1.6',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '15px',
      overflow: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4;
          margin: 15mm;
        }
        
        @media print {
          .customer-receipt {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}} />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 15px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <img src={branding.logoUrl} alt={branding.storeName} style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)'
          }} />
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '5px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>{branding.storeName}</div>
        <div style={{
          fontSize: '14px',
          opacity: '0.9'
        }}>إيصال استلام</div>
        <div style={{
          marginTop: '15px',
          fontSize: '12px',
          opacity: '0.8'
        }}>
          رقم الإيصال: {orderNo} • {formatDate()}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '25px' }}>
        {/* Client Information */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '15px',
            textAlign: 'center',
            borderBottom: '2px solid #667eea',
            paddingBottom: '10px'
          }}>بيانات العميل</div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #dee2e6'
          }}>
            <span style={{ fontWeight: '600', color: '#6c757d' }}>الاسم:</span>
            <span style={{ fontWeight: '500', color: '#2c3e50' }}>{catData.clientName || 'غير محدد'}</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #dee2e6'
          }}>
            <span style={{ fontWeight: '600', color: '#6c757d' }}>رقم الهاتف:</span>
            <span style={{ fontWeight: '500', color: '#2c3e50' }}>{catData.clientPhone || 'غير محدد'}</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <span style={{ fontWeight: '600', color: '#6c757d' }}>اسم القطة:</span>
            <span style={{ fontWeight: '500', color: '#2c3e50' }}>{catData.name || 'غير محدد'}</span>
          </div>
        </div>

        {/* Service Summary */}
        <div style={{
          background: '#fff3cd',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#856404',
            marginBottom: '15px',
            textAlign: 'center',
            borderBottom: '2px solid #f0ad4e',
            paddingBottom: '10px'
          }}>تفاصيل الخدمة</div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0ad4e'
          }}>
            <span style={{ fontWeight: '600', color: '#856404' }}>خطة تغذية القطة:</span>
            <span style={{ fontWeight: '500', color: '#856404' }}>{boxSummary?.totalDays || 0} يوم</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <span style={{ fontWeight: '600', color: '#856404' }}>عدد المنتجات:</span>
            <span style={{ fontWeight: '500', color: '#856404' }}>{boxSummary?.items?.length || 0} منتج</span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '15px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>ملخص التكلفة</div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            fontSize: '14px'
          }}>
            <span>الإجمالي الفرعي:</span>
            <span>{formatNumber(total, 0)} {currency}</span>
          </div>
          
          {discountValue > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px'
            }}>
              <span>الخصم:</span>
              <span>-{formatNumber(discountValue, 0)} {currency}</span>
            </div>
          )}
          
          {delivery > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px'
            }}>
              <span>رسوم التوصيل:</span>
              <span>{formatNumber(delivery, 0)} {currency}</span>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '700',
            fontSize: '18px',
            paddingTop: '15px',
            marginTop: '10px',
            borderTop: '2px solid rgba(255,255,255,0.3)'
          }}>
            <span>المبلغ الإجمالي:</span>
            <span>{formatNumber(amountDue, 0)} {currency}</span>
          </div>
        </div>

        {/* Thank You Message */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            شكراً لاختياركم <span style={{ color: '#667eea' }}>{branding.storeName}</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6c757d'
          }}>
            نظام تغذية علمي متخصص للقطط
          </div>
        </div>
      </div>
    </div>
  )
}
