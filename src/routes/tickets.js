const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// Requesters see their own tickets; support staff can see all tickets.
router.get('/', async (req, res, next) => {
  try {
    const result = req.auth.role === 'support'
      ? await pool.query('SELECT id, title, status, requester_id, created_at FROM tickets ORDER BY id')
      : await pool.query('SELECT id, title, status, requester_id, created_at FROM tickets WHERE requester_id = $1 ORDER BY id', [req.auth.id]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

// Search input is always bound as a parameter, never concatenated into SQL.
router.get('/search', async (req, res, next) => {
  try {
    const term = typeof req.query.term === 'string' ? req.query.term.trim() : '';
    if (term.length > 100) return res.status(400).json({ error: 'Termo de pesquisa muito longo.' });
    const pattern = `%${term}%`;
    const result = req.auth.role === 'support'
      ? await pool.query('SELECT id, title, status FROM tickets WHERE title ILIKE $1 ORDER BY id', [pattern])
      : await pool.query('SELECT id, title, status FROM tickets WHERE title ILIKE $1 AND requester_id = $2 ORDER BY id', [pattern, req.auth.id]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

// A requester can access only their own ticket; support staff can access any.
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });
    const result = await pool.query(
      'SELECT id, title, description, status, requester_id, created_at FROM tickets WHERE id = $1 AND ($2::boolean OR requester_id = $3)',
      [id, req.auth.role === 'support', req.auth.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Chamado não encontrado' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

module.exports = router;
