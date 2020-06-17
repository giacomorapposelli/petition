const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const cookieSession = require('cookie-session');
const { getSigners, addSigner, getSignersId} = require("./db")
const csurf = require('csurf');

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

app.post("/petition", (req, res) => {
    addSigner(req.body.firstname, req.body.lastname, req.body.signature)
        .then((signers) => {
            console.log('req.session before values set: ', req.session);
            req.session.dill = 'bigSecret99';
            req.session.permission = true;
            req.session.userId = result.rows[0].id
            console.log('req.session after value set: ', req.session);
            res.redirect("/thanks");
        })
        .catch((err) => {
            res.render("home",{
                error: true
            });
        });
});


app.get("/thanks", (req, res) => {
    if(req.session.permission) {

        getSignersId(req.session.id)
            .then((signers) => {
                let signature = signers.rows[0].signature;
                res.render("thanks", {
                    signature 
                });
            })
            .catch((err) => {
                res.render("home",{
                    error: true
                });
            });
        
    }
    res.render("/petition");
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