import { useState } from "react";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { api } from "@shared/routes";
import "@/lib/firebase"; // Initialize Firebase

export default function Home() {
  const [content, setContent] = useState("");
  const { data: messages, isLoading, isError } = useMessages();
  const createMessage = useCreateMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMessage.mutate(
      { content, isSystem: false },
      {
        onSuccess: () => setContent(""),
      }
    );
  };

  const status = isError ? "Disconnected" : isLoading ? "Connecting..." : "Connected";
  const statusColor = isError ? "text-red-600" : isLoading ? "text-yellow-600" : "text-green-600";

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Server Connection Test</h1>
      
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
        <p className="font-medium">
          Status: <span className={statusColor}>{status}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Endpoint: {api.messages.list.path}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="space-y-2 border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <p className="text-gray-500">Loading messages...</p>
          ) : messages?.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages?.map((msg) => (
              <div key={msg.id} className="p-2 bg-white border rounded shadow-sm">
                <span className="text-gray-800">{msg.content}</span>
                {msg.isSystem && <span className="ml-2 text-xs text-blue-500">(System)</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message to test connection..."
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
          disabled={createMessage.isPending}
        />
        <button
          type="submit"
          disabled={createMessage.isPending}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {createMessage.isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
