import axios, { type InternalAxiosRequestConfig } from "axios";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import AuthModal, {
  type AuthMode,
  type AuthPayload,
} from "./components/AuthModal";
import ChatRoom from "./components/ChatRoom";
import InputField from "./components/InputField";
import SectionHeading from "./components/SectionHeading";
import parseApiError from "./utils/parseApiError";
import getDeviceId from "./utils/deviceId";
import { Player } from "@lottiefiles/react-lottie-player";
import aiAnimation from "../images/chatbot.json";
import happyChildrenImage from "../images/happy_children.png";
import cmLovingChildrenImage from "../images/cm-loving-children.png";
import {
  ArrowUp,
  ArrowRight,
  Brain,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  LogOut,
  MapPin,
  Menu,
  Paintbrush,
  Phone,
  Rocket,
  Users,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

type Service = {
  title: string;
  description: string;
  icon: ReactNode;
};

type Article = {
  image: string;
  title: string;
  href: string;
  meta: string;
  excerpt: string;
};

type CurrentUser = {
  email?: string;
  name?: string;
  token?: string;
  subscriptionActive?: boolean;
  subscriptionProvider?: string | null;
};

type AuthResponse = {
  token?: string;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    email?: string;
    name?: string;
    full_name?: string;
  };
  subscription?: {
    active?: boolean;
    provider?: string | null;
    plan?: string;
    priceUsd?: number;
  };
  email?: string;
  name?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const AUTH_SIGNIN_PATH =
  import.meta.env.VITE_AUTH_SIGNIN_PATH ?? "/login";
const AUTH_SIGNUP_PATH =
  import.meta.env.VITE_AUTH_SIGNUP_PATH ?? "/register";
const AUTH_GOOGLE_PATH =
  import.meta.env.VITE_AUTH_GOOGLE_PATH ?? "/login";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let authInterceptorInitialized = false;

function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem("currentUser");
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as CurrentUser;
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

function attachAuthToken(
  requestConfig: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = getStoredAuthToken();

  requestConfig.headers = requestConfig.headers ?? {};
  requestConfig.headers["X-Device-Id"] = getDeviceId();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
    requestConfig.headers["X-Auth-Token"] = token;
  }
  return requestConfig;
}

if (!authInterceptorInitialized) {
  apiClient.interceptors.request.use(attachAuthToken);
  axios.interceptors.request.use(attachAuthToken);
  authInterceptorInitialized = true;
}

const navItems: NavItem[] = [
  { label: "Home", href: "#home-section" },
  { label: "Services", href: "#services-section" },
  { label: "About", href: "#about-section" },
  { label: "Blog", href: "#blog-section" },
  { label: "Contact", href: "#contact-section" },
];

const heroWords = [
  "AI for humanity.",
  "Open models for open minds.",
  "Ethical AI for everyone.",
];

const services: Service[] = [
  {
    title: "Frontend & Backend Engineering",
    description:
      "We deliver full-stack web and mobile systems tailored for AI products.",
    icon: <Rocket className="h-5 w-5" />,
  },
  {
    title: "UI/UX Design",
    description:
      "We craft product flows and interfaces that simplify complex AI interactions.",
    icon: <Paintbrush className="h-5 w-5" />,
  },
  {
    title: "Data Infrastructure",
    description:
      "We build dependable pipelines and architectures for secure model operations.",
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: "LLM & Agentic Applications",
    description:
      "We create monitored agent workflows and LLM experiences for production.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    title: "Machine Learning",
    description:
      "We train and optimize custom machine learning models at real-world scale.",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: "Generative AI Fine-Tuning",
    description:
      "We tune foundation models to align with your domain constraints and goals.",
    icon: <Cloud className="h-5 w-5" />,
  },
];

const articles: Article[] = [
  {
    image: "/images/articles/art1.webp",
    title: "ChatGPT: Everything you need to know about the AI-powered chatbot",
    href: "https://techcrunch.com/2025/06/20/chatgpt-everything-to-know-about-the-ai-chatbot/",
    meta: "Kyle Wiggers, Cody Corrall, Alyssa Stringer, Kate Park - June 20, 2025",
    excerpt:
      "ChatGPT evolved from assistant tooling into a broad platform with hundreds of millions of weekly users.",
  },
  {
    image: "/images/articles/art2.webp",
    title:
      "Meta looks to hire Safe Superintelligence CEO after acquisition talks",
    href: "https://techcrunch.com/2025/06/20/after-trying-to-buy-ilya-sutskevers-32b-ai-startup-meta-looks-to-hire-its-ceo/",
    meta: "Maxwell Zeff - June 20, 2025",
    excerpt:
      "Competition for top AI researchers and startup leaders keeps accelerating across major labs.",
  },
  {
    image: "/images/articles/art3.webp",
    title: "Nvidia's AI empire: A look at its top startup investments",
    href: "https://techcrunch.com/2025/06/19/nvidias-ai-empire-a-look-at-its-top-startup-investments/",
    meta: "Marina Temkin - June 19, 2025",
    excerpt:
      "Nvidia's investment strategy reflects how compute and capital are consolidating around AI infrastructure.",
  },
];

function normalizeAuth(data: AuthResponse): CurrentUser {
  const email = data.user?.email ?? data.email;
  const name =
    data.user?.name ??
    data.user?.full_name ??
    data.name ??
    (email ? email.split("@")[0] : undefined);
  const token = data.access_token ?? data.token;
  const subscriptionActive = Boolean(data.subscription?.active);
  const subscriptionProvider = data.subscription?.provider ?? null;

  return { email, name, token, subscriptionActive, subscriptionProvider };
}

type JwtPayload = {
  sub?: string;
  exp?: number;
  email?: string;
  name?: string;
};

type GoogleCredentialPayload = {
  email?: string;
  name?: string;
};

function decodeBase64UrlSegment(segment: string): string | null {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded =
    normalized.length % 4 === 0
      ? normalized
      : normalized + "=".repeat(4 - (normalized.length % 4));
  try {
    return window.atob(padded);
  } catch {
    return null;
  }
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const decoded = decodeBase64UrlSegment(parts[1]);
  if (!decoded) {
    return null;
  }
  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }
  return payload.exp * 1000 <= Date.now();
}

function parseGoogleCredentialPayload(
  credential: string,
): GoogleCredentialPayload {
  const payload = parseJwtPayload(credential);
  const email = typeof payload?.email === "string" ? payload.email : undefined;
  const name = typeof payload?.name === "string" ? payload.name : undefined;
  return { email, name };
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [openChatAfterAuth, setOpenChatAfterAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [typedHeroWord, setTypedHeroWord] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as CurrentUser;
      if (!parsed.token || isTokenExpired(parsed.token)) {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        return;
      }

      const tokenPayload = parseJwtPayload(parsed.token);
      const tokenEmail =
        typeof tokenPayload?.sub === "string" ? tokenPayload.sub : undefined;
      const email = parsed.email ?? tokenEmail;

      if (!email) {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        return;
      }

      const mergedUser: CurrentUser = {
        ...parsed,
        email,
      };
      localStorage.setItem("currentUser", JSON.stringify(mergedUser));
      setCurrentUser(mergedUser);
    } catch {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    };
  }, []);

  useEffect(() => {
    if (authOpen) {
      return;
    }

    const currentWord = heroWords[wordIndex];
    let timer = 0;

    if (typedHeroWord.length < currentWord.length) {
      timer = window.setTimeout(() => {
        setTypedHeroWord(currentWord.slice(0, typedHeroWord.length + 1));
      }, 72);
    } else {
      timer = window.setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % heroWords.length);
        setTypedHeroWord("");
      }, 1300);
    }

    return () => window.clearTimeout(timer);
  }, [authOpen, typedHeroWord, wordIndex]);

  useEffect(() => {
    if (chatRoomOpen) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 55, 280)}ms`;
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [chatRoomOpen]);

  useEffect(() => {
    if (chatRoomOpen) {
      return;
    }

    const footerImage = document.querySelector<HTMLElement>(
      ".footer-kid-image-wrap",
    );
    if (!footerImage) {
      return;
    }

    let isVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              target.classList.remove("footer-roll-active");
              void target.offsetWidth;
              target.classList.add("footer-roll-active");
            }
          } else if (isVisible) {
            isVisible = false;
            target.classList.remove("footer-roll-active");
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(footerImage);
    return () => {
      footerImage.classList.remove("footer-roll-active");
      observer.disconnect();
    };
  }, [chatRoomOpen]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userInitial = useMemo(
    () =>
      currentUser?.name?.charAt(0).toUpperCase() ??
      currentUser?.email?.charAt(0).toUpperCase() ??
      "",
    [currentUser],
  );

  const persistUser = (email: string, user: CurrentUser) => {
    localStorage.setItem("currentUser", JSON.stringify({ ...user, email }));
    setCurrentUser({ ...user, email });
  };

  const closeAuthModal = () => {
    setAuthOpen(false);
    setOpenChatAfterAuth(false);
  };

  const handleCredentialAuth = async (mode: AuthMode, payload: AuthPayload) => {
    setAuthError("");
    setAuthBusy(true);
    const endpoint = mode === "signIn" ? AUTH_SIGNIN_PATH : AUTH_SIGNUP_PATH;
    const requestBody =
      mode === "signIn"
        ? { email: payload.email, password: payload.password, type: "email" }
        : {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            type: "email",
          };
    try {
      const response = await apiClient.post<AuthResponse>(
        endpoint,
        requestBody,
      );
      const normalized = normalizeAuth(response.data);
      const email = normalized.email ?? payload.email;
      persistUser(email, { ...normalized, email });
      if (openChatAfterAuth) {
        setChatRoomOpen(true);
        setOpenChatAfterAuth(false);
      }
    } catch (error) {
      const message = parseApiError(error);
      setAuthError(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setAuthError("");
    setAuthBusy(true);
    try {
      const googleProfile = parseGoogleCredentialPayload(credential);
      const emailHint = googleProfile.email ?? "google.user@culturemind.local";
      const loginBody = {
        type: "google",
        email: emailHint,
        password: credential,
      };

      let response: AuthResponse;
      try {
        const loginResponse = await apiClient.post<AuthResponse>(
          AUTH_GOOGLE_PATH,
          loginBody,
        );
        response = loginResponse.data;
      } catch (loginError) {
        const statusCode = axios.isAxiosError(loginError)
          ? loginError.response?.status
          : undefined;
        if (statusCode !== 401) {
          throw loginError;
        }

        try {
          await apiClient.post(AUTH_SIGNUP_PATH, loginBody);
        } catch (signupError) {
          const signupStatusCode = axios.isAxiosError(signupError)
            ? signupError.response?.status
            : undefined;
          if (signupStatusCode !== 400) {
            throw signupError;
          }
        }

        const retryLoginResponse = await apiClient.post<AuthResponse>(
          AUTH_GOOGLE_PATH,
          loginBody,
        );
        response = retryLoginResponse.data;
      }

      const normalized = normalizeAuth(response);
      const tokenPayload = normalized.token
        ? parseJwtPayload(normalized.token)
        : null;
      const tokenEmail =
        typeof tokenPayload?.sub === "string" ? tokenPayload.sub : undefined;
      const email = normalized.email ?? googleProfile.email ?? tokenEmail;
      const name = normalized.name;

      if (!email) {
        throw new Error(
          "Google authentication succeeded but no email was available.",
        );
      }

      persistUser(email, { ...normalized, email, name });
      if (openChatAfterAuth) {
        setChatRoomOpen(true);
        setOpenChatAfterAuth(false);
      }
    } catch (error) {
      const message = parseApiError(error);
      setAuthError(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = () => {
    void apiClient.post("/auth/signout").catch(() => {});
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setAuthError("");
  };

  const handleTryOutChatbotClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setChatRoomOpen(true);
  };
  

  if (chatRoomOpen) {
    return (
      <div className="min-h-screen text-slate-800">
        <AuthModal
          isOpen={authOpen}
          onClose={closeAuthModal}
          onCredentialSubmit={handleCredentialAuth}
          onGoogleSubmit={handleGoogleAuth}
        />
        {authError ? (
          <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6">
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authError}
            </p>
          </div>
        ) : null}
        <ChatRoom
          isSignedIn={Boolean(currentUser)}
          isSubscribed={Boolean(currentUser?.subscriptionActive)}
          onBack={() => setChatRoomOpen(false)}
          onSubscriptionActivated={(subscription) => {
            if (!currentUser?.email) {
              return;
            }
            persistUser(currentUser.email, {
              ...currentUser,
              subscriptionActive: Boolean(subscription.active),
              subscriptionProvider: subscription.provider ?? null,
            });
          }}
          onRequireSignIn={() => {
            setAuthError(
              "You reached 4 free chats today. Sign in and subscribe to continue chatting.",
            );
            setOpenChatAfterAuth(false);
            setAuthOpen(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800">
      <AuthModal
        isOpen={authOpen}
        onClose={closeAuthModal}
        onCredentialSubmit={handleCredentialAuth}
        onGoogleSubmit={handleGoogleAuth}
      />

      <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(2,132,199,0.45)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a
            className="flex items-center gap-2.5 text-lg font-semibold text-slate-900"
            href="#home-section"
          >
            <span
              aria-hidden="true"
              className="relative h-9 w-9 overflow-hidden rounded-lg border border-sky-300/70 bg-white/80 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
            >
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-contain [clip-path:inset(0_50%_0_0)]"
                src="/images/logo.png"
                style={{
                  filter:
                    "brightness(2.8) saturate(2.3) hue-rotate(172deg) drop-shadow(0 0 7px rgba(56,189,248,0.92))",
                }}
              />
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-contain [clip-path:inset(0_0_0_50%)]"
                src="/images/logo.png"
                style={{
                  filter:
                    "brightness(2.05) saturate(1.85) hue-rotate(180deg) drop-shadow(0 0 5px rgba(14,165,233,0.62))",
                }}
              />
            </span>
            <span>Culture Mind</span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                className="text-sm font-medium text-slate-600 transition hover:text-sky-700"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {currentUser ? (
              <>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/70 bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-200/70"
                  title={currentUser.email}
                >
                  {userInitial}
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-white/85 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
                  onClick={handleSignOut}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200/80 transition hover:brightness-110"
                onClick={() => {
                  setOpenChatAfterAuth(false);
                  setAuthOpen(true);
                }}
                type="button"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            className="rounded-xl p-2 text-slate-600 transition hover:bg-sky-100/80 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-sky-200 bg-white/95 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  className="rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-sky-100/80"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                className="mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-left text-sm font-semibold text-white"
                onClick={() => {
                  setOpenChatAfterAuth(false);
                  setAuthOpen(true);
                  setMobileOpen(false);
                }}
                type="button"
              >
                {currentUser ? "Account" : "Sign In"}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      {authError ? (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6">
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {authError}
          </p>
        </div>
      ) : null}

      <main className={authBusy ? "pointer-events-none opacity-90" : ""}>
        <section
          className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6"
          id="home-section"
        >
          <div
            className="relative isolate aspect-[3/2] overflow-hidden rounded-[2rem] border border-cyan-300/20 shadow-[0_30px_90px_-35px_rgba(8,145,178,0.7)] sm:aspect-[16/10] md:aspect-[3/2]"
            data-reveal
            style={{
              backgroundImage: "url('/images/hero/hero-background.png')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
            }}
          >
            {/* <Player
                  autoplay
                  className="h-full w-full opacity-50"
                  loop

                  src={backgroundWaveAnimation}
                  style={{ height: "100%", width: "100%" }}
                /> */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/30 to-slate-950/48" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,0.16),transparent_34%)]" />

            <p className="absolute left-4 top-4 inline-flex items-center rounded-full border border-cyan-200/50 bg-slate-900/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur sm:left-6 sm:top-6">
              Non-Profit AI Research
            </p>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                The Future Is AI
              </h1>
              <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
                Our platform is built for thinkers, creators, and disruptors.
                Tap into real-time machine learning, natural language
                processing, and powerful AI APIs that push boundaries. The
                future isn&apos;t coming - it&apos;s already here.
              </p>

              <h2 className="mt-10 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                We Build{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-blue-200 bg-clip-text text-transparent">
                  {typedHeroWord}
                </span>
                <span
                  aria-hidden="true"
                  className={`ml-1 inline-block h-[1em] w-[2px] bg-cyan-200 align-[-0.1em] ${
                    authOpen ? "" : "animate-pulse"
                  }`}
                />
              </h2>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
                  href="#services-section"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  className="rounded-xl border border-cyan-100/45 bg-slate-900/35 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-slate-800/65"
                  href="#"
                  onClick={handleTryOutChatbotClick}
                >
                  Try Out Chatbot
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" data-reveal>
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="relative isolate overflow-hidden rounded-3xl px-2 py-3 sm:px-4">
              {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/92 via-white/84 to-white/76" /> */}
              <div className="relative z-10">
                <SectionHeading
                  centered={false}
                  eyebrow="For Children"
                  title="Flagship"
                  description="Our mission is to guide children with kind, personal AI support so they stay on the right path, build confidence, and grow safely."
                />
                <Player
                  autoplay
                  className="h-full w-full"
                  loop
                  src={aiAnimation}
                  style={{ height: "320px", width: "100%" }}
                />
              </div>
            </div>
            <div className="mx-auto w-full max-w-[360px]">
              <img
                alt=""
                aria-hidden="true"
                className="pointer-events-none inset-0 h-full w-full object-cover"
                src={happyChildrenImage}
              />
            </div>
          </div>
        </section>

        <section
          className="relative border-y border-sky-100/90 bg-gradient-to-b from-white/75 via-sky-50/65 to-white/85 py-16"
          id="services-section"
          data-reveal
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.14),transparent_34%)]" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              centered
              description="End-to-end delivery from data to design, with responsible AI practices integrated from day one."
              eyebrow="Capabilities"
              title="Our Services"
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  className="rounded-2xl border border-sky-100 bg-white/92 p-6 shadow-[0_20px_40px_-28px_rgba(14,116,144,0.4)] transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white"
                  key={service.title}
                  data-reveal
                >
                  <div className="mb-4 inline-flex rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-600">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center"
          id="about-section"
          data-reveal
        >
          <div
            className="rounded-[2rem] border border-sky-100 bg-white/92 p-3 shadow-[0_24px_52px_-34px_rgba(14,116,144,0.45)]"
            data-reveal
          >
            <img
              alt="About Culture Mind"
              className="h-full w-full rounded-3xl object-cover"
              src="/images/about/about.jpg"
            />
          </div>
          <div data-reveal>
            <SectionHeading
              description="CultureMind is a non-profit generative AI research group committed to democratizing innovation through global collaboration."
              eyebrow="Who We Are"
              title="About Us"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article
                className="rounded-2xl border border-sky-100 bg-white/92 p-5 shadow-[0_16px_36px_-28px_rgba(14,116,144,0.45)]"
                data-reveal
              >
                <Users className="h-6 w-6 text-sky-600" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  Community Collaboration
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Community-led development keeps our systems practical,
                  resilient, and useful.
                </p>
              </article>
              <article
                className="rounded-2xl border border-sky-100 bg-white/92 p-5 shadow-[0_16px_36px_-28px_rgba(14,116,144,0.45)]"
                data-reveal
              >
                <Brain className="h-6 w-6 text-sky-600" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  Responsible AI
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  We prioritize transparency, safety, and accountability in each
                  model lifecycle.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="border-y border-sky-100/90 bg-gradient-to-b from-white/85 via-sky-50/45 to-white/90 py-16"
          id="blog-section"
          data-reveal
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading centered eyebrow="Insights" title="From the Blog" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <article
                  className="overflow-hidden rounded-2xl border border-sky-100 bg-white/92 shadow-[0_20px_40px_-28px_rgba(14,116,144,0.4)] transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white"
                  key={article.href}
                  data-reveal
                >
                  <img
                    alt={article.title}
                    className="h-48 w-full object-cover"
                    src={article.image}
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold leading-snug text-slate-900">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500">
                      {article.meta}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      {article.excerpt}
                    </p>
                    <a
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                      href={article.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Continue Reading
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" id="contact-section" data-reveal>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading centered eyebrow="Let's Talk" title="Contact Us" />
            <form
              className="mx-auto mt-10 grid max-w-3xl gap-4 rounded-3xl border border-sky-100 bg-white/92 p-6 shadow-[0_24px_52px_-34px_rgba(14,116,144,0.45)] md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                window.alert(
                  "Thanks. Your message has been captured in this React demo form.",
                );
              }}
              data-reveal
            >
              <InputField id="firstName" label="First Name" />
              <InputField id="lastName" label="Last Name" />
              <div className="md:col-span-2">
                <InputField id="email" label="Email" type="email" />
              </div>
              <div className="md:col-span-2">
                <InputField id="subject" label="Subject" />
              </div>
              <div className="md:col-span-2">
                <InputField id="message" label="Message" textarea />
              </div>
              <button
                className="md:col-span-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                type="submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer
        className="border-t border-slate-800/80 bg-slate-950/90 py-12 text-slate-200"
        data-reveal
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Our Location</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60 shadow-lg shadow-slate-950/35">
              <iframe
                className="h-44 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=373%20Lossie%20Lane%2C%20McDonough%2C%20GA%2030253&z=16&output=embed"
                title="Culture Mind location map"
              />
              <p className="text-center">373 Lossie Lane, McDonough, GA, 30253</p>
            </div>
            <a
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              href="https://maps.google.com/?q=373%20Lossie%20Lane%2C%20McDonough%2C%20GA%2030253"
              rel="noreferrer"
              target="_blank"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-sm text-slate-300">
              contact@culturemind.org
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">About</h3>
            <p className="mt-3 text-sm text-slate-300">
              CultureMind is a non-profit generative AI research organization
              building open, collaborative AI systems.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <a
              className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-200"
              href="tel:+14708099255"
            >
              <Phone className="h-4 w-4" /> +1 470 809 9255
            </a>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="footer-kid-image-wrap">
              <img
                alt="Culture Mind supporting children"
                src={cmLovingChildrenImage}
              />
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl px-4 text-sm text-slate-400 sm:px-6">
          Copyright {new Date().getFullYear()} Culture Mind. All rights
          reserved.
        </p>
      </footer>

      {showScrollTop ? (
        <button
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/30 bg-slate-950/90 text-cyan-100 shadow-lg shadow-cyan-900/35 transition hover:bg-slate-800"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          type="button"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
