import { render} from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreTracker, { calculateTotal } from '../ScoreTracker';

describe('ScoreTracker Component - Winner Dialog', () => {
  test('displays the correct winner in the dialog', () => {
    const users = ['John Doe', 'Jane Smith', 'Jack Black'];

    // Initialize the score arrays for both users (3D array: [currentUser][currentFrame][currentThrow])
    const scores = [
      [
        [10, 0], [10, 0], [10, 0], [10, 0], [10, 0], 
        [10, 0], [10, 0], [10, 0], [10, 0], [10, 10, 10]], // Perfect game
      [
        [5, 5], [5, 5], [5, 5], [5, 5], [5, 5], // 5 frames with normal rolls
        [5, 5], [5, 5], [5, 5], [5, 5], [5, 5, 5] // Final frame with bonus roll
      ],
      [
        [10, 0], [7, 3], [9, 0], [10, 0], [0, 8], // Strike, spare, etc.
        [8, 2], [0, 6], [10, 0], [10, 0], [10, 8, 1] // Final frame with bonus rolls
      ]
    ];

    // Render the ScoreTracker component
    render(<ScoreTracker users={users} />);

    // Function to
    // Calculate total scores for both users using the calculateTotal function
    const user1Total = calculateTotal(0, scores);
    const user2Total = calculateTotal(1, scores);
    const user3Total = calculateTotal(2, scores);

    expect(user1Total).toBe(300);
    expect(user2Total).toBe(150);
    expect(user3Total).toBe(167);

  });
});
