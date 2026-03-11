# 🎨 Smart Canteen Frontend

React-based frontend for the Smart Canteen Order & Payment Verification System.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file (already created):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── student/
│   │   │   ├── ItemList.jsx           # Display food items
│   │   │   ├── ItemList.css
│   │   │   ├── OrderForm.jsx          # Shopping cart
│   │   │   ├── OrderForm.css
│   │   │   ├── OrderConfirm.jsx       # Order confirmation with QR
│   │   │   └── OrderConfirm.css
│   │   └── vendor/
│   │       ├── OrderVerify.jsx        # Order verification form
│   │       ├── OrderVerify.css
│   │       ├── VerifyResult.jsx       # Verification result
│   │       └── VerifyResult.css
│   ├── pages/
│   │   ├── StudentPage.jsx            # Student interface
│   │   ├── StudentPage.css
│   │   ├── VendorPage.jsx             # Vendor interface
│   │   └── VendorPage.css
│   ├── services/
│   │   └── api.js                     # Axios API calls
│   ├── App.jsx                        # Main app component
│   ├── App.css                        # Global styles
│   └── index.js                       # React entry point
├── .env                               # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🎯 Features

### Student Interface
- Browse food items by category
- Add items to cart with quantity controls
- View cart with real-time total calculation
- Place order with one click
- Simulate payment
- Receive Order ID and QR code
- Clear visual feedback

### Vendor Interface
- Enter Order ID manually
- Verify order status
- View order details and items
- Mark order as consumed
- Clear success/error messages
- QR scanner placeholder (ready for integration)

---

## 🔌 API Integration

All API calls are handled through `src/services/api.js`:

```javascript
import { getAllItems, createOrder, confirmPayment, verifyOrder } from './services/api';
```

### Available Functions

- `getAllItems()` - Fetch all available items
- `getItemById(itemId)` - Get single item details
- `createOrder(userId, items)` - Create new order
- `getOrderById(orderId)` - Get order details
- `verifyOrder(orderId)` - Verify and consume order
- `confirmPayment(orderId)` - Confirm payment and get QR
- `getPaymentByOrderId(orderId)` - Get payment details

---

## 🎨 Component Overview

### Student Components

#### ItemList
- Displays all available food items
- Category filtering (All, Snacks, Beverages, etc.)
- Add to cart functionality
- Quantity controls for items in cart
- Stock availability display
- Out of stock handling

#### OrderForm
- Shopping cart display
- Quantity adjustment
- Item removal
- Total calculation
- Place order button
- Empty cart state

#### OrderConfirm
- Success message
- Order ID display
- Payment reference
- QR code image
- Next steps instructions
- New order button

### Vendor Components

#### OrderVerify
- Order ID input form
- Instructions for vendors
- QR scanner placeholder
- Verify button
- Loading state

#### VerifyResult
- Success/failure icon
- Verification message
- Order details display
- Items list
- Status information
- Verify another button
- Troubleshooting tips

---

## 🎨 Styling

### Design System

**Colors:**
- Primary: `#667eea` (Purple)
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)
- Background: Linear gradient purple

**Typography:**
- Font: System fonts (Apple, Segoe UI, Roboto)
- Sizes: 14px - 32px

**Components:**
- Rounded corners (5px - 10px)
- Box shadows for depth
- Smooth transitions (0.3s)
- Hover effects
- Responsive design

### Responsive Breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

---

## 🔄 User Flows

### Student Flow

1. **Browse Items**
   - View all items or filter by category
   - See prices and stock availability

2. **Add to Cart**
   - Click "Add to Cart" or use +/- buttons
   - Cart updates in real-time

3. **Place Order**
   - Review cart and total
   - Click "Place Order"
   - Order created with status CREATED

4. **Payment**
   - Payment automatically simulated
   - Order status updated to PAID

5. **Get QR Code**
   - Receive Order ID
   - QR code generated
   - Instructions displayed

### Vendor Flow

1. **Enter Order ID**
   - Customer shows QR code
   - Vendor enters Order ID manually
   - (Or scans QR code - future feature)

2. **Verify Order**
   - Click "Verify Order"
   - System checks payment status
   - Validates order is PAID

3. **View Result**
   - Success: Order details shown
   - Order marked as CONSUMED
   - Stock automatically deducted
   - Failure: Error message with reason

4. **Complete**
   - Hand over order to customer
   - Click "Verify Another Order"

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (irreversible)
npm run eject
```

### Adding New Features

1. **New Component:**
   ```bash
   # Create component file
   touch src/components/MyComponent.jsx
   touch src/components/MyComponent.css
   ```

2. **New API Call:**
   ```javascript
   // Add to src/services/api.js
   export const myApiCall = async (params) => {
     const response = await api.post('/endpoint', params);
     return response.data;
   };
   ```

3. **New Page:**
   ```bash
   # Create page file
   touch src/pages/MyPage.jsx
   touch src/pages/MyPage.css
   
   # Add route in App.jsx
   <Route path="/mypage" element={<MyPage />} />
   ```

---

## 🐛 Troubleshooting

### API Connection Error

**Error:** `Network Error` or `CORS error`

**Solution:**
1. Check backend is running on port 5000
2. Verify `REACT_APP_API_URL` in `.env`
3. Check CORS configuration in backend

### Items Not Loading

**Error:** Items list is empty

**Solution:**
1. Check backend database has seed data
2. Verify API endpoint `/api/items` works
3. Check browser console for errors

### QR Code Not Displaying

**Error:** QR code shows broken image

**Solution:**
1. Check payment confirmation response
2. Verify `qr_code` field contains base64 data
3. Check browser console for errors

### Build Errors

**Error:** Module not found

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Dependencies

### Production
- `react` (^18.2.0) - UI library
- `react-dom` (^18.2.0) - React DOM rendering
- `react-router-dom` (^6.20.0) - Routing
- `axios` (^1.6.2) - HTTP client
- `react-scripts` (5.0.1) - Build tools

### Development
- ESLint configuration
- Browserslist configuration

---

## 🎯 Future Enhancements

### Phase 4 & 5 Features
- QR code scanning (react-qr-reader)
- Real-time order updates (WebSocket)
- Order history
- User authentication
- Payment gateway integration
- Analytics dashboard
- Push notifications

### UI Improvements
- Dark mode
- Animations
- Loading skeletons
- Toast notifications
- Image upload for items
- Search functionality
- Filters and sorting

---

## 🔐 Security Notes

**Current MVP:**
- No authentication
- Hardcoded user_id = 1
- All endpoints public

**For Production:**
- Add JWT authentication
- Secure API calls
- Input sanitization
- XSS prevention
- HTTPS only

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## ✅ Testing Checklist

- [ ] Items load correctly
- [ ] Category filter works
- [ ] Add to cart functionality
- [ ] Cart quantity controls
- [ ] Total calculation accurate
- [ ] Order placement successful
- [ ] QR code displays
- [ ] Vendor verification works
- [ ] Error messages display
- [ ] Responsive on mobile
- [ ] Navigation works
- [ ] Loading states show

---

## 📚 Resources

- React Docs: https://react.dev/
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- CSS Grid: https://css-tricks.com/snippets/css/complete-guide-grid/

---

**Phase 3 Complete!** Frontend is ready and integrated with backend.
