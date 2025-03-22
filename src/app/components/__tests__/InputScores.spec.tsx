import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../page';

// Define the types for the props
interface UserManagementProps {
  users: string[];
  setUsers: (users: string[]) => void;
  onStartGame: () => void;
}

interface ScoreTrackerProps {
  users: string[];
  onResetGame?: () => void;
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
          <p>{error}</p>
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
        data-testid="user-input"
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
  const MockScoreTracker = (props: ScoreTrackerProps) => (
    <div data-testid="score-tracker">
      <input data-testid="input-score" type="number" />
    </div>
  );
  MockScoreTracker.displayName = 'ScoreTracker';
  return MockScoreTracker;
});

describe('Home Page', () => {
  test('There should be input fields for each frame to enter scores.', async () => {
    // Use act to wrap the render and state changes
    await act(async () => {
      render(<Home />);
    });

    // Simulate adding a user
    await act(async () => {
      fireEvent.change(screen.getByTestId('user-input'), { target: { value: 'John Doe' } });
    });

    // Click Start Game button
    await act(async () => {
      fireEvent.click(screen.getByTestId('start-game-button'));
    });

    // Ensure ScoreTracker component appears
    expect(screen.getByTestId('input-score')).toBeInTheDocument();
  });
});
