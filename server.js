import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db;

// Init
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000")
    );
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1
app.get("/movies", async (_, res) => {
  const query = `SELECT movie_name AS movieName FROM movie;`;
  res.send(await db.all(query));
});

// API 2
app.post("/movies", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const query = `
    INSERT INTO movie (movie_name, director_id, lead_actor)
    VALUES (?, ?, ?);
  `;
  await db.run(query, [movieName, directorId, leadActor]);
  res.send("Movie Successfully Added");
});

// API 3
app.get("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const query = `
    SELECT 
      movie_id AS movieId, 
      director_id AS directorId,
      movie_name AS movieName, 
      lead_actor AS leadActor 
    FROM movie
    WHERE movie_id = ?;
  `;
  res.send(await db.get(query, [movieId]));
});

// API 4
app.put("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const { movieName, leadActor, directorId } = req.body;

  const query = `
    UPDATE movie
    SET movie_name = ?, director_id = ?, lead_actor = ?
    WHERE movie_id = ?;
  `;
  await db.run(query, [movieName, directorId, leadActor, movieId]);
  res.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  await db.run(`DELETE FROM movie WHERE movie_id = ?;`, [movieId]);
  res.send("Movie Removed");
});

// API 6
app.get("/directors", async (_, res) => {
  const query = `
    SELECT director_id AS directorId, director_name AS directorName
    FROM director;
  `;
  res.send(await db.all(query));
});

// API 7
app.get("/directors/:directorId/movies", async (req, res) => {
  const { directorId } = req.params;
  const query = `
    SELECT movie_name AS movieName
    FROM movie
    WHERE director_id = ?;
  `;
  res.send(await db.all(query, [directorId]));
});

export default app;
