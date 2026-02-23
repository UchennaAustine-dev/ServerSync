/**
 * Form Error Message Component Tests
 * Tests inline form validation error display
 * Validates: Requirement 21.6
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import {
  FormErrorMessage,
  FormFieldError,
  FormErrorList,
} from "../FormErrorMessage";

describe("FormErrorMessage", () => {
  it("renders error message when provided", () => {
    render(<FormErrorMessage message="This field is required" />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not render when message is undefined", () => {
    const { container } = render(<FormErrorMessage message={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it("does not render when message is empty string", () => {
    const { container } = render(<FormErrorMessage message="" />);

    expect(container.firstChild).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FormErrorMessage message="Error" className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has proper ARIA attributes", () => {
    render(<FormErrorMessage message="Error message" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });
});

describe("FormFieldError", () => {
  it("renders error when field is touched and has error", () => {
    render(<FormFieldError error="Invalid email" touched={true} />);

    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not render when field is not touched", () => {
    const { container } = render(
      <FormFieldError error="Invalid email" touched={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("does not render when there is no error", () => {
    const { container } = render(
      <FormFieldError error={undefined} touched={true} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("does not render when neither touched nor error", () => {
    const { container } = render(
      <FormFieldError error={undefined} touched={false} />,
    );

    expect(container.firstChild).toBeNull();
  });
});

describe("FormErrorList", () => {
  it("renders multiple errors as a list", () => {
    const errors = {
      email: "Invalid email format",
      password: "Password must be at least 8 characters",
      name: "Name is required",
    };

    render(<FormErrorList errors={errors} />);

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it("does not render when errors object is empty", () => {
    const { container } = render(<FormErrorList errors={{}} />);

    expect(container.firstChild).toBeNull();
  });

  it("formats field names properly", () => {
    const errors = {
      firstName: "Required",
      emailAddress: "Invalid",
    };

    render(<FormErrorList errors={errors} />);

    // Should convert camelCase to readable format
    expect(screen.getByText(/first name/i)).toBeInTheDocument();
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    const errors = { field: "Error" };

    render(<FormErrorList errors={errors} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("displays header text", () => {
    const errors = { field: "Error" };

    render(<FormErrorList errors={errors} />);

    expect(
      screen.getByText(/please fix the following errors/i),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const errors = { field: "Error" };
    const { container } = render(
      <FormErrorList errors={errors} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
