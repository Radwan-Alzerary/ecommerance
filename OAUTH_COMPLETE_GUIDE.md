# دليل إعداد OAuth الكامل - Google & Facebook

## ✅ التحديثات التي تمت

تم تحديث النظام ليشمل:

1. ✅ تصحيح `NEXTAUTH_URL` في `.env.local` إلى البورت الصحيح (4066)
2. ✅ تحسين NextAuth callbacks لحفظ بيانات المستخدم في السيرفر
3. ✅ تحسين معالجة الأخطاء في صفحة تسجيل الدخول
4. ✅ إضافة حفظ token في localStorage للاستخدام مع API
5. ✅ تحسين تجربة المستخدم مع رسائل الأخطاء الواضحة

## 📋 الخطوات المطلوبة لإكمال الإعداد

### المرحلة 1: إعداد Google OAuth

#### الخطوة 1: إنشاء مشروع Google Cloud
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. انقر على القائمة المنسدلة بجانب شعار Google Cloud
3. انقر على "New Project"
4. أدخل اسم المشروع (مثل: "My E-commerce App")
5. انقر على "Create"

#### الخطوة 2: تفعيل Google+ API
1. في القائمة الجانبية، اذهب إلى "APIs & Services" > "Library"
2. ابحث عن "Google+ API"
3. انقر عليها ثم "Enable"

#### الخطوة 3: إنشاء OAuth Credentials
1. في القائمة الجانبية، اذهب إلى "APIs & Services" > "Credentials"
2. انقر على "Create Credentials" > "OAuth client ID"
3. إذا طُلب منك، قم بإعداد OAuth consent screen أولاً:
   - اختر "External"
   - املأ اسم التطبيق والبريد الإلكتروني
   - أضف Scopes: `email`, `profile`
   - احفظ
4. عد إلى "Create Credentials" > "OAuth client ID"
5. اختر Application type: **Web application**
6. أدخل الاسم (مثل: "Web Client")
7. في **Authorized JavaScript origins**، أضف:
   ```
   http://localhost:4066
   ```
8. في **Authorized redirect URIs**، أضف:
   ```
   http://localhost:4066/api/auth/callback/google
   ```
9. انقر على "Create"
10. **احفظ** Client ID و Client Secret

### المرحلة 2: إعداد Facebook OAuth

#### الخطوة 1: إنشاء تطبيق Facebook
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. انقر على "My Apps" في الأعلى
3. انقر على "Create App"
4. اختر "Consumer" (للمستهلكين)
5. انقر على "Next"
6. املأ المعلومات:
   - App Name: اسم تطبيقك
   - App Contact Email: بريدك الإلكتروني
7. انقر على "Create App"

#### الخطوة 2: إضافة Facebook Login
1. في Dashboard التطبيق، ابحث عن "Facebook Login"
2. انقر على "Set Up"
3. اختر "Web"
4. أدخل Site URL: `http://localhost:4066`
5. انقر على "Save"
6. في القائمة الجانبية، اذهب إلى "Facebook Login" > "Settings"
7. في **Valid OAuth Redirect URIs**، أضف:
   ```
   http://localhost:4066/api/auth/callback/facebook
   ```
8. احفظ التغييرات

#### الخطوة 3: الحصول على App ID و App Secret
1. في القائمة الجانبية، اذهب إلى "Settings" > "Basic"
2. ستجد **App ID** (انسخه)
3. اضغط على "Show" بجانب **App Secret** (انسخه)
4. **ملاحظة:** احفظ هذه القيم في مكان آمن

#### الخطوة 4: نقل التطبيق إلى Live Mode
1. في أعلى الصفحة، ستجد مفتاح بجانب اسم التطبيق
2. قم بتبديله من "Development" إلى "Live"
3. **تحذير:** للاختبار، يمكنك البقاء في Development Mode وإضافة مستخدمي الاختبار

### المرحلة 3: تحديث ملف .env.local

1. افتح ملف `.env.local` في مجلد المشروع
2. استبدل القيم الافتراضية بالقيم الحقيقية:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:4066
NEXTAUTH_SECRET=rYgr+UTC9/tC/vUbcmH6mAlct/GIYU5cfLAL11ZCa1s=

# Google OAuth - ضع القيم من Google Cloud Console
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here

# Facebook OAuth - ضع القيم من Facebook Developers
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=your_actual_facebook_secret_here
```

### المرحلة 4: إعادة تشغيل التطبيق

بعد تحديث `.env.local`، يجب إعادة تشغيل التطبيق:

```bash
# أوقف السيرفر الحالي (Ctrl+C)
# ثم شغله من جديد
npm run dev
```

## 🧪 اختبار التكامل

### اختبار Google Login
1. اذهب إلى صفحة تسجيل الدخول: `http://localhost:4066/signin`
2. انقر على "الدخول بواسطة Google"
3. اختر حساب Google
4. اسمح بالأذونات المطلوبة
5. يجب أن يتم تحويلك إلى الصفحة الرئيسية

### اختبار Facebook Login
1. اذهب إلى صفحة تسجيل الدخول: `http://localhost:4066/signin`
2. انقر على "الدخول بواسطة Facebook"
3. أدخل بيانات حساب Facebook
4. اسمح بالأذونات المطلوبة
5. يجب أن يتم تحويلك إلى الصفحة الرئيسية

## ❌ حل المشاكل الشائعة

### مشكلة: "Invalid redirect_uri"
**الحل:**
- تأكد من أن Redirect URI في Google/Facebook يطابق تماماً:
  - Google: `http://localhost:4066/api/auth/callback/google`
  - Facebook: `http://localhost:4066/api/auth/callback/facebook`
- تأكد من عدم وجود `/` في النهاية
- تأكد من استخدام `http` وليس `https` للتطوير المحلي

### مشكلة: "Client ID not found"
**الحل:**
- تأكد من نسخ Client ID بشكل صحيح من Google Cloud Console
- تأكد من عدم وجود مسافات في البداية أو النهاية
- أعد تشغيل التطبيق بعد تحديث `.env.local`

### مشكلة: "App Not Setup"
**الحل:**
- في Facebook Developers، تأكد من إضافة "Facebook Login" product
- تأكد من إضافة Valid OAuth Redirect URI
- في Development Mode، أضف حسابك كـ Test User

### مشكلة: الزر لا يعمل
**الحل:**
1. افتح Console في المتصفح (F12)
2. ابحث عن رسائل الأخطاء
3. تأكد من تشغيل السيرفر على البورت الصحيح (4066)
4. تأكد من وجود متغيرات البيئة في `.env.local`

## 🔒 نصائح الأمان

1. **لا تشارك** ملف `.env.local` أو تضعه في Git
2. **لا تشارك** Client Secret أو App Secret مع أي شخص
3. استخدم secrets مختلفة للإنتاج والتطوير
4. قم بتحديث `NEXTAUTH_SECRET` بقيمة عشوائية قوية:
   ```bash
   openssl rand -base64 32
   ```

## 📝 ملاحظات إضافية

### للإنتاج (Production)
عند النشر على سيرفر حقيقي:

1. حدّث `NEXTAUTH_URL` إلى domain الحقيقي:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. أضف domain الجديد في Google OAuth:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

3. أضف domain الجديد في Facebook Login:
   - Valid OAuth Redirect URIs: `https://yourdomain.com/api/auth/callback/facebook`

4. انقل تطبيق Facebook إلى Live Mode

## ✅ Checklist النهائي

- [ ] تم إنشاء مشروع في Google Cloud Console
- [ ] تم الحصول على Google Client ID و Secret
- [ ] تم تحديث Google Redirect URIs
- [ ] تم إنشاء تطبيق في Facebook Developers
- [ ] تم الحصول على Facebook App ID و Secret
- [ ] تم تحديث Facebook Redirect URIs
- [ ] تم تحديث `.env.local` بالقيم الحقيقية
- [ ] تم إعادة تشغيل التطبيق
- [ ] تم اختبار Google Login بنجاح
- [ ] تم اختبار Facebook Login بنجاح

---

**إذا واجهت أي مشاكل، تحقق من:**
- Console logs في المتصفح (F12)
- Terminal logs حيث يعمل `npm run dev`
- أن جميع القيم في `.env.local` صحيحة
- أن البورت 4066 ليس محجوزاً من تطبيق آخر
