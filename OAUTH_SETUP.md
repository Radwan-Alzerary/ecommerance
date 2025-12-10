# إعداد تسجيل الدخول عبر Google و Facebook

## الخطوات المطلوبة:

### 1. إعداد Google OAuth

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد أو اختر مشروع موجود
3. في Dashboard، اذهب إلى "APIs & Services" > "Credentials"
4. انقر على "Create Credentials" > "OAuth client ID"
5. اختر "Web application"
6. أضف هذه URLs:
   - **Authorized JavaScript origins**: `http://localhost:4066`
   - **Authorized redirect URIs**: `http://localhost:4066/api/auth/callback/google`
7. احفظ الـ Client ID و Client Secret

### 2. إعداد Facebook OAuth

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. انقر على "My Apps" > "Create App"
3. اختر "Consumer" ثم "Next"
4. املأ تفاصيل التطبيق
5. في Dashboard الخاص بالتطبيق، اذهب إلى "Facebook Login" > "Settings"
6. أضف هذه URLs:
   - **Valid OAuth Redirect URIs**: `http://localhost:4066/api/auth/callback/facebook`
7. احفظ الـ App ID و App Secret

### 3. تحديث ملف .env.local

**ملاحظة مهمة:** يجب أن يكون البورت في `NEXTAUTH_URL` هو نفس البورت الذي يعمل عليه التطبيق (4066)

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:4066
NEXTAUTH_SECRET=rYgr+UTC9/tC/vUbcmH6mAlct/GIYU5cfLAL11ZCa1s=

# Google OAuth - استبدل هذه القيم بالقيم الحقيقية من Google Cloud Console
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# Facebook OAuth - استبدل هذه القيم بالقيم الحقيقية من Facebook Developers
FACEBOOK_CLIENT_ID=your-actual-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-actual-facebook-app-secret
```

**تحقق من:**
- ✅ البورت صحيح (4066)
- ✅ استبدلت القيم الافتراضية بالقيم الحقيقية من Google و Facebook
- ✅ Redirect URIs في Google و Facebook تطابق `http://localhost:4066/api/auth/callback/google` و `http://localhost:4066/api/auth/callback/facebook`

### 4. إعادة تشغيل التطبيق

بعد تحديث المتغيرات، أعد تشغيل التطبيق:

```bash
npm run dev
```

## ملاحظات مهمة:

- استخدم `http://localhost:4066` في التطوير
- للإنتاج، غير الـ URLs إلى domain الموقع الفعلي
- احتفظ بالـ secrets في مكان آمن
- لا تشارك الـ credentials مع أحد

## اختبار التسجيل:

1. اذهب إلى `/signin`
2. انقر على "تسجيل الدخول باستخدام Google" أو Facebook
3. أكمل عملية التسجيل
4. ستتم إعادة التوجيه إلى الصفحة الرئيسية
