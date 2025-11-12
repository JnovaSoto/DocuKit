import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Create tag
router.post('/', (req, res) => {
  const { tagName, usability } = req.body;

  console.log('Inserting tag:', tagName, usability);

  if (!tagName) return res.status(400).json({ error: 'tagName es obligatorio' });
  if (!usability) return res.status(400).json({ error: 'usability es obligatorio' });

  const sql = `INSERT INTO tags (tagName, usability) VALUES (?, ?)`;

  db.run(sql, [tagName, usability], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability });
  });
});

//Create attributes
router.post('/attributes', (req, res) => {
  const { tagId, attributes } = req.body;

  if (!Array.isArray(attributes)) {
    return res.status(400).json({ error: '`attributes` debe ser un array' });
  }

  const sql = `INSERT INTO attributes (attribute, info, tag) VALUES (?, ?, ?)`;
  const stmt = db.prepare(sql);

  for (const attr of attributes) {
    if (!attr.attribute) continue; // evitar errores NOT NULL
    stmt.run([attr.attribute, attr.info, tagId]);
  }

  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attributes added successfully' });
  });
});


// Get tags
router.get('/', (req, res) => {

  //SQL Script to get all the tags
  db.all(`SELECT * FROM tags`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get attributes
router.get('/attributes', (req, res) => {

  //SQL Script to get all the attributes
  db.all(`SELECT * FROM attributes`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//Delate Tag
router.delete('/:id',(req,res) => {

  //Find the id from the path parameters
  const id = req.params.id

  //Delate petition
  db.run('DELETE FROM tags WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'No se encontró el tag a eliminar' });
    }

    res.json({ message: 'Tag eliminado correctamente', deletedId: id });
  });

});

//Export the router
export default router;
