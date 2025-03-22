"use client";

import { useState, useEffect, useCallback } from 'react';
import ScoreTracker, { calculateTotal } from './ScoreTracker';
import { playerApi, gameApi } from '../services/api';

interface ServerSyncScoreTrackerProps {
  users: string[];
  onResetGame?: () => void;
  gameId?: number; // Optional gameId for existing games
}

interface ApiError {
  message: string;
  timestamp: number;
}

const ServerSyncScoreTracker = ({ users, onResetGame, gameId: initialGameId }: ServerSyncScoreTrackerProps) => {
  const [gameId, setGameId] = useState<number | undefined>(initialGameId);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  // Display error message - wrap in useCallback to avoid dependency issues
  const showError = useCallback((message: string) => {
    setApiError({
      message,
      timestamp: Date.now()
    });
  }, []);

  // Create a new game on the server
  const createNewGame = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // Create a new game
      const gameData = await gameApi.create();
      setGameId(gameData.id);
      
      // Add players to the game
      await Promise.all(
        users.map(async (userName) => {
          try {
            // Create or get the player
            const playerData = await playerApi.create(userName);
            
            // Add the player to the game
            await gameApi.addPlayer(gameData.id, playerData.id);
          } catch (error) {
            showError(error instanceof Error ? error.message : 'Unknown error');
          }
        })
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsInitializing(false);
    }
  }, [users, showError]);

  // Create a new game on the server when component mounts
  useEffect(() => {
    if (!initialGameId && users.length > 0) {
      createNewGame();
    } else {
      setIsInitializing(false);
    }
  }, [initialGameId, users.length, createNewGame]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => {
        setApiError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // Update score on the server
  const updateScore = useCallback(async (
    playerId: number, 
    frameNumber: number, 
    roll1: number, 
    roll2: number | null, 
    roll3: number | null = null, 
    frameScore: number, 
    totalScore: number
  ) => {
    if (!gameId) return;
    
    try {
      await gameApi.updateScore(gameId, {
        player_id: playerId,
        frame_number: frameNumber,
        roll_1: roll1,
        roll_2: roll2,
        roll_3: roll3,
        frame_score: frameScore,
        total_score: totalScore
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [gameId, showError]);

  // Helper function to calculate frame score for the current frame
  const calculateFrameScore = useCallback((scores: number[][][], userIndex: number, frameIndex: number, throwIndex: number, newScore: number): number => {
    const frame = [...scores[userIndex][frameIndex]];
    if (throwIndex === 0) {
      frame[0] = newScore;
    } else {
      frame[1] = newScore;
    }
    
    return frame[0] + (frame[1] || 0) + (frame[2] || 0);
  }, []);

  // Wrapper for the ScoreTracker's handleScoreSubmit
  const handleScoreSubmitWithServer = useCallback((
    userIndex: number, 
    frameIndex: number, 
    throwIndex: number, 
    score: number, 
    scores: number[][][]
  ): boolean => {
    // First, get player ID from users array (this would need to be implemented based on your app's data structure)
    // For now, we're assuming playerId equals userIndex + 1 as a placeholder
    const playerId = userIndex + 1;
    
    // Calculate the frame score and total score after this update
    const frameScore = calculateFrameScore(scores, userIndex, frameIndex, throwIndex, score);
    const totalScore = calculateTotal(userIndex, scores);
    
    // Update the score on the server asynchronously
    updateScore(
      playerId,
      frameIndex + 1, // Adjust for 0-based index
      throwIndex === 0 ? score : scores[userIndex][frameIndex][0],
      throwIndex === 0 ? null : score,
      null, // roll3 is only for 10th frame
      frameScore,
      totalScore
    );
    
    // Always return true to continue with local updates regardless of server status
    return true;
  }, [updateScore, calculateFrameScore]);

  // Reset game with server integration
  const handleResetGame = useCallback(() => {
    // Reset the local game state
    if (onResetGame) {
      onResetGame();
    }
    
    // Create a new game on the server
    createNewGame();
  }, [onResetGame, createNewGame]);

  if (isInitializing) {
    return <div className="p-6 text-center">Setting up game...</div>;
  }

  return (
    <div>
      {apiError && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4" role="alert">
          <p data-testid="server-error-message">{apiError.message}</p>
        </div>
      )}
      
      <ScoreTracker 
        users={users} 
        onResetGame={handleResetGame}
        onScoreSubmit={handleScoreSubmitWithServer}
      />
    </div>
  );
};

export default ServerSyncScoreTracker;
