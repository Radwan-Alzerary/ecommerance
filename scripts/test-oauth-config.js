#!/usr/bin/env node

/**
 * OAuth Integration Test Script
 * اختبار بسيط للتحقق من أن إعدادات OAuth صحيحة
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 جاري فحص إعدادات OAuth...\n');

// قراءة ملف .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ خطأ: لا يمكن قراءة ملف .env.local');
  console.error('   تأكد من وجود الملف في المجلد الرئيسي للمشروع\n');
  process.exit(1);
}

// استخراج المتغيرات
const parseEnv = (content) => {
  const vars = {};
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return vars;
};

const env = parseEnv(envContent);

// فحص المتغيرات المطلوبة
const requiredVars = {
  'NEXTAUTH_URL': 'رابط NextAuth',
  'NEXTAUTH_SECRET': 'مفتاح NextAuth السري',
  'GOOGLE_CLIENT_ID': 'معرف عميل Google',
  'GOOGLE_CLIENT_SECRET': 'مفتاح Google السري',
  'FACEBOOK_CLIENT_ID': 'معرف تطبيق Facebook',
  'FACEBOOK_CLIENT_SECRET': 'مفتاح Facebook السري'
};

let allConfigured = true;
let warnings = [];

console.log('📋 نتائج الفحص:\n');

Object.keys(requiredVars).forEach(varName => {
  const value = env[varName];
  const description = requiredVars[varName];
  
  if (!value) {
    console.log(`❌ ${varName} - غير موجود`);
    allConfigured = false;
  } else if (value.includes('your-') || value.includes('your_')) {
    console.log(`⚠️  ${varName} - يحتوي على قيمة افتراضية`);
    console.log(`   القيمة الحالية: ${value.substring(0, 30)}...`);
    warnings.push(varName);
    allConfigured = false;
  } else {
    console.log(`✅ ${varName} - تم إعداده`);
    console.log(`   القيمة: ${value.substring(0, 20)}...`);
  }
  console.log();
});

// فحص NEXTAUTH_URL للتأكد من البورت الصحيح
if (env.NEXTAUTH_URL) {
  const url = env.NEXTAUTH_URL;
  if (url.includes(':4066')) {
    console.log('✅ NEXTAUTH_URL يستخدم البورت الصحيح (4066)\n');
  } else if (url.includes(':3000')) {
    console.log('⚠️  NEXTAUTH_URL يستخدم البورت 3000 بدلاً من 4066');
    console.log('   يرجى تغييره إلى: http://localhost:4066\n');
    warnings.push('NEXTAUTH_URL_PORT');
  } else {
    console.log('⚠️  NEXTAUTH_URL يستخدم بورت غير معروف');
    console.log('   تأكد من أنه يطابق بورت التطبيق (4066)\n');
  }
}

// ملخص النتائج
console.log('\n' + '='.repeat(50));
console.log('📊 الملخص:\n');

if (allConfigured && warnings.length === 0) {
  console.log('✅ جميع إعدادات OAuth تم تكوينها بشكل صحيح!');
  console.log('\n📝 الخطوات التالية:');
  console.log('1. تأكد من تشغيل التطبيق: npm run dev');
  console.log('2. اذهب إلى: http://localhost:4066/signin');
  console.log('3. جرّب تسجيل الدخول عبر Google أو Facebook');
} else {
  console.log('⚠️  يوجد بعض الإعدادات التي تحتاج إلى تحديث:\n');
  
  if (warnings.length > 0) {
    console.log('المتغيرات التي تحتاج إلى تحديث:');
    warnings.forEach(varName => {
      console.log(`  - ${varName}`);
    });
    console.log();
  }
  
  console.log('📖 للحصول على التعليمات الكاملة، راجع الملفات:');
  console.log('  - OAUTH_COMPLETE_GUIDE.md (دليل شامل)');
  console.log('  - OAUTH_SETUP.md (إعداد سريع)');
  console.log('  - SERVER_OAUTH_INTEGRATION.md (تكامل السيرفر)');
}

console.log('='.repeat(50) + '\n');

// فحص ملفات NextAuth
console.log('🔍 فحص ملفات NextAuth:\n');

const nextAuthRoutePath = path.join(__dirname, '..', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
if (fs.existsSync(nextAuthRoutePath)) {
  console.log('✅ ملف NextAuth route موجود');
  console.log(`   المسار: ${nextAuthRoutePath}\n`);
} else {
  console.log('❌ ملف NextAuth route غير موجود');
  console.log('   المتوقع: app/api/auth/[...nextauth]/route.ts\n');
}

// فحص ملف auth.ts
const authLibPath = path.join(__dirname, '..', 'lib', 'auth.ts');
if (fs.existsSync(authLibPath)) {
  console.log('✅ ملف lib/auth.ts موجود\n');
} else {
  console.log('❌ ملف lib/auth.ts غير موجود\n');
}

console.log('✨ انتهى الفحص!');
