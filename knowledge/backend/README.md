# Food Ordering App - Backend API

Complete Node.js backend for a food ordering application with AI health assistant, real-time tracking, and ingredient allergy management.

## Features

✅ **User Management**
- Registration/Login with JWT authentication
- Role-based access (customer, restaurant, delivery_agent)
- Address management with geolocation
- Allergy profile & dietary restrictions

✅ **Restaurant Management**
- Restaurant CRUD with location coordinates
- Menu items with ingredients tracking
- Ingredient management with allergen tagging
- Rating & review system

✅ **Order Management**
- Complete order lifecycle (pending → delivered)
- Cart operations with ingredient exclusions
- Order status tracking in real-time
- Estimated delivery time calculation

✅ **Payment Processing**
- Razorpay integration for online payments
- Cash payment option
- Payment verification with signature validation
- Refund handling

✅ **Real-time Features**
- Socket.io for live order tracking
- Live delivery agent location updates
- Real-time order status notifications
- Push notifications via Firebase

✅ **AI Health Assistant**
- Groq API (Llama 3) integration
- Health-based menu recommendations
- Voice input support (prepared for frontend)
- Allergy-aware suggestions

✅ **Notifications**
- SMS via Fast2SMS (OTP, order updates)
- Email via Resend (confirmations, deliveries)
- Push notifications via Firebase
- In-app notifications

✅ **Geolocation**
- OpenStreetMap (Nominatim) for address geocoding
- OSRM for distance/routing calculations
- Nearby restaurant discovery
- ETA estimation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **Real-time**: Socket.io 4.7
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Payments**: Razorpay
- **AI**: Groq API (Llama 3)
- **Maps**: OpenStreetMap/OSRM
- **SMS**: Fast2SMS
- **Email**: Resend
- **Push**: Firebase Cloud Messaging
- **Containerization**: Docker & Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── server.js                 # Main Express app + Socket.io setup
│   ├── controllers/              # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── restaurant.controller.js
│   │   ├── menu.controller.js
│   │   ├── ingredient.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── tracking.controller.js
│   │   ├── ai.controller.js
│   │   └── review.controller.js
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── menu.routes.js
│   │   ├── ingredient.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── tracking.routes.js
│   │   ├── ai.routes.js
│   │   └── review.routes.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.js    # JWT + role checks
│   │   ├── errorHandler.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validateRequest.middleware.js
│   ├── services/                 # External API integrations
│   │   ├── sms.service.js        # Fast2SMS
│   │   ├── email.service.js      # Resend
│   │   ├── ai.service.js         # Groq API
│   │   ├── payment.service.js    # Razorpay
│   │   ├── maps.service.js       # OpenStreetMap
│   │   └── notification.service.js # Firebase
│   ├── utils/
│   │   ├── helpers.js            # Utility functions
│   │   ├── jwt.handler.js        # Token generation
│   │   ├── logger.js             # File-based logging
│   │   └── validators.js         # Joi validation schemas
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Database seeding (optional)
├── logs/
│   ├── app.log                   # Application logs
│   └── error.log                 # Error logs
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git

### 2. Environment Setup

```bash
# Clone or navigate to project
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required keys:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET & JWT_REFRESH_SECRET
# - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
# - FAST2SMS_API_KEY
# - RESEND_API_KEY
# - GROQ_API_KEY
# - FIREBASE_CONFIG (JSON string)
```

### 3. Installation

```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server

```bash
# Start with auto-reload
npm run dev

# Server runs on http://localhost:3000
```

### 5. Docker Setup (Recommended for Production)

```bash
# Start all services (PostgreSQL, Redis, API)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout (protected)

### Users
- `GET /api/users/profile` - Get profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users/addresses` - List addresses (protected)
- `POST /api/users/addresses` - Add address (protected)
- `PUT /api/users/addresses/:id` - Update address (protected)
- `DELETE /api/users/addresses/:id` - Delete address (protected)
- `GET /api/users/allergies` - Get allergy profile (protected)
- `PUT /api/users/allergies` - Update allergies (protected)

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/nearby` - Find nearby restaurants
- `GET /api/restaurants/search` - Search restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (protected, restaurant role)
- `PUT /api/restaurants/:id` - Update restaurant (protected, owner only)
- `GET /api/restaurants/:id/stats` - Get restaurant stats (protected, owner)

### Menu Items
- `GET /api/menu/restaurant/:restaurantId` - Get menu
- `GET /api/menu/restaurant/:restaurantId/categories` - Get categories
- `GET /api/menu/:id` - Get item details
- `POST /api/menu` - Create item (protected, restaurant)
- `PUT /api/menu/:id` - Update item (protected, owner)
- `DELETE /api/menu/:id` - Delete item (protected, owner)

### Ingredients
- `GET /api/ingredients/allergens` - Get allergen types
- `GET /api/ingredients/restaurant/:restaurantId` - List ingredients
- `POST /api/ingredients` - Create ingredient (protected, restaurant)
- `PUT /api/ingredients/:id` - Update ingredient (protected, owner)
- `DELETE /api/ingredients/:id` - Delete ingredient (protected, owner)

### Cart
- `GET /api/cart` - Get cart (protected)
- `POST /api/cart/items` - Add to cart (protected)
- `PUT /api/cart/items/:itemId` - Update cart item (protected)
- `DELETE /api/cart/items/:itemId` - Remove from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)
- `POST /api/cart/items/:itemId/exclusions` - Add exclusions (protected)
- `DELETE /api/cart/items/:itemId/exclusions/:ingredientId` - Remove exclusion (protected)

### Orders
- `POST /api/orders` - Create order (protected, customer)
- `GET /api/orders` - List customer orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `PUT /api/orders/:id/cancel` - Cancel order (protected, customer)
- `GET /api/orders/restaurant/orders` - Restaurant orders (protected, restaurant)
- `PUT /api/orders/restaurant/orders/:id/status` - Update status (protected, restaurant)
- `GET /api/orders/agent/orders` - Delivery agent orders (protected, agent)

### Payments
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/initiate/:orderId` - Initiate payment (protected)
- `POST /api/payments/verify` - Verify payment signature (protected)
- `GET /api/payments/:orderId` - Get payment status (protected)

### Tracking
- `GET /api/tracking/:orderId` - Get order tracking (protected)
- `GET /api/tracking/:orderId/status` - Get delivery status (protected)
- `GET /api/tracking/:orderId/eta` - Get ETA (protected)
- `PUT /api/tracking/:orderId/location` - Update delivery location (protected, agent)

### AI Assistant
- `POST /api/ai/conversation/start` - Start conversation (protected)
- `POST /api/ai/conversation/message` - Send message (protected)
- `GET /api/ai/conversation/:conversationId` - Get history (protected)
- `GET /api/ai/conversation/:conversationId/recommendations` - Get recommendations (protected)
- `POST /api/ai/voice-input` - Process voice (protected)

### Reviews
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
- `POST /api/reviews/:orderId` - Create review (protected)
- `GET /api/reviews/:orderId` - Get order review (protected)
- `PUT /api/reviews/:reviewId` - Update review (protected, owner)
- `DELETE /api/reviews/:reviewId` - Delete review (protected, owner)

## Socket.io Events

### Client → Server
- `join-order` - Join order tracking room
- `leave-order` - Leave order tracking room
- `delivery-location-update` - Agent sends location

### Server → Client
- `order-status-changed` - Order status update
- `delivery-location` - Agent location update
- `delivery-eta` - Updated ETA
- `order-ready` - Order ready for pickup

## Database Schema Highlights

### Key Tables
- `users` - User accounts (customer, restaurant, delivery_agent)
- `addresses` - User addresses with geolocation
- `allergy_profiles` - Dietary restrictions & health info
- `restaurants` - Restaurant listings with ratings
- `menu_items` - Menu items with pricing & availability
- `ingredients` - Ingredients with allergen tagging
- `menu_item_ingredients` - Menu-ingredient relationships
- `orders` - Order records with status tracking
- `order_items` - Line items in orders
- `order_item_exclusions` - Ingredient exclusions per order
- `cart_items` - Shopping cart items
- `cart_item_exclusions` - Excluded ingredients in cart
- `payments` - Payment records with Razorpay IDs
- `tracking` - Real-time delivery tracking
- `ai_conversations` - AI assistant chat history
- `ai_recommendations` - AI-generated menu recommendations
- `reviews` - Restaurant ratings & reviews

## Error Handling

Comprehensive error handling includes:
- Joi validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409) - e.g., duplicate email
- Prisma errors (P2002, P2025, etc.)
- Global error middleware

## Logging

All requests and errors logged to:
- `/logs/app.log` - Application logs
- `/logs/error.log` - Error logs

Structured logging with timestamps and severity levels.

## Security Features

✅ **Authentication**
- JWT with access + refresh tokens
- Password hashing with bcrypt
- Role-based access control

✅ **Protection**
- CORS enabled
- Helmet for HTTP headers
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Input validation with Joi
- SQL injection prevention (Prisma parameterized queries)

## Testing

```bash
# Run tests
npm test

# Coverage report
npm run test:coverage
```

## Performance Tips

1. **Database**: Enable PostGIS for geospatial queries
2. **Caching**: Use Redis for frequently accessed data
3. **Pagination**: Always paginate list endpoints
4. **Indexes**: Create indexes on frequently queried fields
5. **Connection Pooling**: Use Prisma connection pooling

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update all API keys in `.env`
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring & alerting
- [ ] Enable request logging
- [ ] Review security headers
- [ ] Test payment flow end-to-end
- [ ] Set up email templates
- [ ] Configure Firebase properly
- [ ] Load test with expected traffic

## Next Steps

### Frontend Integration
See `FOOD_ORDERING_APP_COMPLETE_ARCHITECTURE.md` for React Native frontend setup with:
- Redux Toolkit state management
- Socket.io real-time updates
- Expo Speech for voice input
- Reanimated v3 animations

### Optional Enhancements
- [ ] WebSocket-based notifications
- [ ] Payment method tokenization
- [ ] Multi-language support
- [ ] Analytics tracking
- [ ] Admin dashboard
- [ ] Commission management (restaurant % cuts)
- [ ] Loyalty/rewards program
- [ ] Advanced scheduling (future orders)

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
psql -U postgres -d foodorder_db -c "SELECT 1"

# Reset database
npx prisma migrate reset
```

### Redis Connection Issues
```bash
# Test Redis
redis-cli ping
```

### Env Variable Issues
```bash
# Verify .env is loaded
node -e "console.log(process.env.DATABASE_URL)"
```

## Support & Documentation

- **Prisma**: https://www.prisma.io/docs
- **Express**: https://expressjs.com
- **Socket.io**: https://socket.io/docs
- **Razorpay**: https://razorpay.com/docs
- **Firebase**: https://firebase.google.com/docs

## License

MIT

---

**Built with ❤️ for seamless food delivery**
