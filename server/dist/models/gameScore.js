"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScoreModel = void 0;
const connection_1 = __importDefault(require("../db/connection"));
class GameScoreModel {
    /**
     * Create a new game score
     */
    static async create(score) {
        const query = `
      INSERT INTO game_scores 
        (game_id, player_id, frame_number, roll_1, roll_2, roll_3, frame_score, total_score) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;
        const values = [
            score.game_id,
            score.player_id,
            score.frame_number,
            score.roll_1,
            score.roll_2 || null,
            score.roll_3 || null,
            score.frame_score || null,
            score.total_score || null
        ];
        const result = await connection_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Get all scores for a game
     */
    static async getByGameId(gameId) {
        const query = `
      SELECT * FROM game_scores 
      WHERE game_id = $1 
      ORDER BY player_id, frame_number
    `;
        const values = [gameId];
        const result = await connection_1.default.query(query, values);
        return result.rows;
    }
    /**
     * Get scores for a specific player in a game
     */
    static async getByGameAndPlayer(gameId, playerId) {
        const query = `
      SELECT * FROM game_scores 
      WHERE game_id = $1 AND player_id = $2 
      ORDER BY frame_number
    `;
        const values = [gameId, playerId];
        const result = await connection_1.default.query(query, values);
        return result.rows;
    }
    /**
     * Update a game score
     */
    static async update(id, score) {
        const updateFields = [];
        const values = [];
        let valueCounter = 1;
        const fields = [
            'roll_1', 'roll_2', 'roll_3', 'frame_score', 'total_score'
        ];
        for (const field of fields) {
            if (score[field] !== undefined) {
                updateFields.push(`${field} = $${valueCounter}`);
                values.push(score[field]);
                valueCounter++;
            }
        }
        if (updateFields.length === 0) {
            return this.getById(id);
        }
        values.push(id);
        const query = `UPDATE game_scores SET ${updateFields.join(', ')} WHERE id = $${valueCounter} RETURNING *`;
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Get a game score by ID
     */
    static async getById(id) {
        const query = 'SELECT * FROM game_scores WHERE id = $1';
        const values = [id];
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Delete a game score
     */
    static async delete(id) {
        const query = 'DELETE FROM game_scores WHERE id = $1 RETURNING id';
        const values = [id];
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0;
    }
    /**
     * Get complete game data with player names and scores
     */
    static async getGameWithScores(gameId) {
        const query = `
      SELECT 
        g.id as game_id,
        g.date_played,
        g.completed,
        p.id as player_id,
        p.name as player_name,
        gs.frame_number,
        gs.roll_1,
        gs.roll_2,
        gs.roll_3,
        gs.frame_score,
        gs.total_score
      FROM 
        games g
      JOIN 
        game_scores gs ON g.id = gs.game_id
      JOIN 
        players p ON gs.player_id = p.id
      WHERE 
        g.id = $1
      ORDER BY 
        p.id, gs.frame_number
    `;
        const values = [gameId];
        const result = await connection_1.default.query(query, values);
        // Format the results into a more usable structure
        const game = {
            id: gameId,
            date_played: null,
            completed: false,
            players: []
        };
        const playerMap = new Map();
        for (const row of result.rows) {
            game.date_played = row.date_played;
            game.completed = row.completed;
            if (!playerMap.has(row.player_id)) {
                playerMap.set(row.player_id, {
                    id: row.player_id,
                    name: row.player_name,
                    frames: []
                });
            }
            const player = playerMap.get(row.player_id);
            player.frames.push({
                frame_number: row.frame_number,
                roll_1: row.roll_1,
                roll_2: row.roll_2,
                roll_3: row.roll_3,
                frame_score: row.frame_score,
                total_score: row.total_score
            });
        }
        game.players = Array.from(playerMap.values());
        return game;
    }
}
exports.GameScoreModel = GameScoreModel;
