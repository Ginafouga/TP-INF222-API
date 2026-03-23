
const express = require('express');
const sqlite3= require('sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connexion à ta bd sqLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        return console.error("Erreur de connexion :", err.message);
    }
    console.log('Connecté à la base de données SQLite.');
});

// Création automatique de la table Article
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Article (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        contenu TEXT,
        auteur TEXT,
        date TEXT,
        categorie TEXT,
        tags TEXT
    )`, (err) => {
        if (err) console.error("Erreur création table :", err.message);
        else console.log("Table 'Article' prête.");
    });
});
// Ajouter un article
app.post('/articles', (req, res) => {
    const { titre, contenu, auteur, date, categorie, tags } = req.body;

    const sql = `INSERT INTO Article (titre, contenu, auteur, date, categorie, tags)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [titre, contenu, auteur, date, categorie, tags], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Article ajouté", id: result.insertId });
    });
});


// Afficher tout les articles
app.get('/articles', (req, res) => {
    const sql = 'SELECT * FROM Article';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


// Afficher un seul article par id
app.get('/articles/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Article WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});


// Fonction pour la mise a jour
app.put('/articles/:id', (req, res) => {
    const { id } = req.params;
    const { titre, contenu, auteur, date, categorie, tags } = req.body;
    const sql = `UPDATE Article 
                 SET titre=?, contenu=?, auteur=?, date=?, categorie=?, tags=? 
                 WHERE id=?`;
    
    db.run(sql, [titre, contenu, auteur, date, categorie, tags, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Article modifié", changes: this.changes });
    });
});


// Fonction pour supprimer
app.delete('/articles/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Article WHERE id = ?';
    
    db.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Article supprimé", changes: this.changes });
    });
});


// Ici c'est pour lancer le serveur
app.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});
