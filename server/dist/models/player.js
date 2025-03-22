"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModel = void 0;
const connection_1 = __importDefault(require("../db/connection"));
class PlayerModel {
    /**
     * Create a new player
     */
    static async create(player) {
        const query = 'INSERT INTO players (name) VALUES ($1) RETURNING *';
        const values = [player.name];
        const result = await connection_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Get all players
     */
    static async getAll() {
        const query = 'SELECT * FROM players ORDER BY name';
        const result = await connection_1.default.query(query);
        return result.rows;
    }
    /**
     * Get a player by ID
     */
    static async getById(id) {
        const query = 'SELECT * FROM players WHERE id = $1';
        const values = [id];
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Update a player
     */
    static async update(id, player) {
        const query = 'UPDATE players SET name = $1 WHERE id = $2 RETURNING *';
        const values = [player.name, id];
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Delete a player
     */
    static async delete(id) {
        const query = 'DELETE FROM players WHERE id = $1 RETURNING id';
        const values = [id];
        const result = await connection_1.default.query(query, values);
        return result.rows.length > 0;
    }
}
exports.PlayerModel = PlayerModel;
