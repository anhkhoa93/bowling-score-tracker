import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreTracker from '../ScoreTracker';

describe('ScoreTracker Component', () => {
  test('The total score should be updated in real-time as scores are entered', () => {
    const users = ['John Doe'];
    render(<ScoreTracker users={users} />);

    const totalScoreCell = screen.getAllByRole('cell').pop(); // Last cell in the table

    // Get the input field for entering scores
    const scoreInput = screen.getByTestId('input-score');

    // Enter first score (5)
    fireEvent.change(scoreInput, { target: { value: '5' } });
    fireEvent.click(screen.getByText(/Submit/i));

    // Verify that the total score updates to 5
    expect(totalScoreCell).toHaveTextContent('5');

    // Enter second score (3)
    fireEvent.change(scoreInput, { target: { value: '3' } });
    fireEvent.click(screen.getByText(/Submit/i));

    // Verify that the total score updates to 8
    expect(totalScoreCell).toHaveTextContent('8');
  });
  
});
