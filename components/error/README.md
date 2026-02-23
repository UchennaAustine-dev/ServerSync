# Error Boundary Components

Comprehensive error handling components for catching JavaScript errors and displaying user-friendly fallback UI.

**Validates Requirements:** 21.3 (Network error messages), 21.6 (Form validation errors)

## Components

### ErrorBoundary

Core error boundary component that catches errors in child components.

```tsx
import { ErrorBoundary } from "@/components/error";

<ErrorBoundary level="page" onError={(error, errorInfo) => console.log(error)}>
  <YourComponent />
</ErrorBoundary>;
```

**Props:**

- `level`: `"root" | "page" | "section"` - Determines the fallback UI style
- `fallback`: Custom fallback UI (optional)
- `onError`: Callback when error occurs (optional)
- `resetKeys`: Array of values that trigger reset when changed (optional)

### PageErrorBoundary

Convenience wrapper for page-level error boundaries.

```tsx
import { PageErrorBoundary } from "@/components/error";

export default function MyPage() {
  return (
    <PageErrorBoundary pageName="Checkout">
      <PageContent />
    </PageErrorBoundary>
  );
}
```

### SectionErrorBoundary

Wrapper for section-level error boundaries (inline errors).

```tsx
import { SectionErrorBoundary } from "@/components/error";

<SectionErrorBoundary sectionName="Order Summary">
  <OrderSummary />
</SectionErrorBoundary>;
```

### NetworkErrorFallback

Specialized fallback for network connectivity errors.

```tsx
import { NetworkErrorFallback } from "@/components/error";

<NetworkErrorFallback
  message="Unable to connect to server"
  onRetry={() => refetch()}
/>;
```

### Form Error Components

Components for displaying form validation errors inline.

```tsx
import {
  FormErrorMessage,
  FormFieldError,
  FormErrorList
} from "@/components/error";

// Single error message
<FormErrorMessage message="This field is required" />

// Field error (only shows when touched)
<FormFieldError error={errors.email} touched={touched.email} />

// Multiple errors as a list
<FormErrorList errors={{
  email: "Invalid email",
  password: "Too short"
}} />
```

### useErrorHandler Hook

Hook for programmatic error handling in components.

```tsx
import { useErrorHandler } from "@/components/error";

function MyComponent() {
  const {
    error,
    fieldErrors,
    isNetworkError,
    handleError,
    clearError,
    setFieldError,
    clearFieldError,
  } = useErrorHandler({
    onError: (error) => console.log(error),
    showToast: true,
  });

  const handleSubmit = async () => {
    try {
      await submitForm();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      {error && <div>{error.message}</div>}
      {fieldErrors?.email && <div>{fieldErrors.email}</div>}
    </div>
  );
}
```

## Usage Patterns

### Root-Level Error Boundary

Already implemented in `app/layout.tsx` - catches all errors in the app.

```tsx
<ErrorBoundary level="root">
  <QueryProvider>{children}</QueryProvider>
</ErrorBoundary>
```

### Page-Level Error Boundary

Wrap entire page content to catch page-specific errors.

```tsx
export default function CheckoutPage() {
  return (
    <PageErrorBoundary pageName="Checkout">
      <MainLayout>
        <CheckoutContent />
      </MainLayout>
    </PageErrorBoundary>
  );
}
```

### Section-Level Error Boundary

Wrap complex components or sections that might fail independently.

```tsx
<div className="dashboard">
  <SectionErrorBoundary sectionName="Analytics Chart">
    <AnalyticsChart />
  </SectionErrorBoundary>

  <SectionErrorBoundary sectionName="Recent Orders">
    <RecentOrders />
  </SectionErrorBoundary>
</div>
```

### Form Validation Errors

Display inline validation errors for form fields.

```tsx
<form onSubmit={handleSubmit}>
  <div>
    <Label>Email</Label>
    <Input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={() => setTouched({ ...touched, email: true })}
    />
    <FormFieldError error={errors.email} touched={touched.email} />
  </div>

  {Object.keys(errors).length > 0 && <FormErrorList errors={errors} />}
</form>
```

### Network Error Handling

Show network-specific error UI with retry functionality.

```tsx
const { data, error, refetch } = useQuery({
  queryKey: ["restaurants"],
  queryFn: fetchRestaurants,
});

if (isNetworkError(error)) {
  return <NetworkErrorFallback onRetry={refetch} />;
}
```

### Programmatic Error Handling

Use the hook for handling errors in event handlers and async operations.

```tsx
function OrderForm() {
  const { handleError, fieldErrors, clearFieldError } = useErrorHandler();
  const createOrder = useCreateOrder();

  const onSubmit = async (data) => {
    try {
      await createOrder.mutateAsync(data);
    } catch (err) {
      handleError(err); // Automatically shows toast and extracts field errors
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input name="address" onChange={() => clearFieldError("address")} />
      <FormErrorMessage message={fieldErrors?.address} />
    </form>
  );
}
```

## Error Levels

### Root Level

- Full-page error display
- Used for critical app-wide errors
- Provides "Go Home" and "Try Again" options
- Shows detailed error info in development

### Page Level

- Centered card-style error display
- Used for page-specific errors
- Provides "Go Back" and "Retry" options
- Less intrusive than root level

### Section Level

- Inline error display
- Used for component/section errors
- Minimal UI disruption
- Only shows "Try Again" button
- Allows rest of page to function

## Best Practices

1. **Use appropriate error levels**: Root for critical errors, page for page errors, section for component errors

2. **Provide reset keys**: Use `resetKeys` prop to automatically reset error boundaries when data changes

3. **Custom fallbacks**: Provide custom fallback UI for specific use cases

4. **Error reporting**: Use `onError` callback to send errors to monitoring services

5. **Development vs Production**: Error details are only shown in development mode

6. **Form validation**: Use `FormFieldError` with touched state to avoid showing errors prematurely

7. **Network errors**: Use `NetworkErrorFallback` for connectivity issues with retry functionality

8. **Event handlers**: Error boundaries don't catch errors in event handlers - use try-catch or `useErrorHandler` hook

## Testing

All components include comprehensive tests. Run tests with:

```bash
npm test components/error
```

## Requirements Validation

- **Requirement 21.3**: Network error messages displayed via `NetworkErrorFallback`
- **Requirement 21.6**: Form validation errors displayed via `FormErrorMessage`, `FormFieldError`, and `FormErrorList`

## Error Logging

All errors are automatically logged to console with context. In production, extend the `logError` function in `lib/utils/error-handler.ts` to send errors to monitoring services like Sentry.

```typescript
// In error-handler.ts
export function logError(error: unknown, context?: any): void {
  console.error("Application Error:", error, context);

  // Add production error tracking
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException(error, { contexts: { custom: context } });
  }
}
```
