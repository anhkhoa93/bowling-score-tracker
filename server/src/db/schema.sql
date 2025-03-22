-- Drop tables if they exist
DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS players;

-- Create players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  date_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  winner_id INTEGER REFERENCES players(id),
  completed BOOLEAN DEFAULT FALSE
);

-- Create game_scores table
CREATE TABLE game_scores (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  frame_number INTEGER NOT NULL CHECK (frame_number BETWEEN 1 AND 10),
  roll_1 INTEGER NOT NULL CHECK (roll_1 BETWEEN 0 AND 10),
  roll_2 INTEGER CHECK (roll_2 BETWEEN 0 AND 10),
  roll_3 INTEGER CHECK (roll_3 BETWEEN 0 AND 10),
  frame_score INTEGER,
  total_score INTEGER,
  UNIQUE (game_id, player_id, frame_number)
);

-- Create indexes for better performance
CREATE INDEX idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX idx_games_winner_id ON games(winner_id);
