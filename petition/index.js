const express = require('express');
const app = express();
const handlebars = require('express-handlebars');

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.get("/petition/signed", (req, res) => {
    res.render("thanks",{
        layout: "main",
    })
})



app.listen(8080, () => console.log("server listening"));