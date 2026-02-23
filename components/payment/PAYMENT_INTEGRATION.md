# Payment Integration Guide

## Overview

The ServeSync payment system is integrated with Stripe for secure payment processing. This document provides information about the payment flow, testing, and configuration.

## Payment Flow

1. **Cart Review**: Customer reviews items in cart
2. **Delivery Details**: Customer enters delivery address and contact information
3. **Order Creation**: Order is created on the backend (status: pending)
4. **Payment Initiation**: Backend creates a Stripe Payment Intent and returns client secret
5. **Card Entry**: Customer enters card details using Stripe Elements
6. **Payment Confirmation**: Stripe processes the payment
7. **Backend Confirmation**: Backend confirms payment and updates order status
8. **Success**: Customer is redirected to order confirmation page

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

Get your Stripe publishable key from: https://dashboard.stripe.com/apikeys

### Test Mode vs Live Mode

- **Test Mode**: Use `pk_test_...` keys for development and testing
- **Live Mode**: Use `pk_live_...` keys for production (requires Stripe account activation)

## Testing with Stripe Test Cards

Stripe provides test card numbers that simulate different payment scenarios:

### Successful Payments

| Card Number         | Description                 |
| ------------------- | --------------------------- |
| 4242 4242 4242 4242 | Visa - Succeeds             |
| 5555 5555 5555 4444 | Mastercard - Succeeds       |
| 3782 822463 10005   | American Express - Succeeds |

### Failed Payments

| Card Number         | Description        |
| ------------------- | ------------------ |
| 4000 0000 0000 0002 | Card declined      |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card       |

### 3D Secure Authentication

| Card Number         | Description             |
| ------------------- | ----------------------- |
| 4000 0027 6000 3184 | Requires 3D Secure auth |

### Card Details for Testing

- **Expiry Date**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP Code**: Any 5 digits (e.g., 12345)

## Error Handling

The payment form handles the following error scenarios:

1. **Network Errors**: Displays retry option
2. **Card Validation Errors**: Real-time feedback from Stripe
3. **Payment Declined**: Shows Stripe error message
4. **3D Secure Required**: Automatically handles authentication flow
5. **Backend Errors**: Displays user-friendly error messages

## Security Features

- **PCI Compliance**: Card data never touches our servers (handled by Stripe)
- **Encryption**: All payment data is encrypted in transit
- **Tokenization**: Card details are tokenized by Stripe
- **3D Secure**: Supports Strong Customer Authentication (SCA)

## Components

### PaymentForm

Located at: `components/payment/PaymentForm.tsx`

**Props:**

- `orderId` (string): The order ID to process payment for
- `amount` (number): The total amount to charge
- `onSuccess` (function, optional): Callback when payment succeeds
- `onError` (function, optional): Callback when payment fails

**Usage:**

```tsx
<PaymentForm
  orderId="order-123"
  amount={45.99}
  onSuccess={() => console.log("Payment successful!")}
  onError={(error) => console.error("Payment failed:", error)}
/>
```

### Payment Hooks

Located at: `lib/hooks/payment.hooks.ts`

**useInitiatePayment:**

- Initiates payment on backend
- Returns client secret for Stripe

**useConfirmPayment:**

- Confirms payment after Stripe confirmation
- Updates order status
- Invalidates order queries

## API Endpoints

### POST /payments/initiate

**Request:**

```json
{
  "orderId": "order-123"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /payments/confirm

**Request:**

```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": "order-123"
}
```

**Response:**

```json
{
  "payment": { ... },
  "order": { ... }
}
```

## Troubleshooting

### "Payment Not Configured" Error

**Cause**: Stripe publishable key is not set
**Solution**: Add `NEXT_PUBLIC_STRIPE_KEY` to `.env.local`

### "Card element not found" Error

**Cause**: Stripe Elements not properly initialized
**Solution**: Ensure Stripe.js is loaded before rendering form

### Payment Succeeds but Order Not Updated

**Cause**: Backend confirmation failed
**Solution**: Check backend logs and ensure `/payments/confirm` endpoint is working

### 3D Secure Modal Not Appearing

**Cause**: Browser popup blocker
**Solution**: Allow popups for the site or use test cards without 3D Secure

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [React Stripe.js](https://stripe.com/docs/stripe-js/react)

## Support

For payment-related issues:

1. Check browser console for errors
2. Verify Stripe key is correct
3. Test with Stripe test cards
4. Check backend API logs
5. Contact Stripe support for payment processing issues
