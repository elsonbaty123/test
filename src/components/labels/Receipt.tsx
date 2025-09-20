'use client'

import React from 'react'
import { formatNumber } from '@/lib/utils'
import branding from '@/config/branding'

interface ReceiptProps {
  catData: any
  foodData: any
  results: any
  boxSummary: any
  pricing: any
  costs: any
  orderNo?: string
}

export const Receipt: React.FC<ReceiptProps> = ({
  catData,
  foodData,
  results,
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

  // Helper to get health condition text
  const getHealthCondition = () => {
    if (catData.healthCondition === 'healthy') return 'سليمة'
    if (catData.healthCondition === 'overweight') return 'زيادة وزن'
    if (catData.healthCondition === 'underweight') return 'نقص وزن'
    if (catData.healthCondition === 'senior') return 'كبيرة السن'
    if (catData.healthCondition === 'kitten') return 'صغيرة'
    return catData.healthCondition || 'غير محدد'
  }

  if (!results || !boxSummary) return null

  return (
    <div className="receipt" dir="rtl" style={{
      width: '210mm',
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      background: 'white',
      fontFamily: 'Cairo, Segoe UI, Tahoma, Arial, sans-serif',
      color: '#2c3e50',
      lineHeight: '1.6',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4;
          margin: 15mm;
        }

        /* Elegant Header with Gradient */
        .receipt-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .receipt-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .receipt-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.3);
        }

        .receipt-logo img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .receipt-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 2px;
        }

        .receipt-subtitle {
          font-size: 16px;
          opacity: 0.9;
          font-weight: 300;
        }

        .receipt-meta-header {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.9;
        }

        /* Main Content Area */
        .receipt-body {
          padding: 40px;
          background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
        }

        /* Two Column Layout */
        .info-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .info-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }

        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-icon {
          width: 24px;
          height: 24px;
          fill: #667eea;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 14px;
          color: #6c757d;
          font-weight: 600;
        }

        .info-value {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
        }

        /* Box Details Table */
        .box-section {
          background: white;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .box-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 20px;
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 2px solid #667eea;
        }

        .box-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .box-table th {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 15px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
        }

        .box-table th:first-child {
          border-radius: 10px 0 0 0;
        }

        .box-table th:last-child {
          border-radius: 0 10px 0 0;
        }

        .box-table td {
          padding: 12px 15px;
          text-align: center;
          border-bottom: 1px solid #f1f3f4;
          font-size: 13px;
        }

        .box-table tr:nth-child(even) {
          background: #f8f9fa;
        }

        .box-table tr:hover {
          background: #e3f2fd;
          transition: background 0.3s ease;
        }

        /* Pricing Summary */
        .pricing-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .pricing-title {
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          font-size: 16px;
        }

        .summary-row:last-child {
          border-bottom: none;
          font-weight: 700;
          font-size: 20px;
          padding-top: 20px;
          margin-top: 15px;
          border-top: 2px solid rgba(255,255,255,0.3);
        }

        /* Notes Section */
        .notes-card {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          border: 1px solid #f0ad4e;
        }

        .notes-title {
          font-size: 18px;
          font-weight: 700;
          color: #8a6d3b;
          margin-bottom: 15px;
          text-align: center;
        }

        .notes-content {
          font-size: 14px;
          color: #8a6d3b;
          line-height: 1.7;
          text-align: justify;
        }

        /* Footer */
        .receipt-footer {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          text-align: center;
          padding: 30px;
          position: relative;
          overflow: hidden;
        }

        .footer-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>');
        }

        .footer-content {
          position: relative;
          z-index: 2;
        }

        .thank-you-message {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .project-name {
          color: #f39c12;
          font-weight: 800;
        }

        .footer-subtitle {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 10px;
        }

        .footer-meta {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.2);
          font-size: 12px;
          opacity: 0.7;
        }

        /* Print Styles */
        @media print {
          .receipt {
            width: 100%;
            max-width: none;
            min-height: auto;
            box-shadow: none;
            font-size: 11px;
          }
          
          .receipt-header {
            padding: 20px;
          }
          
          .receipt-title {
            font-size: 24px;
          }
          
          .receipt-body {
            padding: 25px;
          }
          
          .info-card, .box-section, .pricing-card, .notes-card {
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .receipt-footer {
            padding: 20px;
          }
          
          .thank-you-message {
            font-size: 18px;
          }
        }

        /* Screen Styles */
        @media screen {
          .receipt {
            margin: 20px auto !important;
            max-width: 800px !important;
          }
        }
      `}} />

      {/* Header with Logo and Meta */}
      <div className="receipt-header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="header-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="receipt-logo" style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <img src={branding.logoUrl} alt={branding.storeName} style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)'
            }} />
          </div>
          <div className="receipt-title" style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '2px'
          }}>{branding.storeName}</div>
          <div className="receipt-subtitle" style={{
            fontSize: '16px',
            opacity: '0.9',
            fontWeight: '300'
          }}>إيصال خدمة تغذية القطط</div>
          <div className="receipt-meta-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            fontSize: '14px',
            opacity: '0.9'
          }}>
            <div>رقم الإيصال: {orderNo}</div>
            <div>تاريخ الإصدار: {formatDate()}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="receipt-body" style={{
        padding: '40px',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
      }}>
        {/* Client and Cat Information in Two Columns */}
        <div className="info-columns" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Client Information */}
          <div className="info-card" style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '4px solid #667eea'
          }}>
            <div className="card-title" style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg style={{ width: '24px', height: '24px', fill: '#667eea' }} viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              بيانات العميل
            </div>
            <div className="info-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>الاسم:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientName || 'غير محدد'}</span>
            </div>
            <div className="info-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>رقم الهاتف:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.clientPhone || 'غير محدد'}</span>
            </div>
          </div>

          {/* Cat Information */}
          <div className="info-card" style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '4px solid #667eea'
          }}>
            <div className="card-title" style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg style={{ width: '24px', height: '24px', fill: '#667eea' }} viewBox="0 0 24 24">
                <path d="M4.5 12.5C7 12.5 9 10.5 9 8s-2-4.5-4.5-4.5S0 5.5 0 8s2 4.5 4.5 4.5zM19.5 12.5C22 12.5 24 10.5 24 8s-2-4.5-4.5-4.5S15 5.5 15 8s2 4.5 4.5 4.5zM12 14c-3.5 0-6.5 2-8 5h16c-1.5-3-4.5-5-8-5z"/>
              </svg>
              بيانات القطة
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>الاسم:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.name || 'غير محدد'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>العمر:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.age ? `${catData.age} سنة` : 'غير محدد'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>الوزن:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{catData.weight ? `${catData.weight} كجم` : 'غير محدد'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600' }}>الحالة الصحية:</span>
              <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>{getHealthCondition()}</span>
            </div>
          </div>
        </div>

        {/* Box Details */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            textAlign: 'center',
            paddingBottom: '15px',
            borderBottom: '2px solid #667eea'
          }}>تفاصيل البوكس - {boxSummary?.totalDays || 0} يوم</div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>المنتج</th>
                <th style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>الكمية (جرام)</th>
                <th style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>عدد الأيام</th>
                <th style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>السعر ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {boxSummary?.items?.map((item: any, index: number) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #f1f3f4', fontSize: '13px' }}>{item.name}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #f1f3f4', fontSize: '13px' }}>{formatNumber(item.totalQuantity || 0, 0)}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #f1f3f4', fontSize: '13px' }}>{item.daysCount || 0}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #f1f3f4', fontSize: '13px' }}>{formatNumber(item.totalCost || 0, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>ملخص التكلفة</div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            fontSize: '16px'
          }}>
            <span>الإجمالي الفرعي:</span>
            <span>{formatNumber(total, 0)} {currency}</span>
          </div>
          
          {discountValue > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              fontSize: '16px'
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
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              fontSize: '16px'
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
            fontSize: '20px',
            paddingTop: '20px',
            marginTop: '15px',
            borderTop: '2px solid rgba(255,255,255,0.3)'
          }}>
            <span>المبلغ الإجمالي:</span>
            <span>{formatNumber(amountDue, 0)} {currency}</span>
          </div>
        </div>

        {/* Notes and Recommendations */}
        <div style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid #f0ad4e'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#8a6d3b',
            marginBottom: '15px',
            textAlign: 'center'
          }}>ملاحظات وتوصيات خاصة</div>
          <div style={{
            fontSize: '14px',
            color: '#8a6d3b',
            lineHeight: '1.7',
            textAlign: 'justify'
          }}>
            • يُنصح بتقديم الطعام في أوقات منتظمة يومياً<br/>
            • تأكد من توفر الماء العذب والنظيف دائماً<br/>
            • راقب وزن القطة وسلوكها بانتظام<br/>
            • في حالة أي تغيير في الشهية أو السلوك، استشر الطبيب البيطري فوراً
            {catData.healthCondition === 'overweight' && (
              <><br/>• نظراً لزيادة الوزن، يُنصح بزيادة النشاط البدني وتقليل الوجبات الخفيفة</>
            )}
            {catData.healthCondition === 'senior' && (
              <><br/>• للقطط كبيرة السن، يُنصح بفحوصات دورية أكثر تكراراً مع الطبيب البيطري</>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            شكراً لاختياركم <span style={{ color: '#f39c12', fontWeight: '800' }}>{branding.storeName}</span>
          </div>
          <div style={{
            fontSize: '14px',
            opacity: '0.8',
            marginTop: '10px'
          }}>
            نظام تغذية علمي متخصص للقطط
          </div>
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            fontSize: '12px',
            opacity: '0.7'
          }}>
            تم إنشاء هذا الإيصال تلقائياً • جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  )
}
