"use client"

import React from 'react'
import branding from '@/config/branding'
import { formatNumber } from '@/lib/utils'

interface StyledInvoiceProps {
  catData: any
  foodData: any
  results: any
  boxSummary: any
  pricing: any
  costs: any
  orderNo?: string
}

export const StyledInvoice: React.FC<StyledInvoiceProps> = ({
  catData,
  foodData,
  results,
  boxSummary,
  pricing,
  costs,
  orderNo,
}) => {
  if (!results || !boxSummary) return null

  const formatDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="box-label invoice" dir="rtl">
      <style jsx>{`
        @media print {
          .invoice {
            width: 90mm; /* default; can be overridden by thermal toggle */
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            position: relative;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
            font-family: 'Arial', sans-serif;
          }
          .header {
            background: #e8f3fb;
            padding: 6mm 6mm 5mm;
            border-bottom: 2px solid #c8e1f4;
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6mm;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 4mm;
          }
          .logo {
            width: 16mm; height: 16mm; object-fit: contain; border-radius: 6px; background: #fff; border: 1px solid #e5e7eb;
          }
          .brand-text {
            display: flex; flex-direction: column; gap: 1mm;
          }
          .brand-name { font-weight: 800; color: #0b6ea9; font-size: 12px; }
          .brand-sub { font-size: 8px; color: #629fc6; }
          .title {
            text-align: left;
          }
          .title .main { font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #1f6aa5; }
          .title .sub { font-size: 8px; color: #629fc6; }

          .meta {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; padding: 5mm 6mm; background: #ffffff;
          }
          .meta .block { font-size: 9px; color: #0f172a; }
          .meta .block .label { color: #6b7280; font-size: 8px; }
          .meta .block .value { font-weight: 600; }

          .table { margin: 0 6mm; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
          .thead { display: grid; grid-template-columns: 2fr 1fr 1fr; background: #eff6ff; color: #1e3a8a; font-weight: 700; font-size: 9px; }
          .thead > div { padding: 3mm 3mm; border-left: 1px solid #e5e7eb; }
          .thead > div:first-child { border-left: none; }
          .tbody .tr { display: grid; grid-template-columns: 2fr 1fr 1fr; font-size: 9px; }
          .tbody .tr:nth-child(even) { background: #fafafa; }
          .tbody .td { padding: 3mm; border-top: 1px solid #eef2f7; }
          .amount { text-align: left; font-weight: 700; color: #065f89; }

          .summary { margin: 5mm 6mm; display: grid; gap: 2mm; }
          .sum-row { display: flex; justify-content: space-between; font-size: 10px; }
          .sum-row.total { font-weight: 900; color: #0ea5e9; font-size: 12px; }
          .sum-row .chip { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1mm 2mm; }

          .thanks { text-align: center; color: #2563eb; font-weight: 800; margin: 4mm 0 6mm; font-size: 11px; }
          .cat { position: absolute; bottom: 6mm; left: 6mm; opacity: 0.08; }
          .cat svg { width: 32mm; height: auto; }
        }

        @media screen {
          .invoice {
            width: 420px;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            position: relative;
            box-shadow: 0 10px 30px rgba(2,6,23,0.06);
            margin: 10px auto;
            font-family: 'Arial', sans-serif;
          }
          .header { background: #e8f3fb; padding: 20px 20px 14px; border-bottom: 2px solid #c8e1f4; }
          .header-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .logo { width: 56px; height: 56px; object-fit: contain; border-radius: 10px; background: #fff; border: 1px solid #e5e7eb; }
          .brand-text { display: flex; flex-direction: column; gap: 3px; }
          .brand-name { font-weight: 900; color: #0b6ea9; font-size: 18px; }
          .brand-sub { font-size: 12px; color: #629fc6; }
          .title { text-align: left; }
          .title .main { font-size: 28px; font-weight: 900; letter-spacing: 1px; color: #1f6aa5; }
          .title .sub { font-size: 12px; color: #629fc6; }

          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 20px; background: #ffffff; }
          .meta .block { font-size: 13px; color: #0f172a; }
          .meta .block .label { color: #6b7280; font-size: 12px; }
          .meta .block .value { font-weight: 700; }

          .table { margin: 0 20px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
          .thead { display: grid; grid-template-columns: 2fr 1fr 1fr; background: #eff6ff; color: #1e3a8a; font-weight: 800; font-size: 12px; }
          .thead > div { padding: 10px; border-left: 1px solid #e5e7eb; }
          .thead > div:first-child { border-left: none; }
          .tbody .tr { display: grid; grid-template-columns: 2fr 1fr 1fr; font-size: 12px; }
          .tbody .tr:nth-child(even) { background: #fafafa; }
          .tbody .td { padding: 10px; border-top: 1px solid #eef2f7; }
          .amount { text-align: left; font-weight: 800; color: #065f89; }

          .summary { margin: 16px 20px; display: grid; gap: 6px; }
          .sum-row { display: flex; justify-content: space-between; font-size: 14px; }
          .sum-row.total { font-weight: 900; color: #0ea5e9; font-size: 18px; }
          .sum-row .chip { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px 10px; }

          .thanks { text-align: center; color: #2563eb; font-weight: 900; margin: 12px 0 18px; font-size: 16px; }
          .cat { position: absolute; bottom: 18px; left: 18px; opacity: 0.08; }
          .cat svg { width: 140px; height: auto; }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="brand">
            <img src={branding.logoUrl} className="logo" alt="brand" />
            <div className="brand-text">
              <div className="brand-name">{branding.storeName}</div>
              <div className="brand-sub">{branding.storeAddress}</div>
            </div>
          </div>
          <div className="title">
            <div className="main">INVOICE</div>
            <div className="sub">PET GROOMING & SHOP</div>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="meta">
        <div className="block">
          <div className="label">تاريخ الفاتورة</div>
          <div className="value">{formatDate()}</div>
          <div className="label" style={{marginTop: '2mm'}}>رقم الطلب</div>
          <div className="value">{orderNo}</div>
        </div>
        <div className="block">
          <div className="label">فاتورة إلى</div>
          <div className="value">{catData?.clientName || 'غير محدد'}</div>
          {catData?.clientPhone ? <div className="value">{catData.clientPhone}</div> : null}
          {catData?.clientAddress ? <div className="value">{catData.clientAddress}</div> : null}
        </div>
      </div>

      {/* Items (simplified) */}
      <div className="table">
        <div className="thead">
          <div>الوصف</div>
          <div>السعر</div>
          <div>الإجمالي</div>
        </div>
        <div className="tbody">
          <div className="tr">
            <div className="td">المبلغ الكلي بعد الخصم</div>
            <div className="td">{formatNumber(costs?.totalCostAfterDiscount || 0, 0)} {pricing?.currency}</div>
            <div className="td amount">{formatNumber(costs?.totalCostAfterDiscount || 0, 0)} {pricing?.currency}</div>
          </div>
          <div className="tr">
            <div className="td">الدلفري</div>
            <div className="td">{formatNumber(costs?.deliveryCost || 0, 0)} {pricing?.currency}</div>
            <div className="td amount">{formatNumber(costs?.deliveryCost || 0, 0)} {pricing?.currency}</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="summary">
        <div className="sum-row total">
          <div>المبلغ النهائي</div>
          <div className="chip">{formatNumber(costs?.totalCostWithDelivery || 0, 0)} {pricing?.currency}</div>
        </div>
      </div>

      <div className="thanks">Thank You For Your Purchase</div>

      {/* Cat silhouette */}
      <div className="cat" aria-hidden>
        <svg viewBox="0 0 64 64" fill="#0ea5e9" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 2c3 6 10 8 16 8 3 0 6-1 8-2-2 3-3 6-3 9 0 4 1 7 3 10-2-1-5-2-8-2-8 0-14 6-14 14v3h-3c-8 0-14 6-14 14H8c0-11 9-20 20-20h3v-3c0-9 6-16 14-18-3 0-6-1-9-2-4-2-7-5-8-9z"/>
        </svg>
      </div>
    </div>
  )
}
