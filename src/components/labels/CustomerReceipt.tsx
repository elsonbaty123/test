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
  paidAmount?: number
  boxName?: string
  boxDuration?: string
}

export const CustomerReceipt: React.FC<CustomerReceiptProps> = ({
  catData,
  boxSummary,
  pricing,
  costs,
  orderNo: orderNoProp,
  paidAmount = 0,
  boxName = '',
  boxDuration = ''
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
  const paid = Number(paidAmount || 0)
  const remaining = Math.max(0, amountDue - paid)

  return (
    <div className="customer-receipt" dir="rtl" style={{
      width: '210mm',
      maxWidth: '210mm',
      height: '270mm',
      margin: '0 auto',
      background: 'white',
      fontFamily: 'Cairo, Segoe UI, Tahoma, Arial, sans-serif',
      color: '#2c3e50',
      lineHeight: '1.3',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        
        .customer-receipt {
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          break-inside: avoid !important;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            height: 100% !important;
            overflow: hidden !important;
          }
          
          .customer-receipt {
            width: 100% !important;
            max-width: none !important;
            height: 100% !important;
            max-height: 100vh !important;
            box-shadow: none !important;
            margin: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
          }
          
          .print-controls {
            display: none !important;
          }
          
          * {
            page-break-inside: avoid !important;
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
        padding: '20px 25px',
        borderBottom: '3px solid #3498db',
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
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #3498db',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <img src={branding.logoUrl} alt={branding.storeName} style={{
              width: '50px',
              height: '50px',
              objectFit: 'contain'
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
        padding: '10px 20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Client Information */}
        <div style={{
          background: '#f8f9fa',
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px',
            textAlign: 'center',
            borderBottom: '2px solid #3498db',
            paddingBottom: '6px'
          }}>بيانات العميل</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '600', marginBottom: '3px' }}>الاسم</div>
              <div style={{ fontSize: '13px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientName || 'غير محدد'}</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '600', marginBottom: '3px' }}>رقم الهاتف</div>
              <div style={{ fontSize: '13px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientPhone || 'غير محدد'}</div>
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            marginTop: '8px'
          }}>
            <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '600', marginBottom: '3px' }}>العنوان</div>
            <div style={{ fontSize: '13px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientAddress || 'غير محدد'}</div>
          </div>
        </div>

        {/* Order Type */}
        <div style={{
          background: '#e8f4fd',
          border: '2px solid #3498db',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px',
            textAlign: 'center',
            borderBottom: '2px solid #3498db',
            paddingBottom: '6px'
          }}>نوع الطلب</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #3498db',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#3498db', fontWeight: '600', marginBottom: '3px' }}>نوع البوكس</div>
              <div style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500' }}>{boxName || 'غير محدد'}</div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #3498db',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#3498db', fontWeight: '600', marginBottom: '3px' }}>مدة البوكس</div>
              <div style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500' }}>{boxDuration || (boxSummary?.totalDays || 0) + ' يوم'}</div>
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #3498db',
            marginTop: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#3498db', fontWeight: '600', marginBottom: '3px' }}>اسم القطة</div>
            <div style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500' }}>{catData.name || 'غير محدد'}</div>
          </div>
        </div>

        {/* Billing Summary */}
        <div style={{
          background: '#f8f9fa',
          border: '2px solid #dee2e6',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '10px',
            textAlign: 'center',
            borderBottom: '2px solid #495057',
            paddingBottom: '6px'
          }}>الحساب</div>
          
          <div style={{ background: 'white', borderRadius: '6px', padding: '10px', border: '1px solid #dee2e6' }}>
            {costs.dryCost > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
              }}>
                <span>دراي فود:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.dryCost, 0)} {currency}</span>
              </div>
            )}
            
            {costs.wetCost > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
              }}>
                <span>ويت فود:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.wetCost, 0)} {currency}</span>
              </div>
            )}
            
            {costs.treatCost > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
              }}>
                <span>تريت:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.treatCost, 0)} {currency}</span>
              </div>
            )}
            
            {costs.packagingCost > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
              }}>
                <span>تكاليف التغليف:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.packagingCost, 0)} {currency}</span>
              </div>
            )}
            
            {costs.additionalCosts > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
              }}>
                <span>تكاليف إضافية:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.additionalCosts, 0)} {currency}</span>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              borderBottom: '1px solid #dee2e6',
              fontSize: '13px',
              fontWeight: '700',
              color: '#495057',
              background: '#e9ecef',
              borderRadius: '4px',
              marginTop: '4px'
            }}>
              <span>المجموع الفرعي:</span>
              <span>{formatNumber(costs.subtotalCost || total, 0)} {currency}</span>
            </div>
            
            {costs.profitAmount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057',
                marginTop: '4px'
              }}>
                <span>الربح:</span>
                <span style={{ fontWeight: '600' }}>{formatNumber(costs.profitAmount, 0)} {currency}</span>
              </div>
            )}
            
            {discountValue > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#28a745'
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
                padding: '5px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#495057'
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
              fontSize: '15px',
              padding: '10px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
              color: 'white',
              borderRadius: '6px'
            }}>
              <span>المبلغ الإجمالي:</span>
              <span>{formatNumber(amountDue, 0)} {currency}</span>
            </div>
            
            {paid > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                fontSize: '13px',
                marginTop: '8px',
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                color: '#155724'
              }}>
                <span style={{ fontWeight: '600' }}>المبلغ المدفوع:</span>
                <span style={{ fontWeight: '700' }}>{formatNumber(paid, 0)} {currency}</span>
              </div>
            )}
            
            {remaining > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                color: '#721c24',
                borderRadius: '4px',
                marginTop: '6px'
              }}>
                <span>المبلغ المتبقي:</span>
                <span style={{ fontWeight: '700' }}>{formatNumber(remaining, 0)} {currency}</span>
              </div>
            )}
            
            {remaining === 0 && paid > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#155724',
                background: '#d4edda',
                border: '2px solid #c3e6cb',
                borderRadius: '4px',
                marginTop: '8px'
              }}>
                ✅ تم السداد بالكامل
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '8px',
          border: '2px solid #dee2e6',
          marginTop: 'auto'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '3px'
          }}>
            شكراً لاختياركم <span style={{ color: '#3498db' }}>{branding.storeName}</span>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#6c757d',
            marginBottom: '4px'
          }}>
            نتمنى لكم ولقطتكم الصحة والسعادة
          </div>
          <div style={{
            fontSize: '8px',
            color: '#95a5a6',
            borderTop: '1px solid #dee2e6',
            paddingTop: '4px'
          }}>
            تم إنشاء هذا الإيصال تلقائياً • جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
