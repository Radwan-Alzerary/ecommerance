'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Truck,
  X,
  RefreshCw,
  Calendar,
  ShoppingBag,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react'
import { getCustomerProfile } from '@/lib/api' // Import the API function
import type { Customer as APICustomer, Order as APIOrder, OrderItem as APIOrderItem } from '@/types'

// Types (same as profile page)
interface OrderItem extends APIOrderItem {
  // id: string;
  // name: string;
  // price: number;
  // quantity: number;
  // image?: string;
}

interface Order extends APIOrder {
  // _id: string;
  // items: OrderItem[];
  // total: number;
  // status: string;
  createdAt: Date;
  // invoiceNumber?: string;
}

interface CustomerProfile extends APICustomer {
  // _id: string;
  // name: string | null;
  // email: string | null;
  // phoneNumber?: string | null;
  invoice: Order[];
}

// Skeleton loading component
const OrdersSkeleton = () => (
  <div className="container mx-auto px-4 py-8" dir="rtl">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
)

// Print component for invoice
const PrintInvoice = ({ order, customerInfo, onClose }) => {
  const printRef = useRef()

  const handlePrint = () => {
    const printContent = printRef.current
    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    
    winPrint.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>فاتورة - ${order?.invoiceNumber || order?._id}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .invoice-title { font-size: 20px; color: #666; }
          .info-section { display: flex; justify-content: space-between; margin: 20px 0; }
          .info-box { width: 48%; }
          .info-box h3 { margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: right; }
          .items-table th { background-color: #f5f5f5; font-weight: bold; }
          .total-section { margin-top: 20px; text-align: left; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    
    winPrint.document.close()
    winPrint.focus()
    winPrint.print()
    winPrint.close()
  }

  if (!order) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">معاينة الفاتورة</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div ref={printRef} className="p-8" dir="rtl">
          <div className="invoice">
            {/* Header */}
            <div className="header">
              <div className="company-name">شركة التجارة الإلكترونية</div>
              <div className="invoice-title">فاتورة مبيعات</div>
            </div>

            {/* Invoice Info */}
            <div className="info-section">
              <div className="info-box">
                <h3>معلومات الفاتورة</h3>
                <p><strong>رقم الفاتورة:</strong> {String(order?.invoiceNumber || order?._id || 'غير متوفر')}</p>
                <p><strong>تاريخ الإصدار:</strong> {(() => {
                  try {
                    if (!order?.createdAt) return 'غير متوفر'
                    const date = new Date(order.createdAt)
                    if (isNaN(date.getTime())) return 'غير متوفر'
                    return date.toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  } catch (error) {
                    return 'غير متوفر'
                  }
                })()}</p>
                <p><strong>حالة الطلب:</strong> {(() => {
                  const status = order?.status
                  switch (status) {
                    case 'delivered': return 'تم التوصيل'
                    case 'processing': return 'قيد المعالجة'
                    case 'shipped': return 'تم الشحن'
                    case 'cancelled': return 'ملغى'
                    default: return status || 'غير محدد'
                  }
                })()}</p>
              </div>
              
              <div className="info-box">
                <h3>معلومات العميل</h3>
                <p><strong>الاسم:</strong> {String(customerInfo?.name || 'غير متوفر')}</p>
                <p><strong>البريد الإلكتروني:</strong> {String(customerInfo?.email || 'غير متوفر')}</p>
                {customerInfo?.phoneNumber && (
                  <p><strong>رقم الهاتف:</strong> {String(customerInfo.phoneNumber)}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(order?.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    if (!item) return null
                    const price = Number(item.price) || 0
                    const quantity = Number(item.quantity) || 0
                    const total = price * quantity
                    
                    return (
                      <tr key={item.id || item.productId || index}>
                        <td>{String(item.name || 'منتج غير محدد')}</td>
                        <td>{quantity}</td>
                        <td>{price.toLocaleString()}د.ع</td>
                        <td>{total.toLocaleString()}د.ع</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center'}}>لا توجد منتجات</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Section */}
            <div className="total-section">
              <div className="total-row final-total">
                <span>الإجمالي النهائي:</span>
                <span>{(() => {
                  try {
                    const total = Number(order?.totalAmount) || 0
                    return `${total.toLocaleString()}د.ع`
                  } catch (error) {
                    return '0د.ع'
                  }
                })()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p>شكراً لتعاملكم معنا</p>
              <p>تم إنشاء هذه الفاتورة إلكترونياً</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [user, setUser] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  useEffect(() => {
    const fetchOrdersData = async () => {
      setLoading(true)
      setError(null)
      try {
        const customerData = await getCustomerProfile()

        if (customerData) {
          const processedInvoices = (customerData.invoice || []).map(inv => ({
            ...inv,
            createdAt: new Date(inv.createdAt)
          }))

          setUser({
            ...customerData,
            name: customerData.name || 'غير متوفر',
            email: customerData.email || 'غير متوفر',
            invoice: processedInvoices,
          })
        } else {
          setError('تعذر تحميل بيانات الطلبات. قد تحتاج إلى تسجيل الدخول.')
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء جلب بيانات الطلبات.'
        if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('401')) {
          setError('غير مصرح به. يرجى تسجيل الدخول مرة أخرى.')
        } else {
          setError(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrdersData()
  }, [])

  const filteredOrders = useMemo(() => {
    if (!user?.invoice || !Array.isArray(user.invoice)) return []
    
    try {
      return user.invoice.filter(order => {
        if (!order) return false
        
        const orderNumber = String(order.invoiceNumber || order._id || '')
        const searchLower = String(searchTerm || '').toLowerCase()
        const matchesSearch = orderNumber.toLowerCase().includes(searchLower) ||
                             (Array.isArray(order.items) && order.items.some(item => 
                               item && String(item.name || '').toLowerCase().includes(searchLower)
                             ))
        
        const orderStatus = String(order.status || '')
        const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter
        
        return matchesSearch && matchesStatus
      }).sort((a, b) => {
        try {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA // Most recent first
        } catch (error) {
          return 0
        }
      })
    } catch (error) {
      console.error('Error filtering orders:', error)
      return []
    }
  }, [user?.invoice, searchTerm, statusFilter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'تم التوصيل'
      case 'processing': return 'قيد المعالجة'
      case 'shipped': return 'تم الشحن'
      case 'cancelled': return 'ملغى'
      default: return status || 'غير محدد'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const handlePrintOrder = (order) => {
    setSelectedOrder(order)
    setShowPrintModal(true)
  }

  const orderStats = useMemo(() => {
    if (!Array.isArray(user?.invoice)) return { total: 0, delivered: 0, processing: 0, totalAmount: 0 }
    
    return user.invoice.reduce((stats, order) => {
      if (!order) return stats
      
      stats.total++
      if (order.status === 'delivered') stats.delivered++
      if (order.status === 'processing') stats.processing++
      stats.totalAmount += Number(order.totalAmount) || 0
      
      return stats
    }, { total: 0, delivered: 0, processing: 0, totalAmount: 0 })
  }, [user?.invoice])

  if (loading) {
    return <OrdersSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">طلباتي</h1>
            <p className="text-gray-600">إدارة ومتابعة جميع طلباتك</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold">{orderStats.total}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">تم التوصيل</p>
                      <p className="text-2xl font-bold">{orderStats.delivered}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-amber-600 to-amber-700 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm font-medium">قيد المعالجة</p>
                      <p className="text-2xl font-bold">{orderStats.processing}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">إجمالي المبلغ</p>
                      <p className="text-2xl font-bold">{orderStats.totalAmount.toLocaleString()}د.ع</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="البحث في الطلبات..."
                      value={searchTerm || ''}
                      onChange={(e) => {
                        try {
                          setSearchTerm(String(e?.target?.value || ''))
                        } catch (error) {
                          console.error('Error updating search term:', error)
                          setSearchTerm('')
                        }
                      }}
                      className="pr-10 rounded-xl border-gray-200"
                    />
                  </div>
                  <select
                    value={statusFilter || 'all'}
                    onChange={(e) => {
                      try {
                        setStatusFilter(String(e?.target?.value || 'all'))
                      } catch (error) {
                        console.error('Error updating status filter:', error)
                        setStatusFilter('all')
                      }
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="processing">قيد المعالجة</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders List */}
          <div className="space-y-4">
            <AnimatePresence>
              {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد طلبات تطابق البحث</p>
                </motion.div>
              ) : (
                filteredOrders.map((order, index) => {
                  if (!order) return null
                  return (
                    <motion.div
                      key={order._id || order.invoiceNumber || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-6">
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  طلب رقم: <span className="font-mono">{String(order?.invoiceNumber || order?._id || 'غير متوفر')}</span>
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {(() => {
                                    try {
                                      if (!order?.createdAt) return 'تاريخ غير متوفر'
                                      const date = new Date(order.createdAt)
                                      if (isNaN(date.getTime())) return 'تاريخ غير صحيح'
                                      return date.toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    } catch (error) {
                                      console.error('Error formatting date:', error)
                                      return 'تاريخ غير متوفر'
                                    }
                                  })()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={`${getStatusColor(order.status)} border px-3 py-1 rounded-full`}>
                                {getStatusIcon(order.status)}
                                <span className="mr-1">{getStatusText(order.status)}</span>
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl"
                                onClick={() => handlePrintOrder(order)}
                              >
                                <Printer className="w-4 h-4 ml-2" />
                                طباعة
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <Separator className="mb-4" />

                          {/* Order Items */}
                          <div className="space-y-3 mb-4">
                            {Array.isArray(order?.items) && order.items.length > 0 ? (
                              order.items.map((item, itemIndex) => {
                                if (!item) return null
                                return (
                                  <div key={item.id || item.productId || itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{String(item.name || 'منتج غير محدد')}</p>
                                        <p className="text-sm text-gray-600">الكمية: {Number(item.quantity) || 0}</p>
                                      </div>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                      {(() => {
                                        try {
                                          const price = Number(item.price) || 0
                                          return `${price.toLocaleString()}د.ع`
                                        } catch (error) {
                                          console.error('Error formatting price:', error)
                                          return '0د.ع'
                                        }
                                      })()}
                                    </p>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-gray-500 text-center py-4">لا توجد منتجات في هذا الطلب</p>
                            )}
                          </div>

                          {/* Order Total */}
                          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="text-lg font-semibold text-gray-900">الإجمالي:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {(() => {
                                try {
                                  const total = Number(order?.totalAmount) || 0
                                  return `${total.toLocaleString()}د.ع`
                                } catch (error) {
                                  console.error('Error formatting total amount:', error)
                                  return '0د.ع'
                                }
                              })()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintInvoice 
          order={selectedOrder} 
          customerInfo={user}
          onClose={() => {
            setShowPrintModal(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}