import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./ChatRoom.css";
import Chatbot from "./Chatbot";
import ChatHistory from "./ChatHistory";
import parseApiError from "../utils/parseApiError";
import getDeviceId from "../utils/deviceId";
import {
  LOCAL_DAILY_CHAT_LIMIT,
  getDailyQuotaSnapshot,
  incrementDailyQuotaUsage,
  lockDailyQuota,
} from "../utils/localChatQuota";
import { config } from "./config";

export interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  question?: string;
  answer?: string;
  timestamp: Date;
}

export type SubscriptionInfo = {
  active: boolean;
  provider?: string | null;
  plan?: string;
  priceUsd?: number;
};

export type ChatQuota = {
  date: string;
  limit: number;
  used: number;
  remaining: number;
  requiresSubscription: boolean;
  isSignedIn: boolean;
  isSubscribed: boolean;
  subscription?: SubscriptionInfo;
};

type SubscribeResponse = {
  message?: string;
  subscription: SubscriptionInfo;
};

type ChatRoomProps = {
  onBack?: () => void;
  isSignedIn: boolean;
  isSubscribed: boolean;
  onRequireSignIn: () => void;
  onSubscriptionActivated?: (subscription: SubscriptionInfo) => void;
};

const CHAT_HISTORY_KEY = "chatHistory";

function loadMessages(): Message[] {
  const raw = localStorage.getItem(CHAT_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          msg,
        ): msg is {
          id: string;
          type: "user" | "bot";
          content: string;
          question?: string;
          answer?: string;
          timestamp?: string;
        } => {
          return (
            typeof msg === "object" &&
            msg !== null &&
            typeof msg.id === "string" &&
            (msg.type === "user" || msg.type === "bot") &&
            typeof msg.content === "string"
          );
        },
      )
      .map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        question: typeof msg.question === "string" ? msg.question : undefined,
        answer: typeof msg.answer === "string" ? msg.answer : undefined,
        timestamp: new Date(msg.timestamp ?? Date.now()),
      }));
  } catch {
    return [];
  }
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  onBack,
  isSignedIn,
  isSubscribed,
  onRequireSignIn,
  onSubscriptionActivated,
}) => {
  const [deviceId] = useState<string>(() => getDeviceId());
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [quota, setQuota] = useState<ChatQuota | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(isSubscribed);
  const [billingBusy, setBillingBusy] = useState<null | "card" | "paypal">(
    null,
  );
  const [billingMessage, setBillingMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const refreshQuota = useCallback(() => {
    const snapshot = getDailyQuotaSnapshot(deviceId, LOCAL_DAILY_CHAT_LIMIT);
    const remaining = subscriptionActive
      ? LOCAL_DAILY_CHAT_LIMIT
      : snapshot.remaining;

    setQuota({
      date: snapshot.date,
      limit: LOCAL_DAILY_CHAT_LIMIT,
      used: snapshot.used,
      remaining,
      requiresSubscription: !subscriptionActive && remaining <= 0,
      isSignedIn,
      isSubscribed: subscriptionActive,
      subscription: {
        active: subscriptionActive,
      },
    });
  }, [deviceId, isSignedIn, subscriptionActive]);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  useEffect(() => {
    setSubscriptionActive(isSubscribed);
  }, [isSubscribed]);

  const addMessage = (
    type: "user" | "bot",
    content: string,
    question?: string,
    answer?: string,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      question,
      answer,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      setMessages([]);
    }
  };

  const handleSuccessfulResponse = () => {
    if (!subscriptionActive) {
      incrementDailyQuotaUsage(deviceId, LOCAL_DAILY_CHAT_LIMIT);
    }
    refreshQuota();
  };

  const handleQuotaBlocked = (message: string) => {
    setBillingMessage(message);
    if (!subscriptionActive) {
      lockDailyQuota(deviceId, LOCAL_DAILY_CHAT_LIMIT);
    }
    refreshQuota();
  };

  const handleSubscribe = async (provider: "card" | "paypal") => {
    const signedIn = quota?.isSignedIn ?? isSignedIn;
    if (!signedIn) {
      onRequireSignIn();
      return;
    }

    setBillingBusy(provider);
    setBillingMessage("");
    try {
      const response = await axios.post<SubscribeResponse>(
        `${config.apiBaseUrl}/billing/subscribe`,
        { provider },
      );
      setSubscriptionActive(Boolean(response.data.subscription.active));
      setBillingMessage(
        response.data.message || "Subscription activated successfully.",
      );
      onSubscriptionActivated?.(response.data.subscription);
      refreshQuota();
    } catch (error) {
      setBillingMessage(parseApiError(error));
    } finally {
      setBillingBusy(null);
    }
  };

  const limit = quota?.limit ?? LOCAL_DAILY_CHAT_LIMIT;
  const remaining = quota?.remaining ?? limit;
  const guestLimitReached = Boolean(quota?.requiresSubscription);
  const signedIn = quota?.isSignedIn ?? isSignedIn;
  const canSendMessage = !guestLimitReached;

  return (
    <div className="app-container">
      {onBack ? (
        <button className="back-btn" onClick={onBack} type="button">
          Back to Main Page
        </button>
      ) : null}
      <div className="chat-container">
        <div
          className={`quota-banner ${subscriptionActive ? "quota-banner-active" : ""}`}
        >
          {subscriptionActive ? (
            <p>Subscription active. You have unlimited chats on this account.</p>
          ) : (
            <p>
              Free chats left today on this computer: <strong>{remaining}</strong>{" "}
              / {limit}
            </p>
          )}
        </div>
        {guestLimitReached ? (
          <div className="quota-lock">
            <p>
              You have used all free chats for today. Sign in and subscribe to
              continue with unlimited access.
            </p>

            {!signedIn ? (
              <button className="quota-lock-btn" onClick={onRequireSignIn} type="button">
                Sign In to Subscribe
              </button>
            ) : (
              <div className="quota-lock-actions">
                <button
                  className="quota-lock-btn"
                  disabled={billingBusy !== null}
                  onClick={() => void handleSubscribe("card")}
                  type="button"
                >
                  {billingBusy === "card"
                    ? "Activating..."
                    : "Subscribe with Card (Visa/Mastercard)"}
                </button>
                <button
                  className="quota-lock-btn quota-lock-btn-secondary"
                  disabled={billingBusy !== null}
                  onClick={() => void handleSubscribe("paypal")}
                  type="button"
                >
                  {billingBusy === "paypal"
                    ? "Activating..."
                    : "Subscribe with PayPal"}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {billingMessage ? <p className="quota-info">{billingMessage}</p> : null}

        <ChatHistory messages={messages} />
        <Chatbot
          addMessage={addMessage}
          canSendMessage={canSendMessage}
          onQuotaBlocked={handleQuotaBlocked}
          onSuccessfulResponse={handleSuccessfulResponse}
        />
      </div>
      {messages.length > 0 && (
        <button className="clear-btn" onClick={clearHistory}>
          Clear History
        </button>
      )}
    </div>
  );
};

export default ChatRoom;
