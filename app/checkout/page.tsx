'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SignInPrompt from '@/components/SignInPrompt'
import { Loader2, XCircle } from 'lucide-react'
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
  value: number; // Percentage value, fixed amount, or 0 for free shipping
  description: string;
  minOrderAmount?: number; // Optional: Minimum order subtotal for the promo to apply
}
const PROMO_CODES: Record<string, PromoCode> = {
  "SAVE10": { type: "percentage", value: 10, description: "خصم 10%" },
  "RAMADAN24": { type: "percentage", value: 15, description: "خصم 15% (رمضان كريم)", minOrderAmount: 10000 },
  "5KOFF": { type: "fixed", value: 5000, description: "خصم 5,000 د.ع." },
  "FREESHIP": { type: "shipping", value: 0, description: "شحن مجاني" }
};
// --- END PROMO CODE CONFIGURATION ---


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

  const localStorageKey = useMemo(() => getLocalStorageKey(user?.id), [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const storedAddresses = localStorage.getItem(localStorageKey);
      setSavedAddresses(storedAddresses ? JSON.parse(storedAddresses) : []);
      // Auto-fill name and phone from user profile if creating a new address initially
      if (addressManagementMode === 'new' && !shippingInfo.name && !shippingInfo.phone) {
        setShippingInfo(prev => ({
            ...prev,
            name: user.displayName || user.name || '',
            phone: user.phone || '', // Make sure user object has 'phone' or adjust
        }));
      }
    } else {
      setSavedAddresses([]);
    }
  }, [isAuthenticated, user?.id, localStorageKey, user, addressManagementMode]); // Added user and addressManagementMode dependency

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
  }, [shippingInfo.country, countriesData, shippingInfo.city]); // Added shippingInfo.city

  // Effect to recalculate totals when cart, shipping type, or promo changes
  useEffect(() => {
    const currentSubTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let initialShipFee = shippingInfo.shippingType === 'external' ? SHIPPING_FEE : 0;
    let discountVal = 0;
    let finalShipFeeCharged = initialShipFee;

    if (appliedPromo) {
      const promo = appliedPromo.details;
      // Check min order amount for promo
      if (promo.minOrderAmount && currentSubTotal < promo.minOrderAmount) {
        // Promo no longer valid due to subtotal change, auto-remove it
        // This might be too aggressive; consider just showing a message or disabling.
        // For now, let's just not apply the discount if min amount not met.
        // The user would need to remove and re-apply or we show an error.
        // Let's assume applyPromoCode handles this and this effect just reflects the state.
      } else {
        if (promo.type === "percentage") {
          discountVal = (currentSubTotal * promo.value) / 100;
        } else if (promo.type === "fixed") {
          discountVal = promo.value;
        } else if (promo.type === "shipping") {
          if (promo.value === 0) { // Free shipping
            discountVal = initialShipFee; // The value of the discount is the shipping fee
            finalShipFeeCharged = 0;    // Actual shipping charged is 0
          }
        }
        // Ensure discount doesn't exceed subtotal for item-based discounts
        if (promo.type === "percentage" || promo.type === "fixed") {
          discountVal = Math.min(discountVal, currentSubTotal);
        }
      }
    }
    
    // Final amount calculation: Subtotal - (discount applying to items) + (shipping fee actually charged)
    const itemDiscount = (appliedPromo && (appliedPromo.details.type === "percentage" || appliedPromo.details.type === "fixed")) ? discountVal : 0;
    const finalAmount = currentSubTotal - itemDiscount + finalShipFeeCharged;

    setCalculatedTotals({
      displaySubTotal: currentSubTotal,
      displayShipping: initialShipFee,
      displayDiscount: discountVal, // Total value of the discount (can be shipping or item discount)
      finalOrderAmount: finalAmount,
      shippingFeeForPayload: finalShipFeeCharged,
      discountAmountForPayload: discountVal, // This is the monetary value of the applied discount
    });

  }, [cart, shippingInfo.shippingType, appliedPromo]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setOrderError(null);

    if (type === 'radio') {
      if (name === "shippingType") {
        setShippingInfo((prev) => ({ ...prev, shippingType: value as 'internal' | 'external' }));
        // If shipping type changes, re-evaluate promo, especially if it was FREESHIP
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
        notes: prev.notes, // Keep notes
        shippingType: prev.shippingType, // Keep shipping type
        name: user?.displayName || user?.name || '',
        phone: user?.phone || '', // Ensure user object has phone or adjust
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
        ...prev, // Keep current notes and shippingType
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

    // Basic validation for required fields before submitting
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
      clearCart();
      handleRemovePromoCode(); // Clear promo after successful order
      alert(`تم تقديم طلبك بنجاح! رقم الطلب: ${createdOrder.orderNumber || createdOrder.id || 'N/A'}`);
      // router.push(`/order-confirmation/${createdOrder.id}`);
    } catch (error: any) {
      console.error('فشل في تقديم الطلب:', error);
      setOrderError(error.message || 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmittingOrder(false);
    }
  }


  if (authIsLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">جاري التحقق من المصادقة...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-right" dir="rtl">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
        {authError && <p className="text-destructive mb-4">خطأ في المصادقة: {authError.message || authError.toString()}</p>}
        <SignInPrompt />
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-3xl font-bold mb-4 text-green-600">تم تقديم طلبك بنجاح!</h1>
        <p className="mb-8">شكراً لك على التسوق معنا. ستتلقى تأكيدًا بالبريد الإلكتروني قريبًا.</p>
        <Button onClick={() => router.push('/')}>العودة إلى الصفحة الرئيسية</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 text-right" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
      {orderError && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
          <p className="font-semibold">خطأ في الطلب:</p>
          <p>{orderError}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">معلومات الطلب والتوصيل</h2>

          {isAuthenticated && user?.id && (
            <div className="mb-6">
              <Label className="block mb-2 font-medium">خيارات العنوان</Label>
              <div className="flex gap-4"> {/* Use gap for spacing */}
                <label htmlFor="newAddressRadio" className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" id="newAddressRadio" name="addressManagementOption" value="new"
                    checked={addressManagementMode === 'new'} onChange={handleInputChange} className="form-radio" />
                  <span>إدخال عنوان جديد</span>
                </label>
                <label htmlFor="savedAddressRadio" className={`flex items-center gap-2 ${savedAddresses.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  <input type="radio" id="savedAddressRadio" name="addressManagementOption" value="saved"
                    checked={addressManagementMode === 'saved'} onChange={handleInputChange}
                    disabled={savedAddresses.length === 0} className="form-radio" />
                  <span>استخدام عنوان محفوظ ({savedAddresses.length})</span>
                </label>
              </div>
            </div>
          )}

          {addressManagementMode === 'saved' && savedAddresses.length > 0 && (
            <div className="mb-4">
              <Label htmlFor="selectSavedAddress" className="block mb-1 font-medium">اختر عنوانًا محفوظًا</Label>
              <Select value={selectedSavedAddressId} onValueChange={handleSelectSavedAddress} dir="rtl">
                <SelectTrigger id="selectSavedAddress" className="w-full text-right">
                  <SelectValue placeholder="اختر من عناوينك المحفوظة..." />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map(addr => (
                    <SelectItem key={addr.id} value={addr.id} className="text-right">
                      {addr.name} - {addr.address}, {addr.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input aria-label="الاسم الكامل" name="name" placeholder="الاسم الكامل" value={shippingInfo.name} onChange={handleInputChange} required className="text-right" />
              <Input aria-label="رقم الهاتف" name="phone" type="tel" placeholder="رقم الهاتف (مثال: 07701234567)" value={shippingInfo.phone} onChange={handleInputChange} required className="text-right" />

              <div>
                <Label className="block mb-2 font-medium">نوع التوصيل</Label>
                <div className="flex gap-4">
                  <label htmlFor="internalRadio" className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" id="internalRadio" name="shippingType" value="internal" checked={shippingInfo.shippingType === 'internal'} onChange={handleInputChange} className="form-radio" />
                    <span>استلام من المتجر</span>
                  </label>
                  <label htmlFor="externalRadio" className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" id="externalRadio" name="shippingType" value="external" checked={shippingInfo.shippingType === 'external'} onChange={handleInputChange} className="form-radio" />
                    <span>توصيل خارجي (يضاف {SHIPPING_FEE.toLocaleString('ar-IQ')} د.ع)</span>
                  </label>
                </div>
              </div>

              {shippingInfo.shippingType === 'external' && (
                <>
                  <Input aria-label="عنوان الشارع" name="address" placeholder="عنوان الشارع" value={shippingInfo.address} onChange={handleInputChange} required={shippingInfo.shippingType === 'external'} className="text-right" />
                  <div>
                    <Label htmlFor="country" className="block mb-1 font-medium">البلد</Label>
                    <select id="country" name="country" value={shippingInfo.country} onChange={handleInputChange} required={shippingInfo.shippingType === 'external'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right bg-background">
                      {countriesData.map((c) => (<option key={c.country} value={c.country}>{c.country}</option>))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="city" className="block mb-1 font-medium">المدينة</Label>
                    <select id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required={shippingInfo.shippingType === 'external'} disabled={citiesList.length === 0 && shippingInfo.country !== ''} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right bg-background">
                      <option value="">{shippingInfo.country ? (citiesList.length > 0 ? 'اختر المدينة' : 'لا توجد مدن لهذه الدولة') : 'اختر الدولة أولاً'}</option>
                      {citiesList.map((city) => (<option key={city} value={city}>{city}</option>))}
                    </select>
                  </div>
                  <Input aria-label="أقرب نقطة دالة" name="landmark" placeholder="أقرب نقطة دالة (اختياري)" value={shippingInfo.landmark} onChange={handleInputChange} className="text-right" />
                </>
              )}

              <Textarea aria-label="ملاحظات إضافية" name="notes" placeholder="ملاحظات إضافية (اختياري)" value={shippingInfo.notes} onChange={handleInputChange} className="text-right min-h-[100px]" />

              {isAuthenticated && user?.id && addressManagementMode === 'new' && shippingInfo.shippingType === 'external' && (
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox id="saveAddress" checked={saveAddressForFuture} onCheckedChange={(checked) => setSaveAddressForFuture(checked as boolean)} />
                  <label htmlFor="saveAddress" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">حفظ هذه المعلومات لعمليات الشراء المستقبلية</label>
                </div>
              )}
            </div>
            <Button type="submit" className="mt-6 w-full md:w-auto"
              disabled={
                isSubmittingOrder || cart.length === 0 ||
                !shippingInfo.name || !shippingInfo.phone ||
                (shippingInfo.shippingType === 'external' && (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country))
              }>
              {isSubmittingOrder ? (
                <> <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري تقديم الطلب... </>
              ) : ( 'تقديم الطلب' )}
            </Button>
          </form>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">سلة التسوق فارغة.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id || item._id} className="flex justify-between items-center mb-3 pb-3 border-b border-border/50 last:border-b-0 last:pb-0 last:mb-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
                </div>
              ))}

              {/* Promo Code Section */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <Label htmlFor="promoCodeInput" className="block mb-1 text-sm font-medium">رمز الخصم</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCodeInput"
                    placeholder="ادخل الرمز هنا"
                    value={promoCodeInput}
                    onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        if(promoFeedback) setPromoFeedback(null); // Clear feedback on new input only if there was feedback
                    }}
                    className="text-right flex-grow"
                    disabled={isSubmittingOrder || !!appliedPromo}
                  />
                  {!appliedPromo ? (
                    <Button type="button" onClick={handleApplyPromoCode} variant="outline" disabled={!promoCodeInput || isSubmittingOrder}>
                      تطبيق
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => handleRemovePromoCode()} variant="destructive" size="icon" title="إزالة الخصم">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {promoFeedback && (
                  <p className={`mt-1 text-xs ${promoFeedback.includes('تطبيق') || promoFeedback.includes('إزالة') ? 'text-green-600' : 'text-destructive'}`}>
                    {promoFeedback}
                  </p>
                )}
              </div>


              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>المجموع الفرعي</span>
                  <span>{calculatedTotals.displaySubTotal.toLocaleString('ar-IQ')} د.ع</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>رسوم التوصيل</span>
                  {appliedPromo && appliedPromo.details.type === 'shipping' && calculatedTotals.shippingFeeForPayload === 0 ? (
                    <span className="text-green-600">مجاني (تم تطبيق العرض)</span>
                  ) : (
                    <span>{shippingInfo.shippingType === 'external' ? calculatedTotals.displayShipping.toLocaleString('ar-IQ') : '0'} د.ع</span>
                  )}
                </div>

                {calculatedTotals.displayDiscount > 0 && (
                  <div className="flex justify-between items-center text-destructive">
                    <span>الخصم <span className="text-xs">({appliedPromo?.details.description})</span></span>
                    <span>- {calculatedTotals.displayDiscount.toLocaleString('ar-IQ')} د.ع</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t border-border/30">
                  <span>الإجمالي</span>
                  <span>{calculatedTotals.finalOrderAmount.toLocaleString('ar-IQ')} د.ع</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}