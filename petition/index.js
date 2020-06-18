const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const cookieSession = require('cookie-session');
const {getSigners, addSigner, getSignersId} = require("./db")
const csurf = require('csurf');
const { hash, compare } = require('./bc.js');


app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf()); 

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});   

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

// app.post('/register', (req,res) => {
//     hash('userInput').then(hashedPW => {
//         console.log(hashedPW)
//         res.sendStatus(200);
//     }).catch(err => {
//         console.log('error in POST/register: ', err);
//         res.sendStatus(500);
//     })
// })

// app.post('/login', (req,res) => {
    
// })

app.post("/petition", (req, res) => {
    console.log(req.body)
    addSigner(req.body.firstname, req.body.lastname, req.body.signature)
    .then((signers) => {
            console.log('signers: ',signers)
            req.session.userId = signers.rows[0].id;
            req.session.permission = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("home", {
                error: err,
            });
        });
});


app.get("/thanks", (req, res) => {
    if(req.session.userId) {
        getSignersId(req.session.userId)
            .then((signers) => {
                res.render("thanks", {
                    signature: signers.rows[0].signature
                });
            })
            .catch((err) => {
                res.render("home",{
                    error: true
                });
            });
        
    }
    // res.redirect("/petition");
})


app.get("/signers", (req, res) => {
    let signersList = [];
    getSigners()
        .then((signers) => {
            for (let i = 0; i < signers.rows.length; i++) {
                let signer = `${signers.rows[i].first} ${signers.rows[i].last}`;
                signersList.push(signer);
            }
            res.render("signers", {
                signersList,
            });
        })
        .catch((err) => {
            console.log("error: ", err);
        });
});




app.listen(8080, () => console.log("server listening"));

