## 2. PROJECT_WORKFLOW.md

````markdown
# ServeSync Project Workflow Guide

This document provides a comprehensive overview of how the ServeSync food delivery platform works, from user interactions to backend integration.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Flows](#user-flows)
3. [Authentication System](#authentication-system)
4. [Order Processing Flow](#order-processing-flow)
5. [Real-time Communication](#real-time-communication)
6. [Payment Processing](#payment-processing)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)

---

## System Architecture

### High-Level Overview

┌─────────────────────────────────────────────────────────────┐ │ ServeSync Client │ │ (Next.js 16 + React 19) │ ├─────────────────────────────────────────────────────────────┤ │ │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │ │ Customer │ │ Restaurant │ │ Driver │ │ │ │ App │ │ Dashboard │ │ Portal │ │ │ └──────────────┘ └──────────────┘ └──────────────┘ │ │ │ │ ┌──────────────┐ ┌──────────────┐ │ │ │ Admin │ │ Kitchen │ │ │ │ Dashboard │ │ Staff │ │ │ └──────────────┘ └──────────────┘ │ │ │ ├─────────────────────────────────────────────────────────────┤ │ Integration Layer │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │ │ React Query │ │ Zustand │ │ Socket.IO │ │ │ │ (Server) │ │ (Client) │ │ (Real-time) │ │ │ └──────────────┘ └──────────────┘ └──────────────┘ │ ├─────────────────────────────────────────────────────────────┤ │ External Services │ │ ┌──────────────┐ ┌──────────────┐ │ │ │ Backend │ │ Stripe │ │ │ │ API │ │ Payments │ │ │ └──────────────┘ └──────────────┘ │ └─────────────────────────────────────────────────────────────┘

### Technology Stack

**Frontend**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

**State Management**

- TanStack Query (server state)
- Zustand (client state)

**Communication**

- Axios (HTTP)
- Socket.IO (WebSocket)

**Payments**

- Stripe

---

## User Flows

### 1. Customer Journey

```mermaid
graph TD
    A[Visit Homepage] --> B{Authenticated?}
    B -->|No| C[Browse Restaurants]
    B -->|Yes| C
    C --> D[Select Restaurant]
    D --> E[Browse Menu]
    E --> F[Add Items to Cart]
    F --> G[Review Cart]
    G --> H[Proceed to Checkout]
    H --> I[Enter Delivery Info]
    I --> J[Apply Promo Code]
    J --> K[Enter Payment]
    K --> L[Place Order]
    L --> M[Track Order]
    M --> N[Receive Order]
    N --> O[Rate & Review]
Key Pages:

/ - Homepage with restaurant listings
/restaurants/[id] - Restaurant menu page
/checkout - Checkout flow
/orders - Order history
/orders/[id] - Order tracking
2. Restaurant Owner Journey
graph TD
    A[Login] --> B[Dashboard]
    B --> C{Action?}
    C -->|Manage Menu| D[Menu Management]
    C -->|View Orders| E[Order Management]
    C -->|Analytics| F[View Analytics]
    C -->|Promotions| G[Manage Promotions]
    D --> H[Add/Edit/Delete Items]
    E --> I[Update Order Status]
    F --> J[View Reports]
    G --> K[Create Promo Codes]
Key Pages:

/dashboard - Main dashboard
/dashboard/menu - Menu management
/dashboard/orders - Order management
/dashboard/kitchen - Kitchen view
/dashboard/analytics - Analytics
/dashboard/promotions - Promotions
3. Driver Journey
graph TD
    A[Login] --> B[Driver Portal]
    B --> C{Action?}
    C -->|View Available| D[Available Orders]
    C -->|Active Orders| E[Active Deliveries]
    C -->|Earnings| F[View Earnings]
    D --> G[Accept Order]
    G --> H[Pick Up Food]
    H --> I[Deliver to Customer]
    I --> J[Complete Delivery]
    J --> K[Update Earnings]
Key Pages:

/driver-portal - Driver dashboard
/driver-portal/available-orders - Available deliveries
/driver-portal/active-orders - Active deliveries
/driver-portal/earnings - Earnings tracking
4. Admin Journey
graph TD
    A[Login] --> B[Admin Dashboard]
    B --> C{Manage?}
    C -->|Restaurants| D[Restaurant Management]
    C -->|Drivers| E[Driver Management]
    C -->|Orders| F[Order Oversight]
    C -->|Revenue| G[Revenue Analytics]
    C -->|Performance| H[Driver Performance]
Key Pages:

/admin - Admin dashboard
/admin/restaurants - Restaurant management
/admin/drivers - Driver management
/admin/orders - Order oversight
/admin/revenue - Revenue tracking
/admin/drivers-performance - Performance metrics
Authentication System
Login Flow
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth Service
    participant B as Backend API
    participant S as Auth Store

    U->>C: Enter credentials
    C->>A: login(email, password)
    A->>B: POST /auth/login
    B->>A: {user, token, refreshToken}
    A->>S: setAuth(user, token, refreshToken)
    S->>S: Store in localStorage
    A->>C: Return user data
    C->>C: Redirect based on role

    alt Admin
        C->>U: Redirect to /admin
    else Restaurant Owner
        C->>U: Redirect to /dashboard
    else Driver
        C->>U: Redirect to /driver-portal
    else Customer
        C->>U: Redirect to /
    end
Role-Based Routing
After successful login, users are redirected based on their role:

// Login handler
const handleLogin = (response) => {
  switch (response.user.role) {
    case "ADMIN":
      router.push("/admin");
      break;
    case "RESTAURANT_OWNER":
      router.push("/dashboard");
      break;
    case "KITCHEN_STAFF":
      router.push("/dashboard/kitchen");
      break;
    case "DRIVER":
      router.push("/driver-portal");
      break;
    case "CUSTOMER":
    default:
      router.push("/");
      break;
  }
};
Token Management
Access Token: Stored in Zustand store, sent with every API request
Refresh Token: Used to obtain new access tokens
Token Refresh: Automatic refresh before expiration
Logout: Clears all tokens and cached data
Order Processing Flow
Complete Order Lifecycle
sequenceDiagram
    participant C as Customer
    participant UI as Client UI
    participant API as Backend API
    participant R as Restaurant
    participant K as Kitchen
    participant D as Driver
    participant WS as WebSocket

    C->>UI: Place Order
    UI->>API: POST /orders
    API->>API: Create Order
    API->>WS: Broadcast "new_order"
    WS->>R: Notify Restaurant
    WS->>K: Notify Kitchen

    R->>API: Accept Order
    API->>WS: Broadcast "order_accepted"
    WS->>C: Update Status

    K->>API: Start Preparation
    API->>WS: Broadcast "preparing"
    WS->>C: Update Status

    K->>API: Ready for Pickup
    API->>WS: Broadcast "ready"
    WS->>D: Notify Available Drivers

    D->>API: Accept Delivery
    API->>WS: Broadcast "driver_assigned"
    WS->>C: Update with Driver Info

    D->>API: Picked Up
    API->>WS: Broadcast "picked_up"
    WS->>C: Update Status

    D->>API: Delivered
    API->>WS: Broadcast "delivered"
    WS->>C: Update Status

    C->>UI: Rate Order
    UI->>API: POST /orders/:id/rating
Order States
PENDING - Order placed, awaiting restaurant confirmation
CONFIRMED - Restaurant accepted the order
PREPARING - Kitchen is preparing the food
READY - Food is ready for pickup
DRIVER_ASSIGNED - Driver accepted the delivery
PICKED_UP - Driver picked up the food
IN_TRANSIT - Driver is delivering
DELIVERED - Order delivered to customer
CANCELLED - Order was cancelled
COMPLETED - Order completed and rated
Real-time Communication
WebSocket Events
The application uses Socket.IO for real-time updates:

// WebSocket Event Types
interface WebSocketEvents {
  // Order Events
  'order:new': (order: Order) => void;
  'order:status_changed': (update: OrderUpdate) => void;
  'order:assigned': (assignment: DriverAssignment) => void;

  // Driver Events
  'driver:location_update': (location: DriverLocation) => void;
  'driver:status_changed': (status: DriverStatus) => void;

  // Notification Events
  'notification:new': (notification: Notification) => void;

  // Kitchen Events
  'kitchen:order_ready': (orderId: string) => void;
}
Connection Management
// WebSocket connection lifecycle
1. Connect on app load (if authenticated)
2. Subscribe to user-specific channels
3. Handle reconnection automatically
4. Clean up on logout
Real-time Features
Order Tracking: Live order status updates
Driver Location: Real-time driver position on map
Notifications: Instant push notifications
Kitchen Updates: Live order queue for kitchen staff
Admin Monitoring: Real-time platform metrics
Payment Processing
Stripe Integration Flow
sequenceDiagram
    participant C as Customer
    participant UI as Client
    participant Stripe as Stripe.js
    participant API as Backend
    participant SP as Stripe API

    C->>UI: Enter Payment Info
    UI->>API: POST /payments/initiate
    API->>SP: Create PaymentIntent
    SP->>API: Return clientSecret
    API->>UI: Return clientSecret

    UI->>Stripe: confirmCardPayment(clientSecret)
    Stripe->>SP: Process Payment
    SP->>Stripe: Payment Result
    Stripe->>UI: Payment Success/Failure

    alt Success
        UI->>API: POST /payments/confirm
        API->>API: Update Order Status
        API->>UI: Confirmation
        UI->>C: Show Success
    else Failure
        UI->>C: Show Error
    end
Payment Security
PCI Compliance: Stripe handles card data
No Card Storage: Cards never touch our servers
3D Secure: Supported for additional security
Webhook Verification: Secure payment confirmations
State Management
Architecture
┌─────────────────────────────────────────┐
│         Application State                │
├─────────────────────────────────────────┤
│                                           │
│  ┌─────────────────┐  ┌───────────────┐ │
│  │  Server State   │  │ Client State  │ │
│  │  (React Query)  │  │   (Zustand)   │ │
│  ├─────────────────┤  ├───────────────┤ │
│  │ • Orders        │  │ • Auth        │ │
│  │ • Restaurants   │  │ • Cart        │ │
│  │ • Menu Items    │  │ • UI State    │ │
│  │ • User Profile  │  │ • WebSocket   │ │
│  │ • Analytics     │  │               │ │
│  └─────────────────┘  └───────────────┘ │
│                                           │
└─────────────────────────────────────────┘
React Query (Server State)
// Query keys organization
const queryKeys = {
  auth: {
    profile: ['auth', 'profile'],
  },
  restaurants: {
    all: ['restaurants'],
    detail: (id: string) => ['restaurants', id],
    menu: (id: string) => ['restaurants', id, 'menu'],
  },
  orders: {
    all: ['orders'],
    detail: (id: string) => ['orders', id],
    history: ['orders', 'history'],
  },
};

// Caching strategy
- Stale time: 5 minutes for most data
- Cache time: 10 minutes
- Automatic refetch on window focus
- Optimistic updates for mutations
Zustand (Client State)
// Store organization
- authStore: User authentication state
- cartStore: Shopping cart state
- uiStore: UI preferences and state
- websocketStore: WebSocket connection state
API Integration
Service Layer Architecture
lib/api/
├── services/           # API service implementations
│   ├── auth.service.ts
│   ├── restaurant.service.ts
│   ├── order.service.ts
│   ├── customer.service.ts
│   ├── driver.service.ts
│   └── admin.service.ts
└── types/             # TypeScript type definitions
    ├── auth.types.ts
    ├── restaurant.types.ts
    ├── order.types.ts
    ├── customer.types.ts
    ├── driver.types.ts
    └── admin.types.ts
API Request Flow
graph LR
    A[Component] --> B[React Query Hook]
    B --> C[API Service]
    C --> D[Axios Instance]
    D --> E[Interceptors]
    E --> F[Backend API]
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A
Request Interceptors
// Axios interceptors handle:
1. Adding authentication tokens
2. Request/response logging
3. Error transformation
4. Token refresh on 401
5. Network error handling
Error Handling
// Error hierarchy
APIError
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ValidationError (400)
├── ServerError (500)
└── NetworkError (network issues)
Error Handling
Error Boundary Strategy
App Level
└── Global Error Boundary
    ├── Route Error Boundaries
    │   ├── Dashboard Error Boundary
    │   ├── Admin Error Boundary
    │   └── Driver Portal Error Boundary
    └── Component Error Boundaries
        ├── Form Error Boundaries
        ├── List Error Boundaries
        └── Modal Error Boundaries
Error Recovery
// Error recovery strategies
1. Retry failed requests (with exponential backoff)
2. Fallback UI for non-critical errors
3. Offline mode for network errors
4. User-friendly error messages
5. Error logging for debugging
Testing Strategy
Test Pyramid
        ┌─────────────┐
        │     E2E     │  (Planned)
        └─────────────┘
      ┌─────────────────┐
      │  Integration    │  (Implemented)
      └─────────────────┘
    ┌─────────────────────┐
    │    Unit Tests       │  (Implemented)
    └─────────────────────┘
Test Coverage
Unit Tests

Utility functions
Custom hooks
State stores
API services
Integration Tests

User flows (customer, restaurant, driver, admin)
API integration
WebSocket features
Error scenarios
Component Tests

UI components
Form validation
User interactions
Running Tests
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run once (CI)
npm run test:run
Development Workflow
1. Local Development
# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Lint code
npm run lint
2. Feature Development
1. Create feature branch
2. Implement feature
3. Write tests
4. Update documentation
5. Create pull request
6. Code review
7. Merge to main
3. Deployment
1. Run tests: npm run test:run
2. Build: npm run build
3. Deploy to staging
4. QA testing
5. Deploy to production
Performance Optimization
Code Splitting
// Dynamic imports for route-based splitting
const AdminDashboard = dynamic(() => import('./admin/page'));
const DriverPortal = dynamic(() => import('./driver-portal/page'));

// Component-level splitting
const LazyPaymentForm = dynamic(() => import('./PaymentForm'));
Caching Strategy
// React Query caching
- Restaurant list: 5 minutes
- Menu items: 5 minutes
- User profile: 5 minutes
- Order history: 1 minute
- Active orders: 30 seconds (with real-time updates)
Image Optimization
// Next.js Image component
- Automatic format selection (WebP, AVIF)
- Responsive images
- Lazy loading
- Blur placeholder
Security Considerations
Authentication Security
JWT tokens with expiration
Refresh token rotation
Secure token storage
CSRF protection
API Security
Request validation
Rate limiting (backend)
Input sanitization
XSS prevention
Payment Security
PCI DSS compliance via Stripe
No card data storage
Secure payment flow
Webhook signature verification
Monitoring & Logging
Client-Side Logging
// Log levels
- ERROR: Critical errors
- WARN: Warnings and recoverable errors
- INFO: Important events
- DEBUG: Detailed debugging info
Error Tracking
Error boundaries capture React errors
API errors logged with context
WebSocket errors tracked
User actions logged for debugging
Future Enhancements
Planned Features
Mobile Apps: React Native apps for iOS/Android
Advanced Analytics: ML-powered insights
Chat System: Real-time customer-restaurant chat
Loyalty Program: Points and rewards system
Multi-language: Internationalization support
Dark Mode: Full dark theme support
Progressive Web App: Offline functionality
Voice Orders: Voice-activated ordering
Troubleshooting
Common Issues
Build Errors

# Clear cache and rebuild
rm -rf .next
npm run build
WebSocket Connection Issues

# Check environment variables
# Verify backend is running
# Check firewall settings
Payment Integration Issues

# Verify Stripe keys
# Check webhook configuration
# Review Stripe dashboard logs
Support & Resources
Documentation
Next.js Docs
React Query Docs
Stripe Docs
Socket.IO Docs
Internal Resources
API Documentation: Backend repository
Design System: Figma files
Project Specs: .kiro/specs/
Document Version: 1.0
Last Updated: February 2026
Maintained By: ServeSync Development Team


---

These two documents provide comprehensive coverage of:

1. **README.md**: Setup, features, tech stack, and quick start guide
2. **PROJECT_WORKFLOW.md**: Detailed workflows, architecture, and system operations

You can copy these into your project. Would you lik
```
````
