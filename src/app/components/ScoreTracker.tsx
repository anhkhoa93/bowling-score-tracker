"use client";

import { useState, useEffect } from 'react';

interface ScoreTrackerProps {
  users: string[];
}

// Update all value with 10 to use MAX_POINTS
const MAX_POINTS = 10;
const MAX_FRAME = 10;

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
};

export default function ScoreTracker({ users }: ScoreTrackerProps) {
  // Initialize scores based on users
  const initializeScores = () => {
    return Array.from({ length: users.length }, () =>
      Array.from({ length: MAX_POINTS }, () => [0, 0, 0]) // Third value for 10th frame bonus
    );
  };

  const [scores, setScores] = useState<number[][][]>(initializeScores());

  // Sync scores with users whenever users change
  useEffect(() => {
    setScores(initializeScores());
  }, [users]);

  const [currentFrame, setCurrentFrame] = useState(0); // Track the current frame (0-9)
  const [currentUser, setCurrentUser] = useState(0); // Track the current user (0 to users.length - 1)
  const [currentThrow, setCurrentThrow] = useState(0); // Track the current throw (0 or 1)
  const [customScore, setCustomScore] = useState<string>(''); // Track custom score input
  const [winner, setWinner] = useState<string | null>(null);
  // Generate a random score between 1 and the remaining pins
  const generateRandomScore = (remainingPins: number) => {
    return Math.floor(Math.random() * remainingPins) + 1;
  };
  const resetGame = () => {
    window.location.reload();
  };

  // Set a random score as the default value for the custom input
  useEffect(() => {
    const frame = scores[currentUser][currentFrame];
    const remainingPins = currentThrow === 0 ? MAX_POINTS : MAX_POINTS - frame[0];
    setCustomScore(generateRandomScore(remainingPins).toString());
  }, [currentUser, currentFrame, currentThrow, scores]);


  const handleScoreSubmit = (score: number) => {
    const newScores = [...scores];
    const frame = newScores[currentUser][currentFrame];

    if (currentFrame < 9) {
      if (currentThrow === 0) {
        frame[0] = score;
        if (score === MAX_POINTS) {
          moveToNextUser();
        } else {
          setCurrentThrow(1);
        }
      } else {
        if (frame[0] + score > MAX_POINTS) return alert('Invalid Score!');
        frame[1] = score;
        setCurrentThrow(0);
        moveToNextUser();
      }
    } else {
      if (currentThrow === 0) {
        frame[0] = score;
        setCurrentThrow(1);
      } else if (currentThrow === 1) {
        frame[1] = score;
        if (frame[0] === MAX_POINTS || frame[0] + frame[1] === MAX_POINTS) {
          setCurrentThrow(2);
        } else {
          setCurrentThrow(0);
          moveToNextUser();
        }
      } else {
        frame[2] = score;
        setCurrentThrow(0);
        moveToNextUser();
      }
    }

    setScores(newScores);
  };

  const moveToNextUser = () => {
    if (currentUser < users.length - 1) {
      setCurrentUser(currentUser + 1);
    } else {
      setCurrentUser(0);
      if (currentFrame < 9) {
        setCurrentFrame(currentFrame + 1);
      } else {
        const scoresList = users.map((_, userIndex) => calculateTotal(userIndex, scores)); // Calculate scores for all players
        const maxScore = Math.max(...scoresList); // Find the maximum score

        // Find all players who have the maximum score (in case of a tie)
        const winnerIndices = scoresList
          .map((score, index) => (score === maxScore ? index : -1))  // Find indices of all players with the max score
          .filter(index => index !== -1);  // Filter out invalid indices

        // Return the winners based on the indices
        const winners = winnerIndices.map(index => users[index]);

        setWinner(winners.toString()); // Set the winners (can be a list of one or more players)
      }
    }
  };


  // Get the display value for a frame
  const getFrameDisplay = (frame: number[], frameIndex: number): string[] => {

    const isStrike = (pins: number) => pins === MAX_POINTS;
    const isSpare = (first: number, second: number) => first + second === MAX_POINTS && first !== MAX_POINTS;

    const display = [];
    // First throw
    if (isStrike(frame[0])) {
      display.push('X'); // Strike
      if (frameIndex < 9) {
        // Next throw is no need to display
        display.push('-');
        return display;
      }
    } else {
      display.push(frame[0].toString());
    }

    // Second throw
    if (isStrike(frame[1])) {
      display.push('X'); // Strike (only in 10th frame)
    } else if (isSpare(frame[0], frame[1])) {
      display.push('/'); // Spare
    } else {
      display.push(frame[1].toString());
    }

    if (frameIndex < 9) {
      // Frames 1-9
      return display;

    } else {
      // Frame 10


      // Third throw (only in 10th frame)
      if (frame.length === 3) {
        if (isStrike(frame[2])) {
          display.push('X');
        } else {
          display.push(frame[2].toString());
        }
      }

      return display;
    }
  };

  return (
    <div className="p-6 bg-gray-100 text-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-black">Score Tracker</h2>

      {/* Winner Section */}
      {winner && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold">Congratulations!</h2>
            <p className="text-lg mt-2">Winner: <span className="font-bold text-green-600">{winner}</span></p>
            <button onClick={resetGame} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Restart Game</button>
          </div>
        </div>
      )}

      {/* Score Input Section */}
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
                  className={`flex-1 bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600 ${i + 1 > maxScore ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex space-x-2">
            <input
              name="input-score"
              data-testid="input-score"
              type="number"
              min="1"
              max="10"
              placeholder=""
              value={customScore}
              onChange={(e) => setCustomScore(e.target.value)}
              className="flex-1 p-2 border border-gray-400 rounded text-black"
            />
            <button
              onClick={() => {
                const score = parseInt(customScore, MAX_POINTS);
                // score = get score from input
                if (score >= 1 && score <= MAX_POINTS) {
                  handleScoreSubmit(score);
                  setCustomScore(generateRandomScore(MAX_POINTS).toString()); // Reset to a new random score
                }
              }}
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Scoreboard Section */}
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
                <td className={`p-2 max-w-[10ch] truncate font-bold border border-gray-400 ${userIndex === currentUser ? 'bg-yellow-300 text-black' : ''}`}>{user}</td>
                {scores[userIndex].map((frame, frameIndex) => (
                  <td key={frameIndex} className={`p-3 border border-gray-400 ${userIndex === currentUser && frameIndex === currentFrame ? 'bg-yellow-200 text-black' : ''}`}>
                    <div className="flex justify-between text-black">
                      {getFrameDisplay(frame, frameIndex).map((value, index) => (
                        <span key={index}>{value}</span>
                      ))}
                    </div>
                  </td>
                ))}
                <td className="p-3 font-bold border border-gray-400">{calculateTotal(userIndex, scores)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}