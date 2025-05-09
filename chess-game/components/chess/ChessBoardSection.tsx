import { Chessboard } from "react-chessboard"
import { Chess } from "chess.js"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Undo2, RotateCcw } from "lucide-react"

interface ChessBoardSectionProps {
  fen: string
  playerColor: "w" | "b"
  moveHistory: string[]
  onDrop: (sourceSquare: string, targetSquare: string) => boolean
  onReset: () => void
  onUndo: () => void
  onSwitchSides: () => void
}

export function ChessBoardSection({
  fen,
  playerColor,
  moveHistory,
  onDrop,
  onReset,
  onUndo,
  onSwitchSides
}: ChessBoardSectionProps) {
  return (
    <Card className="p-4 shadow-lg">
      <div className="w-full max-w-[600px] mx-auto">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={playerColor === "w" ? "white" : "black"}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
          <RotateCcw size={16} />
          New Game
        </Button>
        <Button
          onClick={onUndo}
          variant="outline"
          disabled={moveHistory.length < 2}
          className="flex items-center gap-2"
        >
          <Undo2 size={16} />
          Undo Move
        </Button>
        <Button onClick={onSwitchSides} variant="outline">
          Switch Sides
        </Button>
      </div>
    </Card>
  )
} 