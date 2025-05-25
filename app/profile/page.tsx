'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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


export default function ProfilePage() {
  const [user, setUser] = useState<CustomerProfile | null>(null)
  // Invoices state will be derived from user.invoice, but kept for clarity if you had separate fetching logic before
  const [invoices, setInvoices] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16 text-center" dir="rtl">
        <p className="text-xl">جار التحميل...</p>
        {/* You can add a spinner here */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center text-red-600" dir="rtl">
        <p className="text-xl mb-4">خطأ: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          إعادة المحاولة
        </Button>
        {/* Optionally, a button to go to homepage or login */}
        {/* <Button onClick={() => router.push('/signin')} className="mt-2">تسجيل الدخول</Button> */}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16 text-center" dir="rtl">
        <p className="text-xl">لم يتم العثور على بيانات المستخدم. قد تحتاج إلى تسجيل الدخول.</p>
        {/* <Button onClick={() => router.push('/signin')} className="mt-4">تسجيل الدخول</Button> */}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-right">ملفي الشخصي</h1>
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="flex justify-start border-b"> {/* Adjusted for RTL common practice */}
            <TabsTrigger value="profile" className="rtl:ml-4 ltr:mr-4">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="text-right">
                <CardTitle>معلومات الملف الشخصي</CardTitle>
                <CardDescription>إدارة تفاصيل حسابك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <div>
                  <strong>الاسم:</strong> {user.name}
                </div>
                <div>
                  <strong>البريد الإلكتروني:</strong> {user.email}
                </div>
                {user.phoneNumber && (
                   <div>
                     <strong>رقم الهاتف:</strong> <span dir="ltr" className="inline-block">{user.phoneNumber}</span>
                   </div>
                )}
                {/* Display other customer fields from user object as needed */}
                {/* e.g., user.addresses, user.jop etc. */}
                <Button className="mt-6">تعديل الملف الشخصي</Button> {/* Consider making this functional */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader className="text-right">
                <CardTitle>الفواتير</CardTitle>
                <CardDescription>عرض سجل طلباتك</CardDescription>
              </CardHeader>
              <CardContent>
                {user.invoice.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد فواتير لعرضها.</p>
                ) : (
                  user.invoice.map((invoice) => (
                    <div key={invoice._id} className="mb-6 p-4 border rounded-lg text-right shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <div>
                            <h3 className="text-lg font-semibold">طلب رقم: <span className="font-mono">{invoice.invoiceNumber || invoice._id}</span></h3>
                            <span className="text-sm text-gray-500">
                            {invoice.createdAt.toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full
                            ${invoice.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            invoice.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'}`}>
                            {invoice.status === 'delivered' ? 'تم التوصيل' :
                             invoice.status === 'processing' ? 'قيد المعالجة' :
                             invoice.status === 'shipped' ? 'تم الشحن' :
                             invoice.status === 'cancelled' ? 'ملغى' :
                             invoice.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <strong className="block mb-1">المنتجات:</strong>
                        <ul className="list-disc list-inside mr-4 space-y-1">
                          {invoice.items.map((item) => (
                            <li key={item.id || item.productId}> {/* Use item.productId if item.id is not available */}
                              {item.name} × {item.quantity} - {item.price?.toLocaleString()}د.ع{/* Example currency */}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-left pt-2 border-t mt-3">
                        <strong className="text-lg">الإجمالي:</strong> <span className="text-lg font-semibold">{invoice.totalAmount?.toLocaleString()}د.ع</span> {/* Example currency */}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}