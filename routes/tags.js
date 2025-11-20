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


// Get attributes
router.get('/attributes', (req, res) => {
  // SQL to get all attributes
  const sql = `SELECT * FROM attributes`;

    console.log("Getting the attributes")

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

// Create attributes (batch insert)
router.post('/attributes/create',isAuthenticated, (req, res) => {
  const { tagId, attributes } = req.body;

   console.log(
  'Inserting attributes:', 
  tagId, 
  attributes, 
  );

  if (!Array.isArray(attributes)) {
    return res.status(400).json({ error: 'attributes must be an array.' });
  }

  // SQL to insert multiple attributes
  const sql = `INSERT INTO attributes (attribute, info, tag) VALUES (?, ?, ?)`;
  const stmt = db.prepare(sql);

  for (const attr of attributes) {
    if (!attr.attribute) continue; // Avoid NOT NULL errors
    stmt.run([attr.attribute, attr.info, tagId]);
  }

  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attributes added successfully' });
  });
});

//Get tag by id
router.get('/idTag/:id', isAuthenticated, (req,res) =>{
  const tagId = req.params.id;

    const sqlTag = `SELECT * FROM tags WHERE id = ?`;

    db.all(sqlTag, [tagId], (err, tagRows) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (tagRows.length === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }
        res.json(tagRows);
    });

})

// Get tag by name
router.get('/:name', isAuthenticated, (req, res) => {
  const tagName = req.params.name;

  console.log("Getting a tag by name");

  const sql = `SELECT * FROM tags WHERE tagName = ?`;

  db.all(sql, [tagName], (err, rows) => {
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

// Get attribute by tag id
router.get('/attribute/:id', isAuthenticated, (req, res) => {
  const tagId = req.params.id;

  console.log("Getting attributes for tag id", tagId);

  const sql = `SELECT * FROM attributes WHERE tag = ?`;

  db.all(sql, [tagId], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No attributes found for this tag' });
    }

     res.json(rows || []); 
  });
});

// Get attribute by name
router.get('/attribute/:name', isAuthenticated, (req, res) => {
  const name = req.params.name;

  console.log("Getting attribute by name", name);

  const sql = `SELECT * FROM attributes WHERE attribute = ?`;

  db.all(sql, [name], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No attributes found' });
    }

    res.json(rows)
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
