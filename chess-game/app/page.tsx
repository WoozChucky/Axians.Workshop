"use client"

import { useState, useEffect } from "react"
import { Chess } from "chess.js"
import axios from "axios"
import { ChatSection } from "@/components/chess/ChatSection"
import { ChessBoardSection } from "@/components/chess/ChessBoardSection"
import { GameStatusSection } from "@/components/chess/GameStatusSection"

export default function ChessGame() {
  // Initialize the chess game
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w")
  const [gameStatus, setGameStatus] = useState("ongoing")
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [gameSessionId, setGameSessionId] = useState<string>("")

  // Generate a unique game session ID when the component mounts
  useEffect(() => {
    // Generate a UUID v4
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    setGameSessionId(generateUUID())
  }, [])

  // Update the board when the game changes
  useEffect(() => {
    setFen(game.fen())

    // Check for game over conditions
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setGameStatus(game.turn() === "w" ? "Black wins" : "White wins")
      } else if (game.isDraw()) {
        setGameStatus("Draw")
      } else if (game.isStalemate()) {
        setGameStatus("Stalemate")
      } else if (game.isThreefoldRepetition()) {
        setGameStatus("Draw by repetition")
      } else if (game.isInsufficientMaterial()) {
        setGameStatus("Draw by insufficient material")
      }
    } else {
      setGameStatus("ongoing")
    }
  }, [game])

  // Make computer move when it's the computer's turn
  useEffect(() => {
    const makeComputerMove = async () => {
      if (game.turn() !== playerColor && gameStatus === "ongoing" && !isThinking) {
        setIsThinking(true)
        try {

          const currentFen = game.fen()
          const validModes = game.moves();

          // Call the API to get the computer's move using axios
          const response = await axios.post("http://localhost:5022/move", {
            FEN: currentFen,
            SessionId:gameSessionId,
            PossibleMoves: validModes
          })

          console.log(response.data);

          const {valid, message, move} = response.data

          if (valid) {

            // Make the move
            const gameCopy = new Chess(game.fen())
            const result = gameCopy.move(move)

            if (result) {
              setGame(gameCopy)
              setMoveHistory([...moveHistory, formatMove(result)])
            }
          }
          else {
            console.log(message);
          }

          
        } catch (error) {
          console.error("Error getting computer move:", error)
        } finally {
          setIsThinking(false)
        }
      }
    }

    makeComputerMove()
  }, [game, playerColor, gameStatus, isThinking, moveHistory, gameSessionId])

  // Handle player moves
  function onDrop(sourceSquare: string, targetSquare: string) {
    if (game.turn() !== playerColor || gameStatus !== "ongoing") {
      return false
    }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      })

      if (move === null) {
        return false
      }

      setGame(gameCopy)
      setMoveHistory([...moveHistory, formatMove(move)])
      return true
    } catch (error) {
      return false
    }
  }

  // Format move for display
  function formatMove(move: any) {
    const { color, piece, from, to, san } = move
    return `${color === "w" ? "White" : "Black"}: ${san}`
  }

  // Reset the game
  function resetGame() {
    setGame(new Chess())
    setMoveHistory([])
    setGameStatus("ongoing")
    // Generate a new session ID for the new game
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    setGameSessionId(generateUUID())
  }

  // Undo the last two moves (player and computer)
  function undoMove() {
    if (moveHistory.length < 2) return

    const gameCopy = new Chess(game.fen())
    gameCopy.undo() // Undo computer move
    gameCopy.undo() // Undo player move

    setGame(gameCopy)
    setMoveHistory(moveHistory.slice(0, -2))
  }

  // Switch player color
  function switchSides() {
    setPlayerColor(playerColor === "w" ? "b" : "w")
    resetGame()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Chess Game</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ChatSection
            gameSessionId={gameSessionId}
            fen={fen}
            moveHistory={moveHistory}
          />
        </div>

        <div className="lg:col-span-2">
          <ChessBoardSection
            fen={fen}
            playerColor={playerColor}
            moveHistory={moveHistory}
            onDrop={onDrop}
            onReset={resetGame}
            onUndo={undoMove}
            onSwitchSides={switchSides}
          />
        </div>

        <div className="lg:col-span-1">
          <GameStatusSection
            gameStatus={gameStatus}
            gameSessionId={gameSessionId}
            fen={fen}
            isThinking={isThinking}
            turn={game.turn()}
            playerColor={playerColor}
          />
        </div>
      </div>
    </div>
  )
}
