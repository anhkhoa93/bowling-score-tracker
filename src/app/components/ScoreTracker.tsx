"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import Frame from './Frame';

interface ScoreTrackerProps {
  users: string[];
  onResetGame?: () => void;
  onScoreSubmit?: (userIndex: number, frameIndex: number, throwIndex: number, score: number, scores: number[][][]) => boolean;
}

// Constants
const MAX_POINTS = 10;
const MAX_FRAME = 10;

// Extract score calculation to a separate utility function
export function calculateTotal(userIndex: number, scores: number[][][]) {
  let total = 0;

  // Loop through all 10 frames
  for (let i = 0; i < MAX_FRAME; i++) {
    const frame = scores[userIndex][i];

    // Add first and second rolls for the frame
    total += frame[0] + frame[1];

    // If strike (first roll is a strike), add the next two rolls
    if (frame[0] === MAX_POINTS && i < 9) {
      const nextFrame = scores[userIndex][i + 1];
      total += nextFrame[0] + (nextFrame[1] || scores[userIndex][i + 2]?.[0] || 0);
    }
    // If spare (frame sum equals 10), add the next roll only
    else if (frame[0] + frame[1] === MAX_POINTS && i < 9) {
      total += scores[userIndex][i + 1][0];
    }

    // For 10th frame, add the 3rd roll if it's a strike or spare
    if (i === 9) {
      total += frame[2] || 0;  // Add the third roll for 10th frame (if it exists)
    }
  }

  return total;
}

// Winner announcement component
const WinnerAnnouncement = memo(({ winner, resetGame }: { winner: string | null, resetGame: () => void }) => {
  if (!winner) return null;
  
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50" data-testid="winner-announcement" style={{ pointerEvents: 'none' }}>
      <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center max-w-md w-full" style={{ pointerEvents: 'auto' }}>
        <h2 className="text-2xl font-bold">Congratulations!</h2>
        <p className="text-lg mt-2">Winner: <span className="font-bold text-green-600">{winner}</span></p>
        <button 
          onClick={resetGame} 
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          data-testid="restart-game-button"
          style={{ position: 'relative', zIndex: 60 }}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
});
WinnerAnnouncement.displayName = 'WinnerAnnouncement';

// Score input component
const ScoreInput = memo(({ 
  currentUser, 
  currentFrame, 
  currentThrow, 
  scores, 
  customScore, 
  setCustomScore, 
  handleScoreSubmit, 
  generateRandomScore, 
  users 
}: { 
  currentUser: number;
  currentFrame: number;
  currentThrow: number;
  scores: number[][][];
  customScore: string;
  setCustomScore: (score: string) => void;
  handleScoreSubmit: (score: number) => void;
  generateRandomScore: (remainingPins: number) => number;
  users: string[];
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-black">Score Input</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-black">
            Current Frame: <span className="font-bold">{currentFrame + 1}</span>
          </p>
          <p className="text-sm font-medium text-black">
            Current User: <span className="font-bold">{users[currentUser]}</span>
          </p>
          <p className="text-sm font-medium text-black">
            Current Throw: <span className="font-bold">{currentThrow + 1}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: MAX_POINTS }, (_, i) => {
            const maxScoreFrame = currentFrame === 9 ? 2 * MAX_POINTS : MAX_POINTS;
            const remainingPins = currentThrow === 0 ? MAX_POINTS : maxScoreFrame - scores[currentUser][currentFrame][0];
            const maxScore = Math.min(remainingPins, MAX_POINTS);
            
            return (
              <button
                key={i}
                onClick={() => handleScoreSubmit(i + 1)}
                disabled={i + 1 > maxScore}
                className={`flex-1 bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
                  i + 1 > maxScore ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                data-testid={`score-button-${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            min="0"
            max="10"
            value={customScore}
            onChange={(e) => setCustomScore(e.target.value)}
            className="flex-1 p-2 border border-gray-400 rounded text-black"
            name="input-score"
            data-testid="input-score"
          />
          <button
            onClick={() => {
              const score = parseInt(customScore, 10);
              if (score >= 1 && score <= MAX_POINTS) {
                handleScoreSubmit(score);
                setCustomScore(generateRandomScore(MAX_POINTS).toString());
              }
            }}
            className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 transition-colors"
            data-testid="submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
});
ScoreInput.displayName = 'ScoreInput';

// Scoreboard component
const Scoreboard = memo(({ 
  users, 
  scores, 
  currentUser, 
  currentFrame 
}: { 
  users: string[]; 
  scores: number[][][]; 
  currentUser: number; 
  currentFrame: number; 
}) => {
  return (
    <div className="overflow-auto max-w-full">
      <h3 className="text-lg font-semibold mb-2 text-black">Scoreboard</h3>
      <table className="w-full border-collapse p-2 border border-gray-400 text-black">
        <thead>
          <tr className="bg-gray-100 border border-gray-400">
            <th className="p-2 border border-gray-400 bg-gray-300">Player</th>
            {Array.from({ length: MAX_POINTS }, (_, i) => (
              <th key={i} className={`p-3 text-black whitespace-nowrap border border-gray-400 bg-gray-300 ${i === currentFrame ? 'bg-yellow-300' : ''}`}>
                Frame {i + 1}
              </th>
            ))}
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, userIndex) => (
            <tr key={userIndex}>
              <td className={`p-2 max-w-[10ch] truncate font-bold border border-gray-400 ${userIndex === currentUser ? 'bg-yellow-300 text-black' : ''}`}>
                {user}
              </td>
              {scores[userIndex].map((frame, frameIndex) => (
                <td key={frameIndex} className="p-0 border border-gray-400">
                  <Frame 
                    frame={frame} 
                    frameIndex={frameIndex} 
                    isCurrentFrame={userIndex === currentUser && frameIndex === currentFrame} 
                  />
                </td>
              ))}
              <td className="p-3 font-bold border border-gray-400">{calculateTotal(userIndex, scores)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
Scoreboard.displayName = 'Scoreboard';

const ScoreTracker = memo(function ScoreTracker({ users, onResetGame, onScoreSubmit }: ScoreTrackerProps) {
  // Initialize scores based on users
  const initializeScores = useCallback(() => {
    return Array.from({ length: users.length }, () =>
      Array.from({ length: MAX_POINTS }, () => [0, 0, 0]) // Third value for 10th frame bonus
    );
  }, [users.length]);

  const [scores, setScores] = useState<number[][][]>(initializeScores());
  const [currentFrame, setCurrentFrame] = useState(0); // Track the current frame (0-9)
  const [currentUser, setCurrentUser] = useState(0); // Track the current user (0 to users.length - 1)
  const [currentThrow, setCurrentThrow] = useState(0); // Track the current throw (0 or 1)
  const [customScore, setCustomScore] = useState<string>(''); // Track custom score input
  const [winner, setWinner] = useState<string | null>(null);
  
  // Generate a random score between 1 and the remaining pins
  const generateRandomScore = useCallback((remainingPins: number) => {
    return Math.floor(Math.random() * remainingPins) + 1;
  }, []);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setScores(initializeScores());
    setCurrentFrame(0);
    setCurrentUser(0);
    setCurrentThrow(0);
    setWinner(null);
    if (onResetGame) {
      onResetGame();
    }
  }, [onResetGame, initializeScores]);

  // Sync scores with users whenever users change
  useEffect(() => {
    setScores(initializeScores());
  }, [users, initializeScores]);

  // Set a random score as the default value for the custom input
  useEffect(() => {
    const frame = scores[currentUser][currentFrame];
    const remainingPins = currentThrow === 0 ? MAX_POINTS : MAX_POINTS - frame[0];
    setCustomScore(generateRandomScore(remainingPins).toString());
  }, [currentUser, currentFrame, currentThrow, scores, generateRandomScore]);

  const moveToNextUser = useCallback(() => {
    if (currentUser < users.length - 1) {
      setCurrentUser(currentUser + 1);
    } else {
      setCurrentUser(0);
      if (currentFrame < 9) {
        setCurrentFrame(currentFrame + 1);
      } else {
        const scoresList = users.map((_, userIndex) => calculateTotal(userIndex, scores));
        const maxScore = Math.max(...scoresList);

        // Find all players who have the maximum score (in case of a tie)
        const winnerIndices = scoresList
          .map((score, index) => (score === maxScore ? index : -1))
          .filter(index => index !== -1);

        // Return the winners based on the indices
        const winners = winnerIndices.map(index => users[index]);
        setWinner(winners.join(', '));
      }
    }
  }, [currentUser, currentFrame, scores, users]);

  const handleScoreSubmit = useCallback((score: number) => {
    if (onScoreSubmit && !onScoreSubmit(currentUser, currentFrame, currentThrow, score, scores)) {
      return;
    }

    setScores(prevScores => {
      const newScores = JSON.parse(JSON.stringify(prevScores));
      const frame = newScores[currentUser][currentFrame];

      if (currentFrame < 9) {
        if (currentThrow === 0) {
          frame[0] = score;
          if (score === MAX_POINTS) {
            // Will move to next user after this function returns
            setCurrentThrow(0);
          } else {
            setCurrentThrow(1);
            return newScores;
          }
        } else {
          if (frame[0] + score > MAX_POINTS) {
            alert('Invalid Score!');
            return prevScores;
          }
          frame[1] = score;
          setCurrentThrow(0);
        }
      } else {
        if (currentThrow === 0) {
          frame[0] = score;
          setCurrentThrow(1);
          return newScores;
        } else if (currentThrow === 1) {
          frame[1] = score;
          if (frame[0] === MAX_POINTS || frame[0] + frame[1] === MAX_POINTS) {
            setCurrentThrow(2);
            return newScores;
          } else {
            setCurrentThrow(0);
          }
        } else {
          frame[2] = score;
          setCurrentThrow(0);
        }
      }

      return newScores;
    });

    // If we're moving to the next user, do it after state updates
    if (
      (currentThrow === 0 && score === MAX_POINTS) || // Strike
      (currentThrow === 1) || // Second throw
      (currentFrame === 9 && currentThrow === 2) // 10th frame third throw
    ) {
      setTimeout(moveToNextUser, 0);
    }
  }, [currentUser, currentFrame, currentThrow, moveToNextUser, onScoreSubmit, scores]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-black">Score Tracker</h2>

      <WinnerAnnouncement winner={winner} resetGame={resetGame} />

      <ScoreInput
        currentUser={currentUser}
        currentFrame={currentFrame}
        currentThrow={currentThrow}
        scores={scores}
        customScore={customScore}
        setCustomScore={setCustomScore}
        handleScoreSubmit={handleScoreSubmit}
        generateRandomScore={generateRandomScore}
        users={users}
      />

      <Scoreboard
        users={users}
        scores={scores}
        currentUser={currentUser}
        currentFrame={currentFrame}
      />
    </div>
  );
});

export default ScoreTracker;