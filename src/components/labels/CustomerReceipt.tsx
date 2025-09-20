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
      width: '210mm',
      maxWidth: '210mm',
      height: '297mm',
      margin: '0 auto',
      background: 'white',
      fontFamily: 'Cairo, Segoe UI, Tahoma, Arial, sans-serif',
      color: '#2c3e50',
      lineHeight: '1.4',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        
        .customer-receipt {
          page-break-after: always;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .customer-receipt {
            width: 100% !important;
            max-width: none !important;
            height: 100vh !important;
            box-shadow: none !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          
          .print-controls {
            display: none !important;
          }
        }
        
        @media screen {
          .customer-receipt {
            margin: 20px auto !important;
            max-width: 800px !important;
            width: 100% !important;
            height: auto !important;
            min-height: 1000px !important;
          }
        }
      `}} />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '25px 30px',
        borderBottom: '4px solid #3498db',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              marginBottom: '6px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>{branding.storeName}</div>
            <div style={{
              fontSize: '14px',
              opacity: '0.9',
              marginBottom: '4px'
            }}>نظام تغذية علمي متخصص للقطط</div>
            <div style={{
              fontSize: '12px',
              opacity: '0.8'
            }}>العنوان: شارع الجامعة، المعادي، القاهرة | تليفون: 01234567890</div>
          </div>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            <img src={branding.logoUrl} alt={branding.storeName} style={{
              width: '50px',
              height: '50px',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)'
            }} />
          </div>
        </div>
      </div>

      {/* Receipt Info Bar */}
      <div style={{
        background: '#3498db',
        color: 'white',
        padding: '12px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700' }}>إيصال استلام</div>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>رقم الإيصال: {orderNo}</div>
        <div style={{ fontSize: '12px' }}>{formatDate()}</div>
      </div>

      {/* Body */}
      <div style={{ 
        padding: '25px 30px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Client Information */}
        <div style={{
          background: '#f8f9fa',
          border: '2px solid #e9ecef',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '15px',
            textAlign: 'center',
            borderBottom: '2px solid #3498db',
            paddingBottom: '10px'
          }}>بيانات العميل</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: '600', marginBottom: '4px' }}>الاسم</div>
              <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientName || 'غير محدد'}</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: '600', marginBottom: '4px' }}>رقم الهاتف</div>
              <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientPhone || 'غير محدد'}</div>
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            marginTop: '15px'
          }}>
            <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: '600', marginBottom: '4px' }}>العنوان</div>
            <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientAddress || 'غير محدد'}</div>
          </div>
        </div>

        {/* Order Type */}
        <div style={{
          background: '#e8f4fd',
          border: '2px solid #3498db',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '15px',
            textAlign: 'center',
            borderBottom: '2px solid #3498db',
            paddingBottom: '10px'
          }}>نوع الطلب</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #3498db',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '4px' }}>نوع الخدمة</div>
              <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>خطة تغذية القطة</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #3498db',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '4px' }}>مدة الخطة</div>
              <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{boxSummary?.totalDays || 0} يوم</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #3498db',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '4px' }}>عدد المنتجات</div>
              <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{boxSummary?.items?.length || 0} منتج</div>
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #3498db',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '4px' }}>اسم القطة</div>
            <div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.name || 'غير محدد'}</div>
          </div>
        </div>

        {/* Billing Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          color: 'white',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '15px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>الحساب</div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              fontSize: '14px'
            }}>
              <span>الإجمالي الفرعي:</span>
              <span style={{ fontWeight: '600' }}>{formatNumber(total, 0)} {currency}</span>
            </div>
            
            {discountValue > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                fontSize: '14px'
              }}>
                <span>الخصم:</span>
                <span style={{ fontWeight: '600' }}>-{formatNumber(discountValue, 0)} {currency}</span>
              </div>
            )}
            
            {delivery > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                fontSize: '14px'
              }}>
                <span>رسوم التوصيل:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(delivery, 0)} {currency}</span>
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
              borderTop: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '4px'
            }}>
              <span>المبلغ الإجمالي:</span>
              <span>{formatNumber(amountDue, 0)} {currency}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '10px',
          border: '2px solid #dee2e6',
          marginTop: 'auto'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '6px'
          }}>
            شكراً لاختياركم <span style={{ color: '#3498db' }}>{branding.storeName}</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            marginBottom: '8px'
          }}>
            نتمنى لكم ولقطتكم الصحة والسعادة
          </div>
          <div style={{
            fontSize: '10px',
            color: '#95a5a6',
            borderTop: '1px solid #dee2e6',
            paddingTop: '8px'
          }}>
            تم إنشاء هذا الإيصال تلقائياً • جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
