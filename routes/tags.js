import express from 'express';
import db from '../db/database.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdminLevel1 } from '../middleware/auth.js';
const router = express.Router();

// Get tags
router.get('/', (req, res) => {
  // SQL to get all tags
  const sql = `SELECT * FROM tags`;

  console.log("Getting the tags")

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Create tag
router.post('/',isAuthenticated, (req, res) => { 
  const { tagName, usability } = req.body;

  console.log('Inserting tag:', tagName, usability);

  if (!tagName || !usability) return res.status(400).json({ error: 'Missing fields' });

  // SQL to insert a single tag
  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;

  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});


//Get tag by id
router.get('/idTag/:ids', isAuthenticated, (req,res) =>{
  
  const idsParam = req.params.ids;
  if (!idsParam) {
    return res.status(400).json({ error: "No se recibieron ids." });
  }
  const ids = idsParam.split(',').map(id => Number(id.trim()));
  const placeholders = ids.map(() => '?').join(',');
  const sqlTag = `SELECT * FROM Tags WHERE id IN (${placeholders})`;

    db.all(sqlTag, ids, (err, tagRows) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (tagRows.length === 0) {
        return res.status(404).json({ error: 'Tag not found' , tagRows});
      }
        res.json(tagRows);
    });

})

// Get tag by name
router.get('/tagName/:name', isAuthenticated, (req, res) => {
  const tagName = req.params.name;

  console.log("Getting a tag by name");

  const sql = `SELECT * FROM tags WHERE tagName = ?`;

  db.all(sql, [tagName.toLowerCase()], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(rows);
  });
});


// Delete tag
router.delete('/:id', isAdminLevel1,(req, res) => {
  const id = req.params.id;

  // SQL to delete a single tag
  const sql = `DELETE FROM tags WHERE id = ?`;

  console.log("Removing tag")

  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ message: 'The tag to remove was not found.' });
    }

    res.json({ message: 'Tag deleted', deletedId: id });
  });
});


export default router;
