import pool from '../db/connection';

export interface Game {
  id: number;
  date_played: Date;
  winner_id: number | null;
  completed: boolean;
}

export interface NewGame {
  winner_id?: number;
  completed?: boolean;
}

export class GameModel {
  /**
   * Create a new game
   */
  static async create(): Promise<Game> {
    const query = 'INSERT INTO games DEFAULT VALUES RETURNING *';
    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * Get all games
   */
  static async getAll(): Promise<Game[]> {
    const query = 'SELECT * FROM games ORDER BY date_played DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a game by ID
   */
  static async getById(id: number): Promise<Game | null> {
    const query = 'SELECT * FROM games WHERE id = $1';
    const values = [id];
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a game
   */
  static async update(id: number, game: NewGame): Promise<Game | null> {
    const updateFields = [];
    const values = [];
    let valueCounter = 1;

    if (game.winner_id !== undefined) {
      updateFields.push(`winner_id = $${valueCounter}`);
      values.push(game.winner_id);
      valueCounter++;
    }

    if (game.completed !== undefined) {
      updateFields.push(`completed = $${valueCounter}`);
      values.push(game.completed);
      valueCounter++;
    }

    if (updateFields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `UPDATE games SET ${updateFields.join(', ')} WHERE id = $${valueCounter} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete a game
   */
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM games WHERE id = $1 RETURNING id';
    const values = [id];
    
    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Get games with player details
   */
  static async getGamesWithPlayers(): Promise<any[]> {
    const query = `
      SELECT 
        g.id, 
        g.date_played, 
        g.completed,
        p.id as winner_id, 
        p.name as winner_name,
        COUNT(DISTINCT gs.player_id) as player_count
      FROM 
        games g
      LEFT JOIN 
        players p ON g.winner_id = p.id
      LEFT JOIN 
        game_scores gs ON g.id = gs.game_id
      GROUP BY 
        g.id, p.id, p.name
      ORDER BY 
        g.date_played DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}
