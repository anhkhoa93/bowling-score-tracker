import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../page';

// Define the types for the props
interface UserManagementProps {
  users: string[];
  setUsers: (users: string[]) => void;
  onStartGame: () => void;
}

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (callback: () => Promise<any>) => {
    let Component: any;
    callback().then((module: any) => {
      Component = module.default || module;
    });
    
    const DynamicComponent = (props: any) => {
      return Component ? <Component {...props} /> : null;
    };
    DynamicComponent.preload = jest.fn();
    return DynamicComponent;
  }
}));

// Mock ErrorDialog component
jest.mock('../ErrorDialog', () => {
  const MockErrorDialog = ({ error, onClose }: { error: string | null, onClose: () => void }) => (
    <div data-testid="error-dialog">
      {error && (
        <>
          <p data-testid="error-message">{error}</p>
          <button onClick={onClose} data-testid="close-error-button">
            Close
          </button>
        </>
      )}
    </div>
  );
  MockErrorDialog.displayName = 'ErrorDialog';
  return MockErrorDialog;
});

// Mock UserManagement component
jest.mock('../UserManagement', () => {
  const MockUserManagement = (props: UserManagementProps) => (
    <div data-testid="user-management">
      <input
        data-testid="username-input"
        placeholder="Enter name"
        onChange={(e) => props.setUsers([e.target.value])}
      />
      <button onClick={() => props.onStartGame()} data-testid="start-game-button">
        Start Game
      </button>
    </div>
  );
  MockUserManagement.displayName = 'UserManagement';
  return MockUserManagement;
});

// Mock ScoreTracker component
jest.mock('../ScoreTracker', () => {
  const MockScoreTracker = ({ users }: { users: string[] }) => (
    <div data-testid="score-tracker">
      <span>Score Tracker for {users.join(', ')}</span>
    </div>
  );
  MockScoreTracker.displayName = 'ScoreTracker';
  return MockScoreTracker;
});

describe('Home Page', () => {
  test('renders the title', async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText(/Bowling Score Tracker/i)).toBeInTheDocument();
  });

  test('The game should not start until all player names are entered.', async () => {
    await act(async () => {
      render(<Home />);
    });

    // Click the Start Game button without adding users
    await act(async () => {
      fireEvent.click(screen.getByTestId('start-game-button'));
    });

    // Wait for error dialog to appear
    expect(screen.getByTestId('error-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent(/Please add at least one user/i);
  });

  test('closes error dialog when clicking Close button', async () => {
    await act(async () => {
      render(<Home />);
    });

    // Click Start Game button to trigger error
    await act(async () => {
      fireEvent.click(screen.getByTestId('start-game-button'));
    });

    // Ensure error message appears
    expect(screen.getByTestId('error-message')).toHaveTextContent(/Please add at least one user/i);

    // Click the "Close" button
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-error-button'));
    });

    // Ensure error message disappears
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
