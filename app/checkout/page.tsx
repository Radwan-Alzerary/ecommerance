'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SignInPrompt from '@/components/SignInPrompt'
import { 
  Loader2, 
  XCircle, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  Truck, 
  Store, 
  Tag, 
  Sparkles,
  CreditCard,
  ShoppingBag,
  Package,
  Gift,
  Star,
  CheckCircle2,
  Copy,
  Percent,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { submitOrder, CreateOrderPayload } from '@/lib/api'
import { CartItem } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

type CountryData = {
  country: string
  cities: string[]
}

type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  landmark?: string;
  isDefault?: boolean;
};

// --- PROMO CODE CONFIGURATION ---
type PromoCodeType = "percentage" | "fixed" | "shipping";
interface PromoCode {
  type: PromoCodeType;
  value: number;
  description: string;
  minOrderAmount?: number;
}

const PROMO_CODES: Record<string, PromoCode> = {
  "SAVE10": { type: "percentage", value: 10, description: "خصم 10%" },
  "RAMADAN24": { type: "percentage", value: 15, description: "خصم 15% (رمضان كريم)", minOrderAmount: 10000 },
  "5KOFF": { type: "fixed", value: 5000, description: "خصم 5,000 د.ع." },
  "FREESHIP": { type: "shipping", value: 0, description: "شحن مجاني" }
};

// Floating decoration component
const FloatingElement = ({ delay = 0, children, className = '' }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [0, -20, -40, -60],
      x: [0, 10, -10, 0]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: 3
    }}
  >
    {children}
  </motion.div>
)

// Success animation component
const SuccessAnimation = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 pointer-events-none z-50"
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ 
          x: '50%', 
          y: '50%',
          scale: 0
        }}
        animate={{ 
          x: `${50 + (Math.random() - 0.5) * 200}%`,
          y: `${50 + (Math.random() - 0.5) * 200}%`,
          scale: [0, 1, 0],
          rotate: [0, 360]
        }}
        transition={{
          duration: 2,
          delay: i * 0.1,
          ease: "easeOut"
        }}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400 fill-green-400" />
      </motion.div>
    ))}
  </motion.div>
)

const SHIPPING_FEE = 5000;
const getLocalStorageKey = (userId: string | undefined) => `savedAddresses_${userId || 'guest'}`;

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated, isLoading: authIsLoading, error: authError } = useAuth()
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Iraq',
    landmark: '',
    notes: '',
    shippingType: 'external' as 'external' | 'internal',
    latitude: null as number | null,
    longitude: null as number | null,
  })

  const [countriesData, setCountriesData] = useState<CountryData[]>([])
  const [citiesList, setCitiesList] = useState<string[]>([])

  const [addressManagementMode, setAddressManagementMode] = useState<'new' | 'saved'>('new');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState<boolean>(false);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; details: PromoCode } | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  // Calculated Totals State
  const [calculatedTotals, setCalculatedTotals] = useState({
    displaySubTotal: 0,
    displayShipping: 0,
    displayDiscount: 0,
    finalOrderAmount: 0,
    shippingFeeForPayload: 0,
    discountAmountForPayload: 0,
  });

  // حالات GPS والخريطة
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const localStorageKey = useMemo(() => getLocalStorageKey(user?.id), [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const storedAddresses = localStorage.getItem(localStorageKey);
      setSavedAddresses(storedAddresses ? JSON.parse(storedAddresses) : []);
      if (addressManagementMode === 'new' && !shippingInfo.name && !shippingInfo.phone) {
        setShippingInfo(prev => ({
            ...prev,
            name: user.displayName || user.name || '',
            phone: user.phone || '',
        }));
      }
    } else {
      setSavedAddresses([]);
    }
  }, [isAuthenticated, user?.id, localStorageKey, user, addressManagementMode]);

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then((res) => res.json())
      .then((json) => {
        setCountriesData(json.data)
        const iraqData = json.data.find((c: CountryData) => c.country === 'Iraq');
        if (iraqData) setCitiesList(iraqData.cities);
      })
      .catch((err) => console.error('فشل في تحميل بيانات الدول', err))
  }, [])

  useEffect(() => {
    const selectedCountryData = countriesData.find(c => c.country === shippingInfo.country);
    if (selectedCountryData) {
      setCitiesList(selectedCountryData.cities);
      if (shippingInfo.city && !selectedCountryData.cities.includes(shippingInfo.city)) {
        setShippingInfo(prev => ({ ...prev, city: '' }));
      }
    } else {
      setCitiesList([]);
      setShippingInfo(prev => ({ ...prev, city: '' }));
    }
  }, [shippingInfo.country, countriesData, shippingInfo.city]);

  // Effect to recalculate totals when cart, shipping type, or promo changes
  useEffect(() => {
    const currentSubTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let initialShipFee = shippingInfo.shippingType === 'external' ? SHIPPING_FEE : 0;
    let discountVal = 0;
    let finalShipFeeCharged = initialShipFee;

    if (appliedPromo) {
      const promo = appliedPromo.details;
      if (promo.minOrderAmount && currentSubTotal < promo.minOrderAmount) {
        // Promo no longer valid
      } else {
        if (promo.type === "percentage") {
          discountVal = (currentSubTotal * promo.value) / 100;
        } else if (promo.type === "fixed") {
          discountVal = promo.value;
        } else if (promo.type === "shipping") {
          if (promo.value === 0) {
            discountVal = initialShipFee;
            finalShipFeeCharged = 0;
          }
        }
        if (promo.type === "percentage" || promo.type === "fixed") {
          discountVal = Math.min(discountVal, currentSubTotal);
        }
      }
    }
    
    const itemDiscount = (appliedPromo && (appliedPromo.details.type === "percentage" || appliedPromo.details.type === "fixed")) ? discountVal : 0;
    const finalAmount = currentSubTotal - itemDiscount + finalShipFeeCharged;

    setCalculatedTotals({
      displaySubTotal: currentSubTotal,
      displayShipping: initialShipFee,
      displayDiscount: discountVal,
      finalOrderAmount: finalAmount,
      shippingFeeForPayload: finalShipFeeCharged,
      discountAmountForPayload: discountVal,
    });

  }, [cart, shippingInfo.shippingType, appliedPromo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setOrderError(null);

    if (type === 'radio') {
      if (name === "shippingType") {
        setShippingInfo((prev) => ({ ...prev, shippingType: value as 'internal' | 'external' }));
        if (appliedPromo && appliedPromo.details.type === 'shipping') {
            handleRemovePromoCode("تغير نوع الشحن، يرجى إعادة تطبيق رمز الشحن إذا كان لا يزال ساريًا.");
        }
      } else if (name === "addressManagementOption") {
        handleAddressManagementModeChange(value as 'new' | 'saved');
      }
    } else {
      setShippingInfo((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleAddressManagementModeChange = (value: 'new' | 'saved') => {
    setAddressManagementMode(value);
    setOrderError(null);
    if (value === 'new') {
      setSelectedSavedAddressId('');
      setShippingInfo(prev => ({
        notes: prev.notes,
        shippingType: prev.shippingType,
        name: user?.displayName || user?.name || '',
        phone: user?.phone || '',
        address: '', city: '', country: 'Iraq', landmark: '',
      }));
    } else if (value === 'saved' && savedAddresses.length > 0) {
      const defaultOrFirstAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
      if (defaultOrFirstAddress) {
        handleSelectSavedAddress(defaultOrFirstAddress.id);
      }
    }
  };

  const handleSelectSavedAddress = (addressId: string) => {
    setOrderError(null);
    setSelectedSavedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingInfo(prev => ({
        ...prev,
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        country: selectedAddress.country,
        landmark: selectedAddress.landmark || '',
      }));
    }
  };

  const handleApplyPromoCode = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
        setPromoFeedback("الرجاء إدخال رمز الخصم.");
        return;
    }
    const promoDetails = PROMO_CODES[code];

    if (appliedPromo) {
        setPromoFeedback("تم تطبيق رمز خصم بالفعل. قم بإزالته أولاً.");
        return;
    }

    if (promoDetails) {
        const currentSubTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (promoDetails.minOrderAmount && currentSubTotal < promoDetails.minOrderAmount) {
            setPromoFeedback(`هذا العرض يتطلب حد أدنى للطلب بقيمة ${promoDetails.minOrderAmount.toLocaleString('ar-IQ')} د.ع. مجموع طلبك الحالي ${currentSubTotal.toLocaleString('ar-IQ')} د.ع.`);
            return;
        }
        setAppliedPromo({ code, details: promoDetails });
        setPromoFeedback(`تم تطبيق الخصم: ${promoDetails.description}`);
        setPromoCodeInput('');
    } else {
        setPromoFeedback("رمز الخصم غير صالح أو منتهي الصلاحية.");
    }
  };

  const handleRemovePromoCode = (customMessage?: string) => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoFeedback(customMessage || "تمت إزالة رمز الخصم.");
  };

  // دالة للحصول على الموقع الحالي
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setShippingInfo(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        // محاولة الحصول على العنوان من الإحداثيات باستخدام Reverse Geocoding
        try {
          // استخدام Nominatim API (مجاني)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          );
          const data = await response.json();
          
          if (data.address) {
            const address = [
              data.address.road,
              data.address.neighbourhood,
              data.address.suburb,
              data.address.city || data.address.town || data.address.village
            ].filter(Boolean).join(', ');

            setShippingInfo(prev => ({
              ...prev,
              address: address || prev.address,
              city: data.address.city || data.address.town || data.address.village || prev.city,
            }));
          }
        } catch (error) {
          console.error('Error getting address:', error);
        }

        setIsGettingLocation(false);
        setShowMap(true);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('تم رفض الإذن للوصول إلى موقعك. يرجى السماح بالوصول في إعدادات المتصفح.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('معلومات الموقع غير متاحة.');
            break;
          case error.TIMEOUT:
            setLocationError('انتهت مهلة طلب تحديد الموقع.');
            break;
          default:
            setLocationError('حدث خطأ غير معروف أثناء تحديد الموقع.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user._id) {
      setOrderError("المستخدم غير مسجل الدخول. يرجى تسجيل الدخول للمتابعة.");
      return;
    }
    if (cart.length === 0) {
      setOrderError("سلة التسوق فارغة. يرجى إضافة منتجات للمتابعة.");
      return;
    }

    if (!shippingInfo.name.trim() || !shippingInfo.phone.trim()) {
        setOrderError("الرجاء إدخال الاسم ورقم الهاتف.");
        return;
    }
    if (shippingInfo.shippingType === 'external' && (!shippingInfo.address.trim() || !shippingInfo.city.trim() || !shippingInfo.country.trim())) {
        setOrderError("للشحن الخارجي، الرجاء إكمال حقول العنوان والمدينة والبلد.");
        return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);
    setOrderSuccess(false);

    if (isAuthenticated && user?.id && saveAddressForFuture && addressManagementMode === 'new' && shippingInfo.shippingType === 'external') {
      const newAddressToSave: SavedAddress = {
        id: Date.now().toString(), name: shippingInfo.name, phone: shippingInfo.phone,
        address: shippingInfo.address, city: shippingInfo.city, country: shippingInfo.country,
        landmark: shippingInfo.landmark,
      };
      const alreadyExists = savedAddresses.some(addr =>
        addr.name === newAddressToSave.name && addr.phone === newAddressToSave.phone &&
        addr.address === newAddressToSave.address && addr.city === newAddressToSave.city &&
        addr.country === newAddressToSave.country && addr.landmark === newAddressToSave.landmark
      );
      if (!alreadyExists) {
        const updatedAddresses = [...savedAddresses, newAddressToSave];
        setSavedAddresses(updatedAddresses);
        localStorage.setItem(localStorageKey, JSON.stringify(updatedAddresses));
      }
    }

    const orderPayload: CreateOrderPayload = {
      userId: user._id,
      shippingInfo: {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        notes: shippingInfo.notes,
        shippingType: shippingInfo.shippingType,
        ...(shippingInfo.shippingType === 'external' && {
          address: shippingInfo.address,
          city: shippingInfo.city,
          country: shippingInfo.country,
          landmark: shippingInfo.landmark,
        }),
        ...(shippingInfo.latitude && shippingInfo.longitude && {
          location: {
            latitude: shippingInfo.latitude,
            longitude: shippingInfo.longitude
          }
        })
      },
      items: cart.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })) as CartItem[],
      totalAmount: calculatedTotals.finalOrderAmount,
      shippingFee: calculatedTotals.shippingFeeForPayload,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
      discountAmount: calculatedTotals.discountAmountForPayload > 0 ? calculatedTotals.discountAmountForPayload : undefined,
    };

    console.log('إرسال بيانات الطلب:', orderPayload);

    try {
      const createdOrder = await submitOrder(orderPayload);
      setOrderSuccess(true);
      
      // تفريغ السلة
      clearCart();
      
      // إطلاق حدث مخصص لإعلام جميع المكونات بتحديث السلة
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify([]),
        url: window.location.href
      }));
      
      handleRemovePromoCode();
      alert(`تم تقديم طلبك بنجاح! رقم الطلب: ${createdOrder.orderNumber || createdOrder.id || 'N/A'}`);
    } catch (error: any) {
      console.error('فشل في تقديم الطلب:', error);
      setOrderError(error.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  if (authIsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">جاري التحقق من المصادقة...</span>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full filter blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-8 text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              إتمام الطلب
            </h1>
            {authError && (
              <p className="text-red-600 dark:text-red-400 mb-4">
                خطأ في المصادقة: {authError.message || authError.toString()}
              </p>
            )}
            <div className="max-w-md mx-auto">
              <SignInPrompt />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        <SuccessAnimation />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-200/30 dark:bg-green-800/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-16 text-center" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              تم تقديم طلبك بنجاح!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              شكراً لك على التسوق معنا. ستتلقى تأكيدًا بالبريد الإلكتروني قريبًا.
            </p>
            <Button 
              onClick={() => {
                try {
                  router.push('/');
                } catch (error) {
                  // استخدام window.location كبديل
                  window.location.href = '/';
                }
              }}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة إلى الصفحة الرئيسية
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 dark:bg-pink-800/10 rounded-full filter blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <FloatingElement delay={0} className="top-20 left-20">
        <Sparkles className="w-6 h-6 text-blue-400/60" />
      </FloatingElement>
      <FloatingElement delay={1} className="top-32 right-32">
        <div className="w-3 h-3 bg-purple-400/60 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={2} className="bottom-40 left-40">
        <ShoppingBag className="w-5 h-5 text-pink-400/60" />
      </FloatingElement>

      <div className="relative container mx-auto px-6 py-8 text-right" dir="rtl">
        {/* Header */}

        {/* Error Alert */}
        <AnimatePresence>
          {orderError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="mb-6 max-w-4xl mx-auto"
            >
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">خطأ في الطلب:</p>
                    <p className="text-red-700 dark:text-red-300">{orderError}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Shipping Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">معلومات التوصيل</h2>
              </div>

              {/* Address Management Options */}
              {isAuthenticated && user?.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                >
                  <Label className="block mb-4 font-semibold text-gray-900 dark:text-white">خيارات العنوان</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label htmlFor="newAddressRadio" className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        id="newAddressRadio" 
                        name="addressManagementOption" 
                        value="new"
                        checked={addressManagementMode === 'new'} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        إدخال عنوان جديد
                      </span>
                    </label>
                    <label htmlFor="savedAddressRadio" className={`flex items-center gap-3 ${savedAddresses.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`}>
                      <input 
                        type="radio" 
                        id="savedAddressRadio" 
                        name="addressManagementOption" 
                        value="saved"
                        checked={addressManagementMode === 'saved'} 
                        onChange={handleInputChange}
                        disabled={savedAddresses.length === 0} 
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        استخدام عنوان محفوظ ({savedAddresses.length})
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Saved Address Selection */}
              {addressManagementMode === 'saved' && savedAddresses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Label htmlFor="selectSavedAddress" className="block mb-2 font-semibold text-gray-900 dark:text-white">
                    اختر عنوانًا محفوظًا
                  </Label>
                  <Select value={selectedSavedAddressId} onValueChange={handleSelectSavedAddress} dir="rtl">
                    <SelectTrigger id="selectSavedAddress" className="w-full text-right bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl h-12">
                      <SelectValue placeholder="اختر من عناوينك المحفوظة..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {savedAddresses.map(addr => (
                        <SelectItem key={addr.id} value={addr.id} className="text-right">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-blue-500" />
                            {addr.name} - {addr.address}, {addr.city}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="name" className="block mb-2 font-semibold text-gray-900 dark:text-white">
                      الاسم الكامل
                    </Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        id="name"
                        name="name" 
                        placeholder="الاسم الكامل" 
                        value={shippingInfo.name} 
                        onChange={handleInputChange} 
                        required 
                        className="pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl text-right" 
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="phone" className="block mb-2 font-semibold text-gray-900 dark:text-white">
                      رقم الهاتف
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        id="phone"
                        name="phone" 
                        type="tel" 
                        placeholder="رقم الهاتف (مثال: 07701234567)" 
                        value={shippingInfo.phone} 
                        onChange={handleInputChange} 
                        required 
                        className="pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl text-right" 
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Shipping Type */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                >
                  <Label className="block mb-4 font-semibold text-gray-900 dark:text-white">نوع التوصيل</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      shippingInfo.shippingType === 'internal' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <input 
                        type="radio" 
                        name="shippingType" 
                        value="internal" 
                        checked={shippingInfo.shippingType === 'internal'} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <Store className="w-6 h-6" />
                      <div>
                        <span className="font-semibold">استلام من المتجر</span>
                        <p className="text-sm opacity-75">مجاني</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      shippingInfo.shippingType === 'external' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      <input 
                        type="radio" 
                        name="shippingType" 
                        value="external" 
                        checked={shippingInfo.shippingType === 'external'} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <Truck className="w-6 h-6" />
                      <div>
                        <span className="font-semibold">توصيل خارجي</span>
                        <p className="text-sm opacity-75">{SHIPPING_FEE.toLocaleString('ar-IQ')} د.ع</p>
                      </div>
                    </label>
                  </div>
                </motion.div>

                {/* External Shipping Details */}
                <AnimatePresence>
                  {shippingInfo.shippingType === 'external' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label htmlFor="address" className="font-semibold text-gray-900 dark:text-white">
                            عنوان الشارع
                          </Label>
                          <Button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isGettingLocation}
                            className="h-9 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            {isGettingLocation ? (
                              <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري التحديد...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 ml-2" />
                                تحديد موقعي الحالي
                              </>
                            )}
                          </Button>
                        </div>

                        {locationError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                          >
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <span className="text-sm text-red-700 dark:text-red-300">{locationError}</span>
                          </motion.div>
                        )}

                        {shippingInfo.latitude && shippingInfo.longitude && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                          >
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              تم تحديد الموقع: {shippingInfo.latitude.toFixed(6)}, {shippingInfo.longitude.toFixed(6)}
                            </span>
                          </motion.div>
                        )}

                        <div className="relative">
                          <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <Textarea 
                            id="address"
                            name="address" 
                            placeholder="عنوان الشارع التفصيلي" 
                            value={shippingInfo.address} 
                            onChange={handleInputChange} 
                            required={shippingInfo.shippingType === 'external'} 
                            className="pr-10 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl text-right min-h-[80px]" 
                          />
                        </div>

                        {/* عرض الخريطة */}
                        <AnimatePresence>
                          {showMap && shippingInfo.latitude && shippingInfo.longitude && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                            >
                              <div className="bg-white dark:bg-gray-800 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">موقعك على الخريطة</h3>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={() => setShowMap(false)}
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                  >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                  </Button>
                                </div>
                                <div className="relative w-full h-80 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${shippingInfo.longitude - 0.01},${shippingInfo.latitude - 0.01},${shippingInfo.longitude + 0.01},${shippingInfo.latitude + 0.01}&layer=mapnik&marker=${shippingInfo.latitude},${shippingInfo.longitude}`}
                                    allowFullScreen
                                  />
                                  <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      📍 {shippingInfo.latitude.toFixed(4)}, {shippingInfo.longitude.toFixed(4)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <a
                                    href={`https://www.google.com/maps?q=${shippingInfo.latitude},${shippingInfo.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                  >
                                    <MapPin className="w-4 h-4" />
                                    فتح في خرائط Google
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Label htmlFor="country" className="block mb-2 font-semibold text-gray-900 dark:text-white">البلد</Label>
                          <select 
                            id="country" 
                            name="country" 
                            value={shippingInfo.country} 
                            onChange={handleInputChange} 
                            required={shippingInfo.shippingType === 'external'} 
                            className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-gray-50 dark:bg-gray-800"
                          >
                            {countriesData.map((c) => (
                              <option key={c.country} value={c.country}>{c.country}</option>
                            ))}
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Label htmlFor="city" className="block mb-2 font-semibold text-gray-900 dark:text-white">المدينة</Label>
                          <select 
                            id="city" 
                            name="city" 
                            value={shippingInfo.city} 
                            onChange={handleInputChange} 
                            required={shippingInfo.shippingType === 'external'} 
                            disabled={citiesList.length === 0 && shippingInfo.country !== ''} 
                            className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-gray-50 dark:bg-gray-800"
                          >
                            <option value="">{shippingInfo.country ? (citiesList.length > 0 ? 'اختر المدينة' : 'لا توجد مدن لهذه الدولة') : 'اختر الدولة أولاً'}</option>
                            {citiesList.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <Label htmlFor="landmark" className="block mb-2 font-semibold text-gray-900 dark:text-white">
                          أقرب نقطة دالة (اختياري)
                        </Label>
                        <Input 
                          id="landmark"
                          name="landmark" 
                          placeholder="مثال: بجانب مستشفى البتول" 
                          value={shippingInfo.landmark} 
                          onChange={handleInputChange} 
                          className="h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl text-right" 
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Label htmlFor="notes" className="block mb-2 font-semibold text-gray-900 dark:text-white">
                    ملاحظات إضافية (اختياري)
                  </Label>
                  <Textarea 
                    id="notes"
                    name="notes" 
                    placeholder="أي تعليمات خاصة للتوصيل..." 
                    value={shippingInfo.notes} 
                    onChange={handleInputChange} 
                    className="bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl text-right min-h-[100px]" 
                  />
                </motion.div>

                {/* Save Address Option */}
                {isAuthenticated && user?.id && addressManagementMode === 'new' && shippingInfo.shippingType === 'external' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800"
                  >
                    <Checkbox 
                      id="saveAddress" 
                      checked={saveAddressForFuture} 
                      onCheckedChange={(checked) => setSaveAddressForFuture(checked as boolean)} 
                      className="rounded-md"
                    />
                    <label htmlFor="saveAddress" className="text-sm font-medium text-yellow-800 dark:text-yellow-200 cursor-pointer">
                      حفظ هذه المعلومات لعمليات الشراء المستقبلية
                    </label>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={
                      isSubmittingOrder || cart.length === 0 ||
                      !shippingInfo.name || !shippingInfo.phone ||
                      (shippingInfo.shippingType === 'external' && (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country))
                    }
                  >
                    {isSubmittingOrder ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري تقديم الطلب...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        تقديم الطلب
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ملخص الطلب</h2>
              </div>

              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">سلة التسوق فارغة.</p>
                </motion.div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id || item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">الكمية: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          {(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Promo Code Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <Label htmlFor="promoCodeInput" className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                        رمز الخصم
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="promoCodeInput"
                        placeholder="ادخل الرمز هنا"
                        value={promoCodeInput}
                        onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            if(promoFeedback) setPromoFeedback(null);
                        }}
                        className="text-right flex-grow bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 rounded-xl"
                        disabled={isSubmittingOrder || !!appliedPromo}
                      />
                      {!appliedPromo ? (
                        <Button 
                          type="button" 
                          onClick={handleApplyPromoCode} 
                          variant="outline" 
                          disabled={!promoCodeInput || isSubmittingOrder}
                          className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl"
                        >
                          تطبيق
                        </Button>
                      ) : (
                        <Button 
                          type="button" 
                          onClick={() => handleRemovePromoCode()} 
                          variant="destructive" 
                          size="icon" 
                          title="إزالة الخصم"
                          className="rounded-xl"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {promoFeedback && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 text-xs ${promoFeedback.includes('تطبيق') || promoFeedback.includes('إزالة') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {promoFeedback}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Order Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
                      <span className="font-semibold">{calculatedTotals.displaySubTotal.toLocaleString('ar-IQ')} د.ع</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">رسوم التوصيل</span>
                      {appliedPromo && appliedPromo.details.type === 'shipping' && calculatedTotals.shippingFeeForPayload === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">مجاني (تم تطبيق العرض)</span>
                      ) : (
                        <span className="font-semibold">
                          {shippingInfo.shippingType === 'external' ? calculatedTotals.displayShipping.toLocaleString('ar-IQ') : '0'} د.ع
                        </span>
                      )}
                    </div>

                    {calculatedTotals.displayDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-600 dark:text-red-400">
                          الخصم <span className="text-xs">({appliedPromo?.details.description})</span>
                        </span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          - {calculatedTotals.displayDiscount.toLocaleString('ar-IQ')} د.ع
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900 dark:text-white">الإجمالي</span>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {calculatedTotals.finalOrderAmount.toLocaleString('ar-IQ')} د.ع
                      </span>
                    </div>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 grid grid-cols-3 gap-4"
                  >
                    {[
                      { icon: Shield, label: 'دفع آمن' },
                      { icon: Clock, label: 'توصيل سريع' },
                      { icon: Star, label: 'جودة مضمونة' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-1">
                          <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}