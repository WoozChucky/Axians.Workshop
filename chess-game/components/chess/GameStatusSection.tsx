import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface GameStatusSectionProps {
  gameStatus: string
  gameSessionId: string
  fen: string
  isThinking: boolean
  turn: "w" | "b"
  playerColor: "w" | "b"
}

export function GameStatusSection({
  gameStatus,
  gameSessionId,
  fen,
  isThinking,
  turn,
  playerColor
}: GameStatusSectionProps) {
  return (
    <Card className="p-4 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
        <div className="space-y-2">
          <div className="text-sm font-mono bg-gray-100 p-2 rounded-md break-all">
            Session ID: {gameSessionId}
          </div>
          <div className="text-sm font-mono bg-gray-100 p-2 rounded-md break-all">
            FEN: {fen}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Game Status</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant={gameStatus === "ongoing" ? "outline" : "default"}
            className={gameStatus !== "ongoing" ? "bg-orange-500" : ""}
          >
            {gameStatus === "ongoing" ? (
              <>
                {turn === "w" ? "White" : "Black"}'s turn
                {isThinking && turn !== playerColor && " (Thinking...)"}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Trophy size={16} />
                {gameStatus}
              </div>
            )}
          </Badge>
        </div>
      </div>
    </Card>
  )
} 