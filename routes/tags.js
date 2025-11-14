import express from 'express';
import db from '../db/database.js';

const router = express.Router();


// Create user
router.post('/user', (req, res) => {
  const { username , email , password , admin } = req.body;

  console.log(
  'Inserting user:', 
  username, 
  email, 
  admin ? "Administrador" : "Usuario"
);


  if (username == null || email == null || admin == null || password == null) {
  return res.status(400).json({ error: 'All the attributes must be complete' });
}

  // SQL to insert a single tag
  const sql = `INSERT INTO users (username, email, password, admin) VALUES (?, ?, ?, ?)`;

  db.run(sql, [username,email,password,admin], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, username, email });
  });
});

// Create tag
router.post('/', (req, res) => {
  const { tagName, usability } = req.body;

  console.log('Inserting tag:', tagName, usability);

  if (!tagName) return res.status(400).json({ error: 'tagName is obligatory' });
  if (!usability) return res.status(400).json({ error: 'usability is obligatory' });

  // SQL to insert a single tag
  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;

  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});

// Create attributes (batch insert)
router.post('/attributes', (req, res) => {
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

// Get user
router.get('/users/:id', (req, res) => {

  const id =  parseInt(req.params.id, 10);

    console.log("Getting the user with the id = " + id)

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

  // SQL to get all attributes
  const sql = `SELECT * FROM users WHERE ID = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });

});

// Delete tag
router.delete('/:id', (req, res) => {
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
