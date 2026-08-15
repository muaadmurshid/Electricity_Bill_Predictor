import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, getFieldErrors } from "../utils/apiError";
import AuthPanel from "../components/layout/AuthPanel";
import Field from "../components/common/Field";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "Enter your first name.";
    if (!form.lastName.trim()) next.lastName = "Enter your last name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Both passwords must match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      // confirmPassword never leaves the browser.
      const session = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // Registration returns a token, so go straight to the dashboard.
      // If your backend ever stops returning one, fall back to login.
      navigate(session ? "/dashboard" : "/login", { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(
        getErrorMessage(error, "We could not create your account. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <AuthPanel
        headline="Start tracking what your home really uses."
        sub="Add your rooms and appliances once, record usage as you go, and let the system estimate the bill against current Sri Lankan tariff blocks."
      />

      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h1>Create your account</h1>
          <p className="auth-form-lead">It takes a minute. You can add your home next.</p>

          <div className="stack-sm" style={{ marginTop: "var(--space-5)" }}>
            <ErrorMessage message={formError} />

            <div className="grid grid-2">
              <Field
                id="firstName"
                label="First name"
                autoComplete="given-name"
                value={form.firstName}
                error={errors.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
              <Field
                id="lastName"
                label="Last name"
                autoComplete="family-name"
                value={form.lastName}
                error={errors.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </div>

            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />

            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters."
              value={form.password}
              error={errors.password}
              onChange={(e) => update("password", e.target.value)}
            />

            <Field
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />

            <Button type="submit" block loading={submitting}>
              Create account
            </Button>
          </div>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
