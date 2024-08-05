const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const path = require("path");
const bodyParser = require("body-parser");
const { error } = require("console");

const dbPath = "app/db/database.sqlite3";

// == [質問]以下の記述がなぜ必要なのかがいまいち理解できていない ==
//リクエストのbodyを解析して、javascriptのオブジェクトとして扱えるようにする
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// public ディレクトリを静的ファイルのルートディレクトリとして設定
app.use(express.static(path.join(__dirname, "public")));

//============================================================

// データベースに対してSQLを実行する関数
// db.run メソッドをPromiseベースの関数にラップしている
// Promise を使うことで、.then() や .catch() で非同期処理の結果を受け取ることができる
// Promise を使うことで、async/await 構文を使って非同期処理を記述することができる
const run = async (sql, db) => {
  return new Promise((resolve, reject) => {
    // runはsqlite3のメソッドで、SQLを実行するメソッド
    db.run(sql, (err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
};

//　全てのユーザーを取得するAPI
app.get("/api/v1/users", (req, res) => {
  // データベースに接続
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM users", (err, rows) => {
    res.json(rows);
  });
  db.close();
});

// 特定のユーザーを取得するAPI
// :id にすることで、動的にidを受け取ることができる
app.get("/api/v1/users/:id", (req, res) => {
  // データベースに接続
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;

  db.get(`SELECT * FROM users WHERE id = ${id} `, (err, row) => {
    if (!row) {
      res.status(404).send({ error: "Not Found" });
    } else {
      res.status(200).json(row);
    }
  });
  db.close();
});

//　検索条件に合致するユーザーを取得するAPI
app.get("/api/v1/search", (req, res) => {
  // データベースに接続
  const db = new sqlite3.Database(dbPath);
  const keyword = req.query.q;

  db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
    res.json(rows);
  });
  db.close();
});

// ユーザーを新規作成するAPI
app.post("/api/v1/users", async (req, res) => {
  if (!req.body.name || req.body.name === "") {
    res.status(400).send({ error: "ユーザー名が指定されていません" });
  } else {
    const db = new sqlite3.Database(dbPath);

    const name = req.body.name;
    const profile = req.body.profile ? req.body.profile : "";
    const dataOfBirth = req.body.date_of_birth ? req.body.date_of_birth : "";

    try {
      await run(
        `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dataOfBirth}")`,
        db
      );
      res.status(201).send({ message: "新規ユーザーを作成しました" });
    } catch (e) {
      res.status(500).send({ error: e });
    }
    db.close();
  }
});

// ユーザーを更新するAPI
app.put("/api/v1/users/:id", async (req, res) => {
  if (!req.body.name || req.body.name === "") {
    res.status(400).send({ error: "ユーザー名が指定されていません" });
  } else {
    // データベースに接続
    const db = new sqlite3.Database(dbPath);
    const id = req.params.id;

    // 現在のユーザー情報を取得する
    db.get(`SELECT * FROM users WHERE id = ${id} `, async (err, row) => {
      if (!row) {
        res.status(404).send({ error: "指定されたユーザーが見つかりません" });
      } else {
        const name = req.body.name ? req.body.name : row.name;
        const profile = req.body.profile ? req.body.profile : row.profile;
        const dateOfBirth = req.body.date_of_birth
          ? req.body.date_of_birth
          : row.date_of_birth;

        try {
          await run(
            `UPDATE users SET name = ?,profile = ?,date_of_birth = ? WHERE id = ?`,
            db
          );
          res.status(200).send({ message: " ユーザー情報を更新しました" });
        } catch (error) {
          res.status(500).send({ error: error });
        }
      }
    });
    db.close();
  }
});

// ユーザー情報を削除するAPI
app.delete("/api/v1/users/:id", async (req, res) => {
  // データベースに接続
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;

  // 現在のユーザー情報を取得する
  db.get(`SELECT * FROM users WHERE id = ${id} `, async (err, row) => {
    if (!row) {
      res.status(404).send({ error: "指定されたユーザーが見つかりません" });
    } else {
      try {
        await run(`DELETE FROM users WHERE id = ?`, db);
        res.status(200).send({ message: "ユーザーを削除しました" });
      } catch (error) {
        res.status(500).send({ error: error });
      }
    }
  });
  db.close();
});

// ローカルでポートを設定している場合は、環境変数 PORT が設定されていない場合は 3000 を使う
const port = process.env.PORT || 3000;
// サーバーを起動する
app.listen(port);
console.log("Liseten on port" + port);
