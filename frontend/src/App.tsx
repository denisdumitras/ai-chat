import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import Loading from "./components/Loading";
import ErrorBanner from "./components/ErrorBanner";
import ChatInput from "./components/ChatInput";

function App() {
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string }[]
  >([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectDelay = import.meta.env.VITE_RECONNECT_DELAY;
  const maxReconnectAttempts = import.meta.env.VITE_RECONNECTION_ATTEMPTS;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } =
        messageContainerRef.current;
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 70;
    }
  };

  const handleScrollToBottom = () => {
    shouldAutoScroll.current = true;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  };

  useEffect(() => {
    if (shouldAutoScroll.current) {
      handleScrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    let currentSocket: WebSocket | null = null;
    let isMounted = true;

    const connectWebsocket = () => {
      if (!isMounted) return;

      try {
        currentSocket = new WebSocket(import.meta.env.VITE_WS_URL);

        currentSocket.onopen = () => {
          if (!isMounted) return;
          setErrorMessage(null);
          setWs(currentSocket);
          reconnectAttempts.current = 0;
        };

        currentSocket.onmessage = (event) => {
          if (!isMounted) return;

          const data = JSON.parse(event.data);
          if (data.type === "chunk") {
            setLoading(false);
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1] || {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
              };
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + data.content,
                  },
                ];
              }
              return [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: data.content,
                },
              ];
            });
          }
        };

        currentSocket.onclose = () => {
          if (!isMounted) return;

          setWs(null);
          setLoading(false);
          if (reconnectAttempts.current < maxReconnectAttempts) {
            setTimeout(connectWebsocket, reconnectDelay);
            setErrorMessage(
              `The connection was lost. Please refresh the page. ${reconnectAttempts.current} / ${maxReconnectAttempts}`
            );
            reconnectAttempts.current++;
          }
        };

        currentSocket.onerror = () => {
          setErrorMessage("An error occurred while fetching the data.");
          setLoading(false);
        };
      } catch (error) {
        setErrorMessage("An error occurred while fetching the data.");
        setLoading(false);
      }
    };

    connectWebsocket();

    return () => {
      isMounted = false;
      if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
        currentSocket.close();
      }
    };
  }, []);

  const messagesList = useMemo(() => {
    return messages.map((message) => (
      <div key={message.id} className={`message ${message.role}`}>
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    ));
  }, [messages]);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (ws && message.trim() !== "") {
        setLoading(true);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", content: message },
        ]);
        ws.send(message);
        handleScrollToBottom();
      }
    },
    [ws]
  );

  const loadingMessage = useMemo(() => {
    return loading ? <Loading /> : null;
  }, [loading]);

  return (
    <>
      <div className="chat-container">
        {errorMessage && <ErrorBanner message={errorMessage} />}
        <div
          className="chat-messages"
          ref={messageContainerRef}
          onScroll={handleScroll}
        >
          {messagesList}
          {loadingMessage}
          {messages.length > 0 && <div ref={messagesEndRef}></div>}
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!ws || loading}
        />
      </div>
    </>
  );
}

export default App;
