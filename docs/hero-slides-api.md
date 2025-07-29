# Hero Slides API Documentation

## Overview
This document describes the API endpoint structure needed for the Hero Section component to fetch dynamic hero slides from the database.

## API Endpoint
- **URL**: `/api/hero-slides`
- **Method**: `GET`
- **Authentication**: Optional (public endpoint)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Tech Innovation",
      "subtitle": "Experience the future with cutting-edge gadgets",
      "description": "Revolutionize your lifestyle with the latest technological marvels",
      "image": "/hero-slide-1.jpg",
      "fallbackImage": "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "link": "/categories/electronics",
      "buttonText": "Discover Tech",
      "theme": "futuristic",
      "stats": {
        "label": "Innovations",
        "value": "150+"
      },
      "isActive": true,
      "order": 1,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to fetch hero slides",
  "error": "Database connection error"
}
```

## Database Schema

### HeroSlide Model
```sql
CREATE TABLE hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  image VARCHAR(500) NOT NULL,
  fallback_image VARCHAR(500),
  link VARCHAR(500) NOT NULL,
  button_text VARCHAR(100) NOT NULL,
  theme ENUM('luxury', 'vibrant', 'futuristic') DEFAULT 'luxury',
  stats_label VARCHAR(100),
  stats_value VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Sample Data
```sql
INSERT INTO hero_slides (title, subtitle, description, image, fallback_image, link, button_text, theme, stats_label, stats_value, is_active, order_index) VALUES 
('Elevate Your Style', 'Discover curated collections that define the latest trends', 'Immerse yourself in a world of premium fashion and timeless elegance', '/hero-slide-1.jpg', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', '/products', 'Shop Now', 'luxury', 'Collections', '500+', true, 1),

('Summer Essentials', 'Get ready for the season with our hottest picks', 'From beach vibes to city strolls, find your perfect summer companion', '/hero-slide-2.jpg', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', '/categories/summer', 'Explore Summer', 'vibrant', 'New Arrivals', '200+', true, 2),

('Tech Innovation', 'Experience the future with cutting-edge gadgets', 'Revolutionize your lifestyle with the latest technological marvels', '/hero-slide-3.jpg', 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', '/categories/electronics', 'Discover Tech', 'futuristic', 'Innovations', '150+', true, 3);
```

## Backend Implementation Example

### Node.js/Express Example
```javascript
app.get('/api/hero-slides', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero slides',
      error: error.message
    });
  }
});
```

### Features Supported
1. **Dynamic Content**: All slide content can be managed from the database
2. **Image Management**: Support for primary and fallback images
3. **Theming**: Different visual themes (luxury, vibrant, futuristic)
4. **Statistics**: Dynamic stats display for each slide
5. **Active/Inactive**: Toggle slides on/off without deletion
6. **Ordering**: Control the display order of slides
7. **Fallback**: Component includes fallback data if API fails

## Frontend Integration
The HeroSection component now:
- Fetches slides on component mount
- Shows loading state while fetching
- Falls back to default slides if API fails
- Displays error message if no slides are available
- Maintains all existing animations and functionality

## Admin Panel Considerations
Consider creating an admin interface to:
- Add/Edit/Delete hero slides
- Upload and manage images
- Set slide order and activation status
- Preview slides before publishing
- Manage different themes and styling options
