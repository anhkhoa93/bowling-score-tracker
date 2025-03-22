import pool from '../db/connection';

export interface Player {
  id: number;
  name: string;
  created_at: Date;
}

export interface NewPlayer {
  name: string;
}

export class PlayerModel {
  /**
   * Create a new player
   */
  static async create(player: NewPlayer): Promise<Player> {
    const query = 'INSERT INTO players (name) VALUES ($1) RETURNING *';
    const values = [player.name];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all players
   */
  static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM players ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a player by ID
   */
  static async getById(id: number): Promise<Player | null> {
    const query = 'SELECT * FROM players WHERE id = $1';
    const values = [id];
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a player
   */
  static async update(id: number, player: NewPlayer): Promise<Player | null> {
    const query = 'UPDATE players SET name = $1 WHERE id = $2 RETURNING *';
    const values = [player.name, id];
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete a player
   */
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM players WHERE id = $1 RETURNING id';
    const values = [id];
    
    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }
}
