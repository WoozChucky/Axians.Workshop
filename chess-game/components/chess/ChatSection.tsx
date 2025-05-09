import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import axios from "axios"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatSectionProps {
  gameSessionId: string
  fen: string
  moveHistory: string[]
}

export function ChatSection({ gameSessionId, fen, moveHistory }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isAiResponding, setIsAiResponding] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsAiResponding(true)

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        Message: userMessage,
        SessionId: gameSessionId,
        FEN: fen,
        moveHistory: moveHistory
      })

      console.log(response.data);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data }])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again." 
      }])
    } finally {
      setIsAiResponding(false)
    }
  }

  return (
    <Card className="p-4 shadow-lg h-[600px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Chat with AI</h2>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-4' 
                : 'bg-gray-100 mr-4'
            }`}
          >
            {message.role === 'user' ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <div className="text-sm prose prose-sm max-w-none">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {isAiResponding && (
          <div className="bg-gray-100 p-3 rounded-lg mr-4">
            <p className="text-sm">Thinking...</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about the game..."
          className="flex-1 p-2 border rounded-md"
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isAiResponding || !newMessage.trim()}
          className="px-4"
        >
          <Send size={16} />
        </Button>
      </div>
    </Card>
  )
} 