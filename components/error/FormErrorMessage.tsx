"use client";

/**
 * Form Error Message Component
 * Displays inline error messages for form validation errors
 * Validates: Requirement 21.6
 */

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorMessageProps {
  message?: string;
  className?: string;
}

/**
 * Inline error message for form fields
 */
export function FormErrorMessage({
  message,
  className,
}: FormErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={cn("flex items-start gap-1.5 text-xs text-red-600", className)}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

/**
 * Form field error that only shows when field is touched
 */
export function FormFieldError({
  error,
  touched,
  className,
}: FormFieldErrorProps) {
  if (!error || !touched) return null;

  return <FormErrorMessage message={error} className={className} />;
}

interface FormErrorListProps {
  errors: Record<string, string>;
  className?: string;
}

/**
 * Display multiple form errors as a list
 */
export function FormErrorList({ errors, className }: FormErrorListProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-red-200 bg-red-50 p-3",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">
            Please fix the following errors:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-700">
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                <span className="font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}:
                </span>{" "}
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
