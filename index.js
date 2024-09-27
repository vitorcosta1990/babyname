const express = require('express');
const cookieSession = require('cookie-session');
const { Pool } = require('pg'); // PostgreSQL client
const { jwtDecode } = require('jwt-decode')
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize CookieSession
app.use(cookieSession({ secret: 'testcookiesessionsecret' }));

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DATABASE_USER,  // Default PostgreSQL user
    host: process.env.DATABASE_URL,
    database: 'babynames',  // The database we created earlier
    password: process.env.DATABASE_PASS,  // Your PostgreSQL password
    port: 5432,  // Default port for PostgreSQL
});

app.get('/', function(req, res){
    if (req.session.user == null){
        res.redirect('/login');
    } else{
        res.redirect('/main');
    }
  });

app.get('/logout', function(req, res){
if (req.session.user == null){
    res.redirect('/login');
} else{
    req.session = null;
    res.redirect('/login');
}
});

  app.get('/main', function(req, res) {
    if (req.session.user == null){
        res.redirect('/login');
    }
    var nome = req.session.user;
    const main =  `
        <!-- index.html -->
        <html>
        <head>
            <style>
                body {background-color: #a9bded;}
                h1  {
                        color: white;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 9vw;
                        margin: 0;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        -ms-transform: translate(-50%, -50%);
                        transform: translate(-50%, -50%);

                    }
                @keyframes fadeIn {
                                0% { opacity: 0; }
                                100% { opacity: 1; }
                                }
                button {
                        display: block;
                        background-color: white; /* Green */
                        border: none;
                        color: white;
                        width: 20vh;
                        height: 20vh;
                        margin: auto;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 10vh;
                        border-radius: 50%;
                        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
                        }
                button:active{
                        transform: translateY(-4px);

                }
                .buttondiv {
                            margin-left: auto;
                            margin-right: auto;
                            width: 65vw;
                            display: flex;
                            justify-content: space-between;
                            }
                .display {
                            display: block;
                            width: 65vw;
                            height: min(65vh, 65vw);
                            margin-left: auto;
                            margin-right: auto;
                            margin-bottom: 5vh;
                            background: linear-gradient(150deg, #e5cdfb 60%, #cfa5f8 60%);                    
                            border-radius: 10px;
                            position: relative;
                            box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
                        }
            </style>
            <script src="https://kit.fontawesome.com/6146356ccc.js" crossorigin="anonymous"></script>
        </head>
        <body>
            <p style="text-align: right;font-family: Arial, Helvetica, sans-serif;">${nome}, <a href="/logout">sair.</a></p>
            <div class="display">
                <h1 id="nameDisplay"></h1>
            </div>
            <div class="buttondiv">
                <button style="color: #f44336;" onclick="sendResponse('0')"><i class="fa-solid fa-thumbs-down"></i></button>
                <button style="color: #04AA6D;" onclick="sendResponse('1')"><i class="fa-solid fa-thumbs-up"></i></button>
            </div>
            <script>
                async function getRandomName() {
                    const response = await fetch('/get-random-name');
                    const data = await response.json();
                    document.getElementById('nameDisplay').innerText = data.name;
                    document.getElementById('nameDisplay').dataset.id = data.id;
                    document.getElementById('nameDisplay').style.animation= 'none';
                     document.getElementById('nameDisplay').offsetHeight; /* trigger reflow */
                    document.getElementById('nameDisplay').style.animation='fadeIn 1s'

                }

                async function sendResponse(answer) {
                    const id = document.getElementById('nameDisplay').dataset.id;
                    if (id != 0){
                    await fetch('/submit-response', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, answer })
                    });
                    getRandomName(); // Refresh with a new name
                    }
                }

                getRandomName(); // Initial call to display name
            </script>
        </body>
        </html>
        `
    res.type('html').send(main);
});



app.get("/login", (req, res) => res.type('html').send(login));


 const login = `
 <!-- index.html -->
<html>
<head>
<script src="https://accounts.google.com/gsi/client" async></script>
<style>
    body {background-color: #e5cdfb;}
    h1  {
            color: white;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9vw;
            margin: 0 0 3vh 0;
            text-align: center;

        }
    p {
        color: #0058a6;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 3vw;
        text-align: justify;
        margin: 2vh;
    
    }
</style>
</head>
<body>
<h1>Nome da Bebê</h1>
<p>Essa é uma aplicação de votação de nomes de bebês para ajudar eu, Vitor, e a Pri a escolher o nome da nossa bebê. 
Essa é uma aplicação temporária. 
Decidimos disponibilizar para que os nossos amigos briquem com a gente. 
Seu voto não vai ser contabilizado na nossa decisão, mas se você participar revelaremos quão próximo você ficou dos nossos votos.
A lista possui os 1000 nomes femininos mais frequentes segundo o IBGE.<br>
Para começar faça o login.<br>
Boa sorte.
</p>
 <div id="g_id_onload"
     data-client_id="571555599789-bosikch94v88fk28rh21evqjsuutivfu.apps.googleusercontent.com"
     data-context="use"
     data-ux_mode="popup"
     data-login_uri="http://localhost:3000/login_activate"
     data-auto_prompt="false">
</div>
<div>
<div class="g_id_signin"
     data-type="standard"
     data-shape="pill"
     data-theme="outline"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>
</div>
</body>
</html>
 `

// Get random name endpoint
app.get('/get-random-name', async (req, res) => {
    try {
        const result = await pool.query('SELECT n.nome, n.id FROM nomes n LEFT JOIN votos v ON v.nome_id = n.id and v.usuario = $1 WHERE v.nome_id IS NULL ORDER BY RANDOM() LIMIT 1',['teste']);
        if (result && res.length > 0){
            const randomName = result.rows[0];
            res.json({ id: randomName.id, name: randomName.nome });
        }else{
            res.json({ id: 0, name: 'Acabou' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Submit response endpoint
app.post('/submit-response', async (req, res) => {
    const { id, answer } = req.body;
    try {
        await pool.query('INSERT INTO votos (usuario, nome_id, voto) VALUES ($1, $2, $3)', [req.session.email,id, answer]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }

});
app.post('/login_activate', async (req, res) => {
    
    try {
        var credential = req.body.credential;
        // console.log(req.body);
        // res.status(201).json({"credential": credential });
        const realUserData = jwtDecode(credential); // credentials === JWT token
        req.session.user = realUserData.given_name
        req.session.email = realUserData.email
        req.session.userid = realUserData.sub
        res.redirect('/main');

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, "credential": credential });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

