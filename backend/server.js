const express = require('express');
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json({strict: true})); //to parse json request body

// set up router for api endpoints
const actionsRouter = require("./routes/actions.router");
app.use("/api/actions", actionsRouter);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Handle malformed JSON errors (express.json throws SyntaxError)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  next(err);
});

// Global error handler (catches thrown errors from routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});