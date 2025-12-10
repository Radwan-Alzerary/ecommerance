// const fetch = require('node-fetch'); // Using native fetch in Node 18+

// Configuration
// Default to the production API if no environment variable is set
// Note: The API endpoints seem to be at the root (e.g. /online/...) not under /api
const BASE_URL = process.env.API_BASE_URL || 'https://oro-system.com';
const TIMEOUT = 5000; // 5 seconds timeout

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// List of endpoints to test
// Note: Some endpoints require /api prefix, others don't.
const endpoints = [
  { name: 'Store Settings (Public)', url: '/api/online/store-settings/public?lang=ar', method: 'GET' },
  { name: 'All Categories', url: '/online/category/getall', method: 'GET' },
  { name: 'All Products', url: '/online/food/getall', method: 'GET' },
  { name: 'New Arrivals', url: '/online/food/getNewArrivals', method: 'GET' },
  { name: 'Top Sellers', url: '/online/food/getTopSellers', method: 'GET' },
  { name: 'Hero Slides', url: '/online/hero-slides', method: 'GET' },
  { name: 'Custom Sections', url: '/online/custom/sections?includeInactive=false&populateProducts=true', method: 'GET' },
  // Add more endpoints as needed
];

async function testEndpoint(endpoint) {
  const fullUrl = `${BASE_URL}${endpoint.url}`;
  console.log(`${colors.cyan}Testing: ${endpoint.name}${colors.reset}`);
  console.log(`  URL: ${fullUrl}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(fullUrl, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const statusColor = response.ok ? colors.green : colors.red;
    console.log(`  Status: ${statusColor}${response.status} ${response.statusText}${colors.reset}`);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      
      // Check for success flag if present
      let success = true;
      if (data && typeof data === 'object') {
          if ('success' in data && !data.success) success = false;
      }

      const successColor = success ? colors.green : colors.red;
      console.log(`  Success Flag: ${successColor}${success}${colors.reset}`);
      
      // Log a snippet of data
      const dataStr = JSON.stringify(data).substring(0, 100) + '...';
      console.log(`  Data: ${dataStr}`);

      // Return data for dependent tests (e.g. getting an ID)
      return { success: true, data, status: response.status };

    } else {
      const text = await response.text();
      console.log(`  Response (Text): ${text.substring(0, 100)}...`);
      return { success: response.ok, status: response.status };
    }

  } catch (error) {
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    return { success: false, error };
  } finally {
    console.log('---------------------------------------------------');
  }
}

async function runTests() {
  console.log(`${colors.magenta}Starting API Health Check...${colors.reset}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('---------------------------------------------------');

  // 1. Run independent tests
  const results = {};
  for (const endpoint of endpoints) {
    results[endpoint.name] = await testEndpoint(endpoint);
  }

  // 2. Run dependent tests (e.g. get product details using an ID from All Products)
  if (results['All Products']?.success && Array.isArray(results['All Products'].data)) {
      const products = results['All Products'].data;
      if (products.length > 0) {
          const productId = products[0]._id || products[0].id;
          if (productId) {
              await testEndpoint({
                  name: `Product Details (ID: ${productId})`,
                  url: `/online/food/getOne/${productId}`,
                  method: 'GET'
              });
          }
      }
  } else if (results['All Products']?.success && results['All Products'].data?.data && Array.isArray(results['All Products'].data.data)) {
       // Handle wrapped data structure
       const products = results['All Products'].data.data;
       if (products.length > 0) {
           const productId = products[0]._id || products[0].id;
           if (productId) {
               await testEndpoint({
                   name: `Product Details (ID: ${productId})`,
                   url: `/online/food/getOne/${productId}`,
                   method: 'GET'
               });
           }
       }
  }

  console.log(`${colors.magenta}API Health Check Complete.${colors.reset}`);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.error(`${colors.red}Error: 'fetch' is not defined. Please use Node.js 18+ or install 'node-fetch'.${colors.reset}`);
    process.exit(1);
}

runTests();
