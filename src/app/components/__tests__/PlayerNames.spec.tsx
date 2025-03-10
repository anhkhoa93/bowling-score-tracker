import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../page';
// Mock UserManagement components
// Define the type for the props
interface UserManagementProps {
  onStartGame: () => void; // Function to start the game
}

jest.mock('../UserManagement', () => {
  const MockUserManagement = (props: UserManagementProps) => (
    <div data-testid="user-management">
      <button onClick={() => props.onStartGame()} data-testid="start-game-button">
        Start Game
      </button>
    </div>
  );

  MockUserManagement.displayName = 'UserManagement'; // Adding display name here
  return MockUserManagement;
});



describe('Home Page', () => {
  test('renders the title', () => {
    render(<Home />);

    expect(screen.getByText(/Bowling Score Tracker/i)).toBeInTheDocument();
  });

  test('The game should not start until all player names are entered.', async () => {
    render(<Home />);

    // Click the Start Game button
    fireEvent.click(screen.getByTestId('start-game-button'));

    // Wait for error dialog to appear
    expect(await screen.findByText(/Please add at least one user/i)).toBeInTheDocument();
  });

  test('closes error dialog when clicking OK', async () => {
    render(<Home />);

    // Click Start Game button to trigger error
    fireEvent.click(screen.getByTestId('start-game-button'));

    // Ensure error message appears
    expect(await screen.findByText(/Please add at least one user/i)).toBeInTheDocument();

    // Click the "Ok" button
    fireEvent.click(screen.getByTestId('show-error-button'));

    // Ensure error message disappears
    expect(screen.queryByText(/Please add at least one user/i)).not.toBeInTheDocument();
  });

});
