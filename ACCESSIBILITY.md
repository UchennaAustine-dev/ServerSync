# Accessibility Implementation Guide

This document outlines the accessibility features implemented in the ServeSync application to ensure WCAG 2.1 Level AA compliance.

## Overview

ServeSync has been designed with accessibility as a core principle, ensuring that all users, including those using assistive technologies, can effectively use the platform.

## Key Features

### 1. Keyboard Navigation

- **Skip Navigation**: A "Skip to main content" link appears when users press Tab, allowing keyboard users to bypass repetitive navigation
- **Focus Management**: All interactive elements are keyboard accessible with visible focus indicators
- **Focus Trap**: Modals and dialogs trap focus within them and restore focus when closed
- **Keyboard Shortcuts**: Standard keyboard interactions (Enter, Escape, Tab, Arrow keys) work throughout the application

### 2. Screen Reader Support

#### Utilities

- `lib/utils/accessibility.ts` - Core accessibility utilities
- `lib/hooks/useAccessibility.ts` - React hooks for accessibility features

#### Features

- **Live Regions**: Dynamic content updates are announced to screen readers
- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Roles**: Semantic roles are used where HTML5 semantics are insufficient
- **Loading States**: Loading indicators are announced with `aria-live="polite"`
- **Error Messages**: Errors are announced with `aria-live="assertive"`
- **Success Messages**: Success feedback is announced to screen readers

### 3. Form Accessibility

All forms include:

- Proper label associations using `htmlFor` and `id`
- `aria-required` for required fields
- `aria-invalid` for fields with errors
- `aria-describedby` linking to error messages
- `autocomplete` attributes for common fields
- Error messages with `role="alert"`
- Field-level validation feedback

### 4. Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
- `role="banner"` for header
- `role="contentinfo"` for footer
- `role="main"` for main content area
- `role="navigation"` for navigation menus

### 5. Visual Accessibility

- **Focus Indicators**: Clear 2px outline on all focusable elements
- **Color Contrast**: All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- **Visual Hidden Content**: `.sr-only` class for screen reader only content
- **Icon Labels**: All icons have `aria-hidden="true"` with accompanying text labels

### 6. Component-Specific Implementations

#### MainLayout

- Skip navigation link
- Proper ARIA labels on navigation
- Cart button with item count announced
- User menu with proper ARIA attributes

#### Login/Register Forms

- Screen reader announcements for loading states
- Error announcements
- Success message announcements
- Proper autocomplete attributes
- ARIA invalid states

#### Checkout Forms

- Address form with grouped fields
- Contact form with tel input type
- Promo code with success/error announcements
- All fields properly labeled and described

#### Dialogs/Modals

- Focus trap implementation
- Focus restoration on close
- Close button with aria-label
- Proper ARIA roles from Radix UI

## Testing Guidelines

### Keyboard Testing

1. Navigate through the entire application using only Tab, Shift+Tab, Enter, and Escape
2. Verify all interactive elements are reachable
3. Verify focus indicators are visible
4. Verify modals trap focus correctly

### Screen Reader Testing

Test with:

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

Verify:

- All content is announced correctly
- Form labels are associated properly
- Error messages are announced
- Loading states are announced
- Dynamic content updates are announced

### Automated Testing

Run accessibility audits with:

- Lighthouse (Chrome DevTools)
- axe DevTools
- WAVE browser extension

## Utilities Reference

### Screen Reader Announcements

```typescript
import { useScreenReaderAnnouncement } from "@/lib/hooks/useAccessibility";

const { announce, announceLoading, announceError, announceSuccess } =
  useScreenReaderAnnouncement();

// Announce a message
announce("Order placed successfully", "polite");

// Announce loading state
announceLoading(true, "Loading restaurants");

// Announce error
announceError("Failed to load data");

// Announce success
announceSuccess("Settings saved");
```

### Focus Management

```typescript
import { useFocusTrap } from '@/lib/hooks/useAccessibility';

const containerRef = useFocusTrap(isOpen);

return <div ref={containerRef}>{/* Modal content */}</div>;
```

### Loading Announcements

```typescript
import { useLoadingAnnouncement } from "@/lib/hooks/useAccessibility";

useLoadingAnnouncement(isLoading, "Loading menu items");
```

### Error Announcements

```typescript
import { useErrorAnnouncement } from "@/lib/hooks/useAccessibility";

useErrorAnnouncement(error?.message);
```

### Keyboard Navigation

```typescript
import { useKeyboardNavigation } from "@/lib/hooks/useAccessibility";

useKeyboardNavigation(
  () => handleClose(), // Escape handler
  () => handleSubmit(), // Enter handler
);
```

## Best Practices

### DO

✅ Use semantic HTML elements
✅ Provide text alternatives for images
✅ Ensure sufficient color contrast
✅ Make all functionality keyboard accessible
✅ Provide clear focus indicators
✅ Use ARIA attributes when HTML semantics are insufficient
✅ Test with actual assistive technologies
✅ Announce dynamic content changes

### DON'T

❌ Use `div` or `span` for interactive elements
❌ Remove focus outlines without providing alternatives
❌ Rely solely on color to convey information
❌ Use placeholder text as labels
❌ Create keyboard traps (except in modals)
❌ Use positive tabindex values
❌ Overuse ARIA when HTML semantics suffice

## WCAG 2.1 Level AA Compliance

### Perceivable

- ✅ Text alternatives for non-text content
- ✅ Captions and alternatives for multimedia
- ✅ Content can be presented in different ways
- ✅ Sufficient color contrast

### Operable

- ✅ All functionality available from keyboard
- ✅ Users have enough time to read and use content
- ✅ Content doesn't cause seizures
- ✅ Users can easily navigate and find content

### Understandable

- ✅ Text is readable and understandable
- ✅ Content appears and operates in predictable ways
- ✅ Users are helped to avoid and correct mistakes

### Robust

- ✅ Content is compatible with current and future tools
- ✅ Valid HTML and ARIA usage

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Continuous Improvement

Accessibility is an ongoing process. Regular audits and user testing with people who use assistive technologies are essential to maintaining and improving accessibility.

### Regular Checks

- Run automated accessibility tests in CI/CD
- Conduct manual keyboard navigation tests
- Test with screen readers quarterly
- Review new features for accessibility before deployment
- Gather feedback from users with disabilities
