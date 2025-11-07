import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Create tag
router.post('/', (req, res) => {

  console.log(req.body);
  //Body for the post petition
  const { tagName, usability, content } = req.body;
  //Checking if it is empty
  if (!tagName) return res.status(400).json({ error: 'tagName es obligatorio' });
  //SQL Script to create the new tag
  const sql = `INSERT INTO tags (tagName, usability, content) VALUES (?, ?, ?)`;
  //Make the petition and send the body
  db.run(sql, [tagName, usability, content], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, tagName, usability, content });
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
