# ServeSync Client

A modern, full-featured food delivery platform built with Next.js 16, React 19, and TypeScript. ServeSync provides a comprehensive solution for customers, restaurant owners, drivers, and administrators to manage food ordering and delivery operations.

## 🚀 Features

### Multi-Role Support

- **Customers**: Browse restaurants, place orders, track deliveries, manage favorites
- **Restaurant Owners**: Manage menus, track orders, view analytics, handle promotions
- **Drivers**: Accept deliveries, track earnings, manage active orders
- **Admins**: Platform oversight, revenue tracking, user management
- **Kitchen Staff**: Order management and preparation tracking

### Core Functionality

- 🔐 Role-based authentication with JWT tokens
- 🛒 Shopping cart with real-time validation
- 💳 Stripe payment integration
- 🔔 Real-time notifications via WebSocket
- 📍 Live order tracking and driver location
- ⭐ Restaurant ratings and reviews
- 🎫 Promo code system
- 📊 Analytics and reporting dashboards
- ♿ WCAG 2.1 AA accessibility compliance
- 🌐 Responsive design for all devices

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling

### State Management & Data Fetching

- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

### Real-time Communication

- **Socket.IO Client** - WebSocket connections for live updates

### UI Components

- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants
- **tailwind-merge** - Utility class merging

### Payment Processing

- **Stripe** - Payment gateway integration

### Testing

- **Vitest** - Unit and integration testing
- **Testing Library** - Component testing
- **MSW** - API mocking
- **Happy DOM** - DOM implementation for tests

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Backend API running (see backend repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd serversync-client
2. Install Dependencies
npm install
# or
yarn install
# or
pnpm install
3. Environment Setup
Create a .env.local file in the root directory:

# API Configuration
NEXT_PUBLIC_API_URL=https://servesync-84s1.onrender.com
NEXT_PUBLIC_WS_URL=wss://servesync-84s1.onrender.com

# Stripe Configuration (Optional)
NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key

# Environment
NEXT_PUBLIC_ENV=development
See .env.example for all available configuration options.

4. Run Development Server
npm run dev
Open http://localhost:3000 in your browser.

5. Build for Production
npm run build
npm run start
📁 Project Structure
serversync-client/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   ├── dashboard/                # Restaurant owner dashboard
│   ├── driver-portal/            # Driver portal pages
│   ├── login/                    # Authentication pages
│   ├── orders/                   # Order management pages
│   └── restaurants/              # Restaurant browsing pages
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components (Radix UI)
│   ├── checkout/                 # Checkout flow components
│   ├── error/                    # Error handling components
│   ├── notifications/            # Notification components
│   ├── order/                    # Order-related components
│   ├── payment/                  # Payment components
│   └── restaurant/               # Restaurant components
├── lib/                          # Core library code
│   ├── api/                      # API services and types
│   │   ├── services/             # API service layer
│   │   └── types/                # TypeScript type definitions
│   ├── config/                   # Configuration files
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Zustand state stores
│   ├── utils/                    # Utility functions
│   └── websocket/                # WebSocket client
├── __tests__/                    # Test files
│   └── integration/              # Integration tests
├── public/                       # Static assets
└── .kiro/                        # Project specifications
    └── specs/                    # Feature specifications
🧪 Testing
Run Tests
# Run all tests
npm run test

# Run tests in watch mode
npm run dev:test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
Test Coverage
The project includes:

Unit tests for utilities and hooks
Component tests for UI components
Integration tests for user flows
API mocking with MSW
🔑 User Roles & Access
Authentication Flow
All users log in through /login with their credentials. After successful authentication, users are automatically redirected based on their role:

Role	Redirect Path	Description
ADMIN	/admin	Platform administration
RESTAURANT_OWNER	/dashboard	Restaurant management
KITCHEN_STAFF	/dashboard/kitchen	Kitchen order management
DRIVER	/driver-portal	Delivery management
CUSTOMER	/	Browse and order food
Demo Credentials
Email: demo@serversync.com
Password: password
🔌 API Integration
The application connects to a backend API for all data operations:

Base URL: https://servesync-84s1.onrender.com
WebSocket: wss://servesync-84s1.onrender.com
API Services
authService - Authentication and user management
restaurantService - Restaurant and menu operations
orderService - Order management
customerService - Customer operations
driverService - Driver operations
adminService - Admin operations
🎨 Styling
The project uses Tailwind CSS 4 with custom configuration:

Custom color palette (primary, secondary, accent)
Responsive breakpoints
Custom animations
Dark mode support (via next-themes)
Accessibility-focused design
♿ Accessibility
ServeSync is built with accessibility as a priority:

WCAG 2.1 AA compliance
Keyboard navigation support
Screen reader announcements
Focus management
ARIA labels and roles
High contrast support
See ACCESSIBILITY.md for detailed information.

📊 Performance Optimizations
Code splitting with dynamic imports
Image optimization with Next.js Image
React Query caching strategies
Lazy loading of components
Optimistic UI updates
Request deduplication
See PERFORMANCE_OPTIMIZATIONS.md for details.

🔒 Security
JWT token-based authentication
Secure token storage (httpOnly cookies recommended)
CSRF protection
XSS prevention
Input validation
Rate limiting (backend)
🐛 Error Handling
Comprehensive error handling system:

Global error boundaries
Network error fallbacks
Form validation errors
API error handling
User-friendly error messages
Error logging
See
README.md
 for details.

📱 Real-time Features
WebSocket integration for live updates:

Order status changes
Driver location tracking
New order notifications
Kitchen order updates
Real-time chat (future)
See WEBSOCKET_IMPLEMENTATION.md for details.

🚢 Deployment
Vercel (Recommended)
Push code to GitHub
Import project in Vercel
Configure environment variables
Deploy
Other Platforms
The application can be deployed to any platform supporting Next.js:

Netlify
AWS Amplify
Railway
Render
Self-hosted with Docker
📝 Scripts
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once (CI)
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is proprietary software. All rights reserved.

🆘 Support
For issues and questions:

Check existing documentation in /docs
Review specification files in .kiro/specs/
Contact the development team
🔗 Related Documentation
Accessibility Guide
Performance Optimizations
WebSocket Implementation
[Integration Tests](./__ tests__/integration/README.md)
Error Handling
State Management
API Services
Built with ❤️ by the ServeSync Team
```
