import express from "express";
import pg from "pg";
import cors from "cors";
import env from "dotenv";

env.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    connectionString: process.env.PG_URL,
});
db.connect();

app.use(cors());

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM quizApi");
    const data = result.rows;

    res.json(data);
});

app.get("/random", async (req, res) => {
    const result = await db.query("SELECT * FROM quizapi");
    const data = result.rows;
    const ids = data.map((el) => el.id);
    const id = ids[Math.floor(Math.random() * ids.length)];
    const pergunta = data.find((el) => el.id === id);

    const l = data.length;

    const result1 = await db.query(
        "SELECT * FROM quizapirespostas WHERE pergunta_id = $1",
        [id]
    );
    const respostas = result1.rows;

    const quiz = {
        pergunta,
        respostas,
        l,
    };

    res.json(quiz);
});

app.get("/add", async (req, res) => {
    const pergunta = req.query.pergunta;
    const resposta1 = req.query.resposta1;
    const resposta2 = req.query.resposta2;
    const resposta3 = req.query.resposta3;
    const respostacerta = req.query.respostacerta;

    const respostas = [resposta1, resposta2, resposta3, respostacerta];

    console.log(pergunta);
    console.log(respostas);

    const result = await db.query(
        "INSERT INTO quizAPI(pergunta) VALUES($1) RETURNING id",
        [pergunta]
    );
    const id = Number(result.rows[0].id);
    console.log(id);

    respostas.forEach((r, i) => {
        db.query(
            "INSERT INTO quizapirespostas (resposta, status, pergunta_id) VALUES($1,$2,$3)",
            [r, i === 3 ? "Correta" : "Errada", id]
        );
    });
});

app.get("/delete", async (req, res) => {
    const id = Number(req.query.id);
    console.log(id);

    const result = await db.query("SELECT * FROM quizapi WHERE id = $1", [id]);
    const data = result.rows[0];

    db.query("DELETE FROM quizapi WHERE id = $1", [id]);
    db.query("DELETE FROM quizapirespostas WHERE pergunta_id = $1", [id]);

    res.json(data);
});

app.listen(port, () => {
    console.log(`API on port ${port}`);
});
