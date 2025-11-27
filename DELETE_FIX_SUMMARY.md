# Delete Tag Fix - 500 Error Resolution

## Problem
When trying to delete a tag (ID: 32), the server returned a **500 Internal Server Error**.

## Root Cause
The `attributes` table has a `tag` column that references the tag ID. When attempting to delete a tag that has associated attributes, the database operation was failing because:

1. **Attributes weren't being deleted first** - The tag deletion was attempted while attributes still referenced it
2. **Foreign key constraints** - If foreign keys are enabled, this would cause a constraint violation
3. **Orphaned data** - Even without foreign keys, this would leave orphaned attribute records

## Solution Implemented

### Updated: `routes/tags.js` - DELETE route

**Before:**
```javascript
router.delete(ROUTES.TAGS.DELETE, isAdminLevel1, (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM tags WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // ...
  });
});
```

**After:**
```javascript
router.delete(ROUTES.TAGS.DELETE, isAdminLevel1, (req, res) => {
  const id = req.params.id;

  // First, delete all attributes associated with this tag
  const deleteAttributesSql = `DELETE FROM attributes WHERE tag = ?`;
  
  db.run(deleteAttributesSql, [id], function (err) {
    if (err) {
      console.error('Error deleting attributes:', err.message);
      return res.status(500).json({ 
        error: 'Failed to delete tag attributes: ' + err.message 
      });
    }

    console.log(`Deleted ${this.changes} attribute(s) for tag ${id}`);

    // Now delete the tag itself
    const deleteTagSql = `DELETE FROM tags WHERE id = ?`;
    
    db.run(deleteTagSql, [id], function (err) {
      if (err) {
        console.error('Error deleting tag:', err.message);
        return res.status(500).json({ 
          error: 'Failed to delete tag: ' + err.message 
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          message: 'The tag to remove was not found.' 
        });
      }

      res.json({ 
        message: 'Tag and related attributes deleted successfully', 
        deletedId: id 
      });
    });
  });
});
```

## Key Changes

1. **Two-step deletion process:**
   - Step 1: Delete all attributes where `tag = id`
   - Step 2: Delete the tag itself

2. **Better error handling:**
   - Separate error messages for attribute deletion vs tag deletion
   - Console logging to track deletion progress
   - More descriptive error responses

3. **Improved response message:**
   - Now says "Tag and related attributes deleted successfully"
   - Indicates that both operations completed

## Testing

To test the fix:

1. **Restart your server** (the route change requires a restart):
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart it
   npm start
   ```

2. **Try deleting a tag:**
   - Navigate to the home page
   - Click the delete button on any tag
   - Confirm the deletion
   - Should now work without 500 error

3. **Check the console:**
   - You should see a message like: `Deleted X attribute(s) for tag 32`
   - Confirms attributes were removed first

## Additional Notes

### Database Schema Mismatch
I noticed that `db/database.js` has an outdated schema for the `attributes` table. The actual table structure includes:
- `id` - Primary key
- `attribute` - Attribute name
- `info` - Attribute description
- `tag` - Foreign key to tags table

But the schema in `database.js` shows:
- `attributeName`
- `value`
- `description`

**Recommendation:** Update `db/database.js` to match the actual schema being used in the application.

### Missing UPDATE Route
The frontend expects a PUT route at `/tags/:id` for updating tags (see `constants.js` line 65), but this route doesn't exist in `routes/tags.js`. You may want to implement this route for the edit functionality to work properly.

## Status
✅ **Fixed** - Tag deletion now properly removes associated attributes before deleting the tag itself.

**Next Steps:**
1. Restart the server
2. Test tag deletion
3. Consider implementing the UPDATE route for tag editing
4. Update database schema documentation
