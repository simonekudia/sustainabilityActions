/* Implements api routes for sustainability actions, including listing all actions,
   adding a new action, updating an existing action, and deleting an action.
*/
const express = require('express');
const router = express.Router();
const fsp = require('fs/promises');
const path = require('path');
const {z} = require('zod');
const DATA_PATH = path.join(__dirname, '../data/actions.json');
const DEFAULT_DATA = {'actions': []};

// Define schema
const ActionSchema = z.object({
  action: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  points: z.number().int()
});


// function checks if json data file exists, if not creates an empty one
async function prepFile() {
    try {
        await fsp.access(DATA_PATH);
    } catch {
        await fsp.writeFile(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    }
}

// read from json file
async function loadData() {
    await prepFile();
    const rawData = await fsp.readFile(DATA_PATH, 'utf8');
    return JSON.parse(rawData);
}

// write to json file
async function writeData(data) {
    await fsp.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// get api endpoint to retrieve list of sustainability actions from json file
router.get('/', async (req, res) => {
    try {
        const data = await loadData();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading data');
    }
});

// post api endpoint to add new sustainability action
router.post('/', async (req, res)=> {
    try {
        // validate payload
        const result = ActionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: 'Invalid payload',
                details: result.error.message   // Zod gives detailed issues
            });
        }
        const action = result.data;
        //const { action, date, points } = req.body;
        //if (typeCheckingHelper(action, date, points, res)) return;
        const data = await loadData();
        const id = data.actions.length > 0 ? data.actions[data.actions.length - 1].id + 1 : 1;
        data.actions.push({ id: id, ...action });
        await writeData(data);
        res.status(201).json({ message: 'Action added', id: id, data: action });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding action');
    }
});

// put api endpoint to update existing sustainability action
router.put('/:id', async (req, res)=> {
    try {
        const id = parseInt(req.params.id);
        // validate id parameter
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id parameter' });
        }

        // validate payload
        const result = ActionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: 'Invalid payload',
                details: result.error.message   // Zod gives detailed issues
            });
        }
        const action = result.data;

        //if (typeCheckingHelper(action, date, points, res)) return;

        const data = await loadData();
        const index = data.actions.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).send('Id not found to update');
        }
        data.actions[index] = { id: id, ...action };
        await writeData(data);
        res.status(200).json({ message: 'Action updated', id: id, data: action });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating action');
    }
});

// delete api endpoint to remove sustainability action
router.delete('/:id', async (req, res)=> {
    try {
        const id = parseInt(req.params.id);

        // validate id parameter
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id parameter' });
        }

        const data = await loadData();
        const len = data.actions.length;
        data.actions = data.actions.filter(a => a.id !== id);
        if (data.actions.length === len) {
            return res.status(404).send('Id not found to delete');
        }
        await writeData(data);
        res.status(200).json({ message: 'Action deleted', id: id});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting action');
    }
});

module.exports = router;