'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  Search, 
  Filter,
  Eye,
  Download,
  CheckCircle,
  Clock,
  Truck,
  X,
  RefreshCw,
  Edit3,
  ShoppingBag
} from 'lucide-react'
import { getCustomerProfile } from '@/lib/api' // Import the API function
import type { Customer as APICustomer, Order as APIOrder, OrderItem as APIOrderItem } from '@/types' // Assuming these are defined in your types

// Define or ensure your types match what the API returns and what the page needs
// These might be slightly different from the global types if you need specific transformations here.
interface OrderItem extends APIOrderItem {
  // id: string; // Already in APIOrderItem
  // name: string; // Already in APIOrderItem
  // price: number; // Already in APIOrderItem
  // quantity: number; // Already in APIOrderItem
  // image?: string; // Already in APIOrderItem
}

interface Order extends APIOrder {
  // _id: string; // Already in APIOrder (assuming your APIOrder uses _id)
  // items: OrderItem[]; // Already in APIOrder
  // total: number; // Already in APIOrder
  // status: string; // Already in APIOrder
  createdAt: Date; // Ensure this is a Date object for formatting
  // invoiceNumber?: string; // Already in APIOrder (optional)
}

interface CustomerProfile extends APICustomer {
  // _id: string; // Already in APICustomer
  // name: string | null; // Already in APICustomer
  // email: string | null; // Already in APICustomer
  // phoneNumber?: string | null; // Already in APICustomer
  invoice: Order[]; // Override with the locally defined Order type that ensures createdAt is Date
}

// Skeleton loading component
const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-16" dir="rtl">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-56"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function ModernProfilePage() {
  const [user, setUser] = useState<CustomerProfile | null>(null)
  // Invoices state will be derived from user.invoice, but kept for clarity if you had separate fetching logic before
  const [invoices, setInvoices] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        const customerData = await getCustomerProfile() // Use the API function

        if (customerData) {
          const processedInvoices = (customerData.invoice || []).map(inv => ({
            ...inv,
            createdAt: new Date(inv.createdAt) // Ensure createdAt is a Date object
          }));

          setUser({
            ...customerData,
            name: customerData.name || 'غير متوفر',
            email: customerData.email || 'غير متوفر',
            invoice: processedInvoices, // Use processed invoices
          });
          setInvoices(processedInvoices);

        } else {
          setError('تعذر تحميل بيانات الملف الشخصي. قد تحتاج إلى تسجيل الدخول أو أن الملف الشخصي غير موجود.')
          // Handle redirection to login if necessary, e.g., if your API interceptor doesn't do it
          // import { useRouter } from 'next/navigation';
          // const router = useRouter();
          // router.push('/signin?message=profile_load_failed');
        }
      } catch (err) {
        console.error('Error fetching customer profile on page:', err)
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء جلب بيانات الملف الشخصي.'
        if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('401')) {
            setError('غير مصرح به. يرجى تسجيل الدخول مرة أخرى.');
            // Potentially redirect to login
            // import { useRouter } from 'next/navigation';
            // const router = useRouter();
            // router.push('/signin?unauthorized=true');
        } else {
            setError(errorMessage);
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

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
      default: return status
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

  const filteredInvoices = useMemo(() => {
    if (!user?.invoice || !Array.isArray(user.invoice)) return []
    
    try {
      return user.invoice.filter(invoice => {
        if (!invoice) return false
        
        // Safe search matching
        const invoiceNumber = String(invoice.invoiceNumber || invoice._id || '')
        const searchLower = String(searchTerm || '').toLowerCase()
        const matchesSearch = invoiceNumber.toLowerCase().includes(searchLower) ||
                             (Array.isArray(invoice.items) && invoice.items.some(item => 
                               item && String(item.name || '').toLowerCase().includes(searchLower)
                             ))
        
        // Safe status matching
        const invoiceStatus = String(invoice.status || '')
        const matchesStatus = statusFilter === 'all' || invoiceStatus === statusFilter
        
        return matchesSearch && matchesStatus
      })
    } catch (error) {
      console.error('Error filtering invoices:', error)
      return []
    }
  }, [user?.invoice, searchTerm, statusFilter])

  if (loading) {
    return <ProfileSkeleton />
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

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">لم يتم العثور على بيانات المستخدم</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ملفي الشخصي</h1>
            <p className="text-gray-600">إدارة حسابك ومتابعة طلباتك</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                      <p className="text-2xl font-bold">{Array.isArray(user?.invoice) ? user.invoice.length : 0}</p>
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
                      <p className="text-emerald-100 text-sm font-medium">إجمالي المبلغ</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          try {
                            if (!Array.isArray(user?.invoice)) return '0د.ع'
                            const total = user.invoice.reduce((sum, invoice) => {
                              const amount = Number(invoice?.totalAmount) || 0
                              return sum + amount
                            }, 0)
                            return `${total.toLocaleString()}د.ع`
                          } catch (error) {
                            console.error('Error calculating total amount:', error)
                            return '0د.ع'
                          }
                        })()}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">عضو منذ</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          try {
                            if (!user?.joinDate) return new Date().getFullYear()
                            const joinYear = new Date(user.joinDate).getFullYear()
                            return isNaN(joinYear) ? new Date().getFullYear() : joinYear
                          } catch (error) {
                            console.error('Error parsing join date:', error)
                            return new Date().getFullYear()
                          }
                        })()}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white rounded-xl p-1 shadow-sm border">
              <TabsTrigger 
                value="profile" 
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="w-4 h-4 ml-2" />
                الملف الشخصي
              </TabsTrigger>
              <TabsTrigger 
                value="invoices"
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                <Package className="w-4 h-4 ml-2" />
                الفواتير ({user.invoice.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white rounded-2xl shadow-sm border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl text-gray-900">معلومات الملف الشخصي</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          إدارة تفاصيل حسابك الشخصي
                        </CardDescription>
                      </div>
                      <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50">
                        <Edit3 className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <User className="w-5 h-5 text-gray-500 ml-3" />
                          <div>
                            <p className="text-sm text-gray-600">الاسم الكامل</p>
                            <p className="font-semibold text-gray-900">{String(user?.name || 'غير متوفر')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <Mail className="w-5 h-5 text-gray-500 ml-3" />
                          <div>
                            <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                            <p className="font-semibold text-gray-900">{String(user?.email || 'غير متوفر')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {user?.phoneNumber && String(user.phoneNumber).trim() && (
                          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-gray-500 ml-3" />
                            <div>
                              <p className="text-sm text-gray-600">رقم الهاتف</p>
                              <p className="font-semibold text-gray-900" dir="ltr">{String(user.phoneNumber)}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-gray-500 ml-3" />
                          <div>
                            <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                            <p className="font-semibold text-gray-900">
                              {(() => {
                                try {
                                  if (!user?.joinDate) return 'غير متوفر'
                                  const joinDate = new Date(user.joinDate)
                                  if (isNaN(joinDate.getTime())) return 'غير متوفر'
                                  return joinDate.toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long'
                                  })
                                } catch (error) {
                                  console.error('Error formatting join date:', error)
                                  return 'غير متوفر'
                                }
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Display other customer fields from user object as needed */}
                        {/* e.g., user.addresses, user.jop etc. */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="invoices">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Search and Filter */}
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="البحث في الفواتير..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pr-10 rounded-xl border-gray-200"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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

                {/* Invoices List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredInvoices.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد فواتير تطابق البحث</p>
                      </motion.div>
                    ) : (
                      filteredInvoices.map((invoice, index) => (
                        <motion.div
                          key={invoice._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-6">
                              {/* Invoice Header */}
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      طلب رقم: <span className="font-mono">{String(invoice?.invoiceNumber || invoice?._id || 'غير متوفر')}</span>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {(() => {
                                        try {
                                          if (!invoice?.createdAt) return 'تاريخ غير متوفر'
                                          const date = new Date(invoice.createdAt)
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
                                  <Badge className={`${getStatusColor(invoice.status)} border px-3 py-1 rounded-full`}>
                                    {getStatusIcon(invoice.status)}
                                    <span className="mr-1">{getStatusText(invoice.status)}</span>
                                  </Badge>
                                  <Button variant="outline" size="sm" className="rounded-xl">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <Separator className="mb-4" />

                              {/* Invoice Items */}
                              <div className="space-y-3 mb-4">
                                {Array.isArray(invoice?.items) && invoice.items.length > 0 ? (
                                  invoice.items.map((item, itemIndex) => {
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

                              {/* Invoice Total */}
                              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-lg font-semibold text-gray-900">الإجمالي:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                  {invoice.totalAmount?.toLocaleString()}د.ع
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}