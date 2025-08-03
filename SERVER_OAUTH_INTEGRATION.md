# تحديث السيرفر لدعم OAuth (Google & Facebook)

## 1. تحديث Customer Model

```javascript
// models/Customer.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    unique: true, 
    sparse: true // يسمح بقيم null متعددة
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true // يسمح بقيم null متعددة
  },
  password: { 
    type: String // اختياري للـ OAuth users
  },
  
  // OAuth Fields
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  facebookId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  picture: { type: String }, // صورة المستخدم من OAuth
  authProvider: { 
    type: String, 
    enum: ['local', 'google', 'facebook'], 
    default: 'local' 
  },
  isEmailVerified: { type: Boolean, default: false },
  
  // الحقول الموجودة
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook للتشفير (فقط للـ local auth)
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// JWT token generation
customerSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      _id: this._id, 
      phoneNumber: this.phoneNumber,
      email: this.email,
      authProvider: this.authProvider
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('Customer', customerSchema);
```

## 2. تحديث routes/auth.js

```javascript
// routes/auth.js - إضافة هذه المسارات

// OAuth Social Login - Google
router.post("/oauth/google", async (req, res) => {
  try {
    const Customer = req.getModel('Customer');
    const { googleId, email, name, picture } = req.body;

    // البحث عن المستخدم بـ Google ID أو البريد الإلكتروني
    let customer = await Customer.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ],
      $or: [
        { deleted: false },
        { deleted: { $exists: false } }
      ]
    });

    if (customer) {
      // تحديث بيانات Google إذا لم تكن موجودة
      if (!customer.googleId) {
        customer.googleId = googleId;
        customer.picture = picture;
        customer.authProvider = 'google';
        await customer.save();
      }
    } else {
      // إنشاء حساب جديد للمستخدم
      customer = new Customer({
        name: name,
        email: email,
        googleId: googleId,
        picture: picture,
        phoneNumber: null,
        authProvider: 'google',
        isEmailVerified: true
      });
      await customer.save();
    }

    // توليد JWT
    const token = customer.generateAuthToken();

    return res.json({
      success: true,
      message: "Google login successful",
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        picture: customer.picture,
        authProvider: customer.authProvider
      },
      token
    });

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during Google authentication" 
    });
  }
});

// OAuth Social Login - Facebook
router.post("/oauth/facebook", async (req, res) => {
  try {
    const Customer = req.getModel('Customer');
    const { facebookId, email, name, picture } = req.body;

    // البحث عن المستخدم بـ Facebook ID أو البريد الإلكتروني
    let customer = await Customer.findOne({ 
      $or: [
        { facebookId: facebookId },
        { email: email }
      ],
      $or: [
        { deleted: false },
        { deleted: { $exists: false } }
      ]
    });

    if (customer) {
      // تحديث بيانات Facebook إذا لم تكن موجودة
      if (!customer.facebookId) {
        customer.facebookId = facebookId;
        customer.picture = picture;
        customer.authProvider = 'facebook';
        await customer.save();
      }
    } else {
      // إنشاء حساب جديد للمستخدم
      customer = new Customer({
        name: name,
        email: email,
        facebookId: facebookId,
        picture: picture,
        phoneNumber: null,
        authProvider: 'facebook',
        isEmailVerified: true
      });
      await customer.save();
    }

    // توليد JWT
    const token = customer.generateAuthToken();

    return res.json({
      success: true,
      message: "Facebook login successful",
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        picture: customer.picture,
        authProvider: customer.authProvider
      },
      token
    });

  } catch (error) {
    console.error('Facebook OAuth Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during Facebook authentication" 
    });
  }
});

// تحديث مسار /login الموجود ليدعم البريد الإلكتروني أيضاً
router.post("/login", async (req, res) => {
  try {
    const Customer = req.getModel('Customer');
    const { identifier, password } = req.body; // identifier يمكن أن يكون phoneNumber أو email

    // البحث بالهاتف أو البريد الإلكتروني
    const customer = await Customer.findOne({ 
      $or: [
        { phoneNumber: identifier },
        { email: identifier }
      ],
      $or: [
        { deleted: false },
        { deleted: { $exists: false } }
      ]
    });

    if (!customer) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // للمستخدمين الذين سجلوا عبر OAuth، يجب أن يستخدموا OAuth
    if (customer.authProvider !== 'local' && !customer.password) {
      return res.status(400).json({ 
        success: false,
        message: \`Please sign in using \${customer.authProvider}\`
      });
    }

    // مقارنة كلمة المرور
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // توليد JWT
    const token = customer.generateAuthToken();

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: customer._id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        picture: customer.picture,
        authProvider: customer.authProvider
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});
```

## 3. كيف سيعمل النظام:

### المسار الكامل لتسجيل الدخول:

#### **Google/Facebook Login:**
1. المستخدم ينقر على "تسجيل الدخول بـ Google"
2. NextAuth.js يتعامل مع OAuth flow
3. بعد النجاح، البيانات تُرسل للسيرفر Node.js
4. السيرفر يحفظ/يحدث بيانات المستخدم
5. السيرفر يُرجع JWT token
6. التطبيق يحفظ الـ token في localStorage
7. جميع API calls تستخدم هذا الـ token

#### **Email/Password Login:**
1. المستخدم يدخل البريد/الهاتف وكلمة المرور
2. البيانات تُرسل مباشرة للسيرفر Node.js
3. السيرفر يتحقق من البيانات
4. السيرفر يُرجع JWT token
5. التطبيق يحفظ الـ token

### **مزايا هذا النظام:**
- ✅ **وحدة البيانات**: جميع المستخدمين في نفس قاعدة البيانات
- ✅ **JWT موحد**: نفس نظام المصادقة للجميع
- ✅ **مرونة**: يمكن للمستخدم ربط حسابات متعددة
- ✅ **الأمان**: NextAuth.js + JWT tokens
- ✅ **التوافق**: يعمل مع النظام الموجود

## 4. ملاحظات مهمة:

1. **إضافة متغيرات البيئة للسيرفر:**
```env
JWT_SECRET=your-jwt-secret-key
```

2. **تحديث واجهة المستخدم:**
   - عرض صورة المستخدم من OAuth
   - عرض provider المستخدم (Google/Facebook/Local)

3. **التعامل مع ربط الحسابات:**
   - يمكن للمستخدم ربط Google بحساب موجود
   - نفس البريد الإلكتروني = نفس الحساب

هذا النظام سيعطيك أفضل ما في العالمين! 🚀
