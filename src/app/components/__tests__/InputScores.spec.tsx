import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../page';

// Mock UserManagement and ScoreTracker components
// Error: Component definition is missing display name  react/display-name
// Define the type for the props
interface UserManagementProps {
  setUsers: (users: string[]) => void; // Function to set users
  onStartGame: () => void;             // Function to start the game
}

jest.mock('../UserManagement', () => {
  const MockUserManagement = (props: UserManagementProps) => (
    <div data-testid="user-management">
      <input
        data-testid="user-input"
        placeholder="Enter name"
        onChange={(e) => props.setUsers([e.target.value])} // Simulates adding a user
      />
      <button onClick={() => props.onStartGame()} data-testid="start-game-button">
        Start Game
      </button>
    </div>
  );

  MockUserManagement.displayName = 'UserManagement'; // Adding display name here
  return MockUserManagement;
});



describe('Home Page', () => {
    test('There should be input fields for each frame to enter scores.', () => {
    render(<Home />);

    // Simulate adding a user
    fireEvent.change(screen.getByTestId('user-input'), { target: { value: 'John Doe' } });

    // Click Start Game button
    fireEvent.click(screen.getByTestId('start-game-button'));

    // Ensure ScoreTracker component appears
    expect(screen.getByTestId('input-score')).toBeInTheDocument();

  });
});
