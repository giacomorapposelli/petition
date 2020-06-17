const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const { getSigners, addSigner} = require("./db")

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(cookieParser());

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    addSigner(req.body.firstname, req.body.lastname, req.body.signature)
        .then(() => {
            res.cookie("checked", true);
            res.redirect("/thanks");
        })
        .catch((err) => {
            res.render("home",{
                error: true
            });
        });
});


app.get("/thanks", (req, res) => {
    res.render("thanks",{
        layout: "main",
    })
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