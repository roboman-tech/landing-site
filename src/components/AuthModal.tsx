import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";
import InputField from "./InputField";
import parseApiError from "../utils/parseApiError";

export type AuthMode = "signIn" | "signUp";

export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

type GoogleCredentialResponse = {
  credential: string;
  token: string;
};

type GoogleSignInButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: GoogleSignInButtonConfiguration) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCredentialSubmit: (mode: AuthMode, payload: AuthPayload) => Promise<void>;
  onGoogleSubmit: (credential: string) => Promise<void>;
};

export default function AuthModal({ isOpen, onClose, onCredentialSubmit, onGoogleSubmit }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }
    setIsVisible(false);
    const timeout = window.setTimeout(() => {
      setIsMounted(false);
      setMode("signIn");
      setError("");
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted || !GOOGLE_CLIENT_ID) {
      return;
    }

    const setupGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            return;
          }
          setError("");
          setIsBusy(true);
          void onGoogleSubmit(response.credential)
            .then(() => onClose())
            .catch((submitError) => setError(parseApiError(submitError)))
            .finally(() => setIsBusy(false));
        }
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        shape: "pill",
        text: "continue_with",
        size: "large",
        width: 320,
        logo_alignment: "left"
      });
    };

    const scriptId = "google-identity-service";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (window.google) {
      setupGoogleButton();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", setupGoogleButton);
      return () => existingScript.removeEventListener("load", setupGoogleButton);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = setupGoogleButton;
    document.body.appendChild(script);
    return () => script.removeEventListener("load", setupGoogleButton);
  }, [isMounted, onClose, onGoogleSubmit]);

  if (!isMounted) {
    return null;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload: AuthPayload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || "")
    };

    if (!payload.email || !payload.password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signUp" && payload.password !== payload.confirmPassword) {
      setError("Password and confirmation password do not match.");
      return;
    }

    setIsBusy(true);
    try {
      await onCredentialSubmit(mode, payload);
      onClose();
    } catch (submitError) {
      setError(parseApiError(submitError));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition duration-200 ${
        isVisible ? "bg-slate-200/65 opacity-100" : "pointer-events-none bg-slate-200/0 opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border border-sky-200 bg-white/95 p-6 text-slate-800 shadow-2xl shadow-sky-200/60 transition duration-200 ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{mode === "signIn" ? "Sign In" : "Create Account"}</h2>
          <button className="rounded-full p-1.5 text-slate-500 transition hover:bg-sky-100" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <div className="mb-4 flex justify-center">
            <div ref={googleButtonRef} />
          </div>
        ) : (
          <p className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Google OAuth is disabled. Set `VITE_GOOGLE_CLIENT_ID` in `.env`.
          </p>
        )}

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-sky-100" />
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-sky-100" />
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === "signUp" ? <InputField id="auth-name" label="Full Name" name="name" /> : null}
          <InputField id="auth-email" label="Email" name="email" type="email" />
          <InputField id="auth-password" label="Password" name="password" type="password" />
          {mode === "signUp" ? (
            <InputField id="auth-confirm" label="Confirm Password" name="confirmPassword" type="password" />
          ) : null}

          {error ? <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {mode === "signIn" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {mode === "signIn" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="font-semibold text-sky-700 hover:text-sky-900"
            onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
            type="button"
          >
            {mode === "signIn" ? "Create Account" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
