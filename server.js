// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

const uri = 'your_mongodb_connection_string';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect(err => {
  if (err) throw err;
  db = client.db('taskDB');
  console.log('Connected to MongoDB');
});

app.use(express.json());

app.post('/saveTasks', (req, res) => {
  const { date, tasks } = req.body;
  db.collection('tasks').updateOne(
    { date },
    { $set: { tasks } },
    { upsert: true },
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Tasks saved');
    }
  );
});

app.get('/loadTasks', (req, res) => {
  const { date } = req.query;
  db.collection('tasks').findOne({ date }, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result ? result.tasks : []);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});