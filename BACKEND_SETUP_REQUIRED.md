# Backend Setup Required - Hero Slides API

## ❌ Current Status: API Endpoints Not Found

The frontend is ready but the backend API endpoints for hero slides are not yet available:

- ❌ `/online/hero-slides` → 404 Not Found
- ❌ `/api/hero-slides` → 404 Not Found

## ✅ Backend Code Review

Your backend routing code looks correct:

```javascript
// In your main router file
router.use("/online/hero-slides/", require("./onlineMarket/heroSlides"));
router.use("/api/hero-slides", require("./heroSlide.routes"));
```

## 🔧 Required Backend Actions

### 1. Verify Route Files Exist
Ensure these files exist and are properly implemented:
- `./onlineMarket/heroSlides.js` (for `/online/hero-slides/`)
- `./heroSlide.routes.js` (for `/api/hero-slides`)

### 2. Database Model Setup
Make sure your HeroSlide model is properly defined with these fields:
```javascript
const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  fallbackImage: { type: String },
  link: { type: String, required: true },
  buttonText: { type: String, required: true },
  theme: { 
    type: String, 
    enum: ['luxury', 'vibrant', 'futuristic'], 
    default: 'luxury' 
  },
  stats: {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  translations: {
    type: Map,
    of: {
      title: String,
      subtitle: String,
      description: String,
      buttonText: String
    }
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});
```

### 3. Sample Data Creation
Create some sample hero slides in your database:

```javascript
// Sample data to insert
const sampleSlides = [
  {
    title: "Welcome to Our Store",
    subtitle: "Discover amazing products",
    description: "Find everything you need in one place",
    image: "/uploads/hero-slides/slide1.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    link: "/products",
    buttonText: "Shop Now",
    theme: "luxury",
    stats: {
      label: "Products",
      value: "500+"
    },
    translations: {
      en: {
        title: "Welcome to Our Store",
        subtitle: "Discover amazing products",
        description: "Find everything you need in one place",
        buttonText: "Shop Now"
      },
      ar: {
        title: "مرحباً بكم في متجرنا",
        subtitle: "اكتشف منتجات مذهلة",
        description: "اعثر على كل ما تحتاجه في مكان واحد",
        buttonText: "تسوق الآن"
      }
    },
    isActive: true,
    sortOrder: 1
  }
];
```

### 4. Deploy Backend Changes
Make sure your backend server is restarted with the new routes.

## 🧪 Testing the Fix

After backend deployment, test these endpoints:

```bash
# Test online endpoint
curl https://alamalelectron.oro-system.com/online/hero-slides

# Test API endpoint  
curl https://alamalelectron.oro-system.com/api/hero-slides
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "subtitle": "...",
      // ... other fields
    }
  ]
}
```

## 🚀 Frontend Status

✅ Frontend is fully ready and waiting for backend endpoints
✅ Error handling implemented for missing APIs
✅ Graceful fallback and retry mechanisms
✅ Translation support ready
✅ All animations and UI components working

Once you fix the backend routes, the hero slides will work immediately! 🎉
