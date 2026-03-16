import React, { useState } from "react";
import axios from "axios";
import { config } from "./config";
import { SpinnerRing } from "./SpinnerRing";
import parseApiError from "../utils/parseApiError";

interface ChatResponse {
  reply: string;
  userMessage?: string;
}

interface ChatbotProps {
  addMessage: (
    type: "user" | "bot",
    content: string,
    question?: string,
    answer?: string,
  ) => void;
  canSendMessage: boolean;
  onSuccessfulResponse: () => void;
  onQuotaBlocked: (message: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({
  addMessage,
  canSendMessage,
  onSuccessfulResponse,
  onQuotaBlocked,
}) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !canSendMessage) {
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    addMessage("user", userMessage);

    try {
      const response = await axios.post<ChatResponse>(config.apiChatUrl, {
        content: userMessage,
      });

      addMessage(
        "bot",
        `${response.data.reply}`,
        response.data.userMessage,
        response.data.reply,
      );
      onSuccessfulResponse();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code;
        const detail = parseApiError(error);

        if (code === "SUBSCRIPTION_REQUIRED") {
          addMessage("bot", detail);
          onQuotaBlocked(detail);
          return;
        }
      }

      addMessage("bot", "Sorry, there was an error with the chatbot.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="message-form">
        <div
          className={`input-wrapper ${isFocused ? "focused" : ""} ${isLoading ? "loading" : ""}`}
        >
          <textarea
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              canSendMessage
                ? "Message CultureMind AI..."
                : "Free daily limit reached. Sign in and subscribe to continue."
            }
            rows={1}
            disabled={isLoading || !canSendMessage}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading || !canSendMessage}
            className="send-button"
            title="Send message (Enter)"
          >
            {isLoading ? (
              <SpinnerRing size={24} color="#fff" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16394210 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            )}
          </button>
        </div>
      </form>
      <p className="footer-text">
        CultureMind AI may make mistakes. Please verify important information.
      </p>
    </div>
  );
};

export default Chatbot;
