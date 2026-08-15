import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getErrorMessage,
  getFieldErrors,
} from "../utils/apiError";

import AuthPanel from "../components/layout/AuthPanel";
import Field from "../components/common/Field";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";

export default function Login() {
  const { login } =
    useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [searchParams] =
    useSearchParams();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [errors, setErrors] =
    useState({});

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const sessionExpired =
    searchParams.get(
      "expired"
    ) === "1";

  const redirectTo =
    location.state?.from ||
    "/dashboard";

  function update(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function validate() {
    const next = {};

    if (!form.email.trim()) {
      next.email =
        "Enter your email address.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.email
      )
    ) {
      next.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      next.password =
        "Enter your password.";
    }

    setErrors(next);

    return (
      Object.keys(next).length ===
      0
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setFormError("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await login({
        email:
          form.email.trim(),

        password:
          form.password,
      });

      navigate(
        redirectTo,
        {
          replace: true,
        }
      );
    } catch (error) {
      setErrors(
        getFieldErrors(error)
      );

      setFormError(
        getErrorMessage(
          error,
          "We could not sign you in. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <AuthPanel
        headline="Know your bill before it arrives."
        sub="Track what your home uses, see the predicted bill for next month, and find out which appliances are driving it."
      />

      <div className="auth-form-side">
        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <h1>
            Sign in
          </h1>

          <p className="auth-form-lead">
            Welcome back. Enter
            your details to
            continue.
          </p>

          <div
            className="stack-sm"
            style={{
              marginTop:
                "var(--space-5)",
            }}
          >
            {sessionExpired && (
              <ErrorMessage
                variant="warning"
                message="Your session ended. Sign in again to continue."
              />
            )}

            <ErrorMessage
              message={
                formError
              }
            />

            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={
                form.email
              }
              error={
                errors.email
              }
              onChange={(e) =>
                update(
                  "email",
                  e.target.value
                )
              }
            />

            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={
                form.password
              }
              error={
                errors.password
              }
              onChange={(e) =>
                update(
                  "password",
                  e.target.value
                )
              }
            />

            <Button
              type="submit"
              block
              loading={
                submitting
              }
            >
              Sign in
            </Button>
          </div>

          <p className="auth-switch">
            New here?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}