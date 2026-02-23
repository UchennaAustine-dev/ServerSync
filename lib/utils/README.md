# Utility Functions

This directory contains utility functions used throughout the application.

## Error Handler (`error-handler.ts`)

Comprehensive error handling utilities for API errors and user feedback.

### Features

- **Error Classification**: Identify client errors (4xx), server errors (5xx), and network errors
- **User-Friendly Messages**: Map backend error codes to readable messages
- **Field-Specific Errors**: Extract validation errors for form fields
- **Toast Integration**: Automatic toast notifications for errors
- **Error Logging**: Console logging with context (extensible to error tracking services)
- **Retry Logic**: Determine which errors shoul
