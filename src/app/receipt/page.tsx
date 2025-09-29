'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { CustomerReceipt } from '@/components/labels/CustomerReceipt'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Download, Save, Edit2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

function ReceiptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receiptData, setReceiptData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editableData, setEditableData] = useState<any>({})
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    // Get receipt data from URL params or localStorage
    const orderNo = searchParams.get('orderNo')
    
    if (orderNo) {
      // Try to get data from localStorage first
      const savedData = localStorage.getItem(`receipt_${orderNo}`)
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setReceiptData(data)
          // Load saved paid amount if exists
          setPaidAmount(data.paidAmount || 0)
        } catch (error) {
          console.error('Error parsing receipt data:', error)
        }
      }
    }
    
    setLoading(false)
  }, [searchParams])

  const handlePrint = () => {
    window.print()
  }

  const handlePaidAmountChange = (value: number) => {
    setPaidAmount(value)
    // Save to localStorage
    if (receiptData) {
      const updatedData = { ...receiptData, paidAmount: value }
      localStorage.setItem(`receipt_${receiptData.orderNo}`, JSON.stringify(updatedData))
      setReceiptData(updatedData)
    }
  }

  const handleEnterEditMode = () => {
    setIsEditMode(true)
    // حفظ القيم الأصلية لمقارنتها
    setEditableData({
      boxName: receiptData.boxName || '',
      boxDuration: receiptData.boxDuration || '',
      paidAmount: paidAmount,
      originalBoxName: receiptData.boxName || '',
      originalBoxDuration: receiptData.boxDuration || ''
    })
  }

  const handleSaveChanges = async () => {
    if (!receiptData) return

    try {
      // التحقق من أن الحقول ليست فارغة، إلا إذا كانت القيمة الأصلية فارغة
      const finalBoxName = editableData.boxName?.trim() || editableData.originalBoxName || receiptData.boxName || ''
      const finalBoxDuration = editableData.boxDuration?.trim() || editableData.originalBoxDuration || receiptData.boxDuration || ''
      
      // Update receipt data
      const updatedReceipt = {
        ...receiptData,
        boxName: finalBoxName,
        boxDuration: finalBoxDuration,
        paidAmount: editableData.paidAmount
      }

      // Save to localStorage
      localStorage.setItem(`receipt_${receiptData.orderNo}`, JSON.stringify(updatedReceipt))
      
      // Update in database via API
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo: receiptData.orderNo,
          updates: {
            boxName: finalBoxName,
            boxDuration: finalBoxDuration,
            paidAmount: editableData.paidAmount
          }
        })
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث البيانات في قاعدة البيانات')
      }
      
      // Update state
      setReceiptData(updatedReceipt)
      setPaidAmount(editableData.paidAmount)
      setIsEditMode(false)
      
      // Show success message
      setSaveMessage('✓ تم حفظ التعديلات بنجاح في قاعدة البيانات')
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error saving changes:', error)
      setSaveMessage('✗ فشل في حفظ التعديلات: ' + (error as Error).message)
      setTimeout(() => setSaveMessage(''), 5000)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditableData({})
  }

  const handleDownload = () => {
    // Create a new window for download
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('تعذر فتح نافذة الطباعة. يرجى السماح للنوافذ المنبثقة.')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إيصال استلام - ${receiptData?.orderNo || ''}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            padding: 20px;
            direction: rtl;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 0 10px;">🖨️ طباعة</button>
          <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 0 10px;">❌ إغلاق</button>
        </div>
        <div id="receipt-content"></div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Render the receipt in the new window
    const receiptElement = document.querySelector('.customer-receipt')
    if (receiptElement) {
      const receiptContent = printWindow.document.getElementById('receipt-content')
      if (receiptContent) {
        receiptContent.innerHTML = receiptElement.outerHTML
      }
    }
    
    printWindow.focus()
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإيصال...</p>
        </div>
      </div>
    )
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">لم يتم العثور على الإيصال</h1>
          <p className="text-gray-600 mb-6">لا توجد بيانات إيصال متاحة للعرض</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .customer-receipt,
          .customer-receipt * {
            visibility: visible;
          }
          
          .customer-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          .print-controls {
            display: none !important;
          }
        }
      `}} />
      
      {/* Header Controls */}
      <div className="print-controls bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleGoBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">إيصال استلام</h1>
                <p className="text-sm text-gray-600">رقم الإيصال: {receiptData.orderNo}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {!isEditMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">المبلغ المدفوع:</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => handlePaidAmountChange(Number(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                    <span className="text-sm text-gray-600">جنيه</span>
                  </div>
                  <Button onClick={handleEnterEditMode} variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                    <Edit2 className="w-4 h-4 ml-2" />
                    تعديل البيانات
                  </Button>
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                  <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSaveChanges} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التعديلات
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    إلغاء
                  </Button>
                </>
              )}
              {saveMessage && (
                <span className={`text-sm font-medium ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Fields */}
      {isEditMode && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">تعديل بيانات الإيصال</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع البوكس</label>
                <input
                  type="text"
                  value={editableData.boxName || ''}
                  onChange={(e) => setEditableData({...editableData, boxName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: ميمي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدة البوكس</label>
                <input
                  type="text"
                  value={editableData.boxDuration || ''}
                  onChange={(e) => setEditableData({...editableData, boxDuration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: أسبوع واحد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع</label>
                <input
                  type="number"
                  value={editableData.paidAmount || 0}
                  onChange={(e) => setEditableData({...editableData, paidAmount: Number(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <CustomerReceipt
            catData={receiptData.catData}
            boxSummary={receiptData.boxSummary}
            pricing={receiptData.pricing}
            costs={receiptData.costs}
            orderNo={receiptData.orderNo}
            paidAmount={isEditMode ? editableData.paidAmount : paidAmount}
            boxName={isEditMode ? editableData.boxName : (receiptData.boxName || '')}
            boxDuration={isEditMode ? editableData.boxDuration : (receiptData.boxDuration || '')}
            boxPrice={receiptData.boxPrice}
          />
        </div>
        
        {/* Print Instructions */}
        <div className="print-controls mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-blue-800 text-sm">
              <p className="font-semibold mb-2">💡 نصائح للطباعة:</p>
              <ul className="text-right space-y-1">
                <li>• استخدم ورق A4 للحصول على أفضل نتيجة</li>
                <li>• تأكد من ضبط الطابعة على الاتجاه العمودي</li>
                <li>• يمكنك حفظ الإيصال كـ PDF من خيارات الطباعة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإيصال...</p>
        </div>
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  )
}
