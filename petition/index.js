const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const {
    getSigners,
    addSigner,
    getSignersId,
    addUser,
    getPassword,
    hasSigned,
} = require("./db");
const csurf = require("csurf");
const { hash, compare } = require("./bc.js");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    hash(req.body.password)
        .then((hashedPw) => {
            addUser(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                hashedPw
            )
                .then((result) => {
                    console.log("result: ", result);
                    req.session.userId = result.rows[0].id;
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("terror: ", err);
                    res.render("registration", {
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("che succede? :", err);
        });
});

app.post("/petition", (req, res) => {
    addSigner(req.session.userId, req.body.signature)
        .then((signers) => {
            req.session.userId = signers.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("home", {
                error: true,
            });
        });
});

app.post("/login", (req, res) => {
    getPassword(req.body.email)
        .then((result) => {
            compare(req.body.password, result.rows[0].password).then(
                (checked) => {
                    if (checked) {
                        req.session.userId = result.rows[0].id;
                        console.log("CHEEEEEEEEEECK: ", result.rows[0]);
                        hasSigned(req.session.userId)
                            .then((result) => {
                                if (result.rows[0]) {
                                    res.render("thanks", {
                                        signature: result.rows[0].signature,
                                    });
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                res.render("login", {
                                    error: true,
                                });
                            });
                    } else {
                        res.render("login", {
                            error: true,
                        });
                    }
                }
            );
        })
        .catch((err) => {
            console.log("terror: ", err);
            res.render("login", {
                error: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.userId) {
        getSignersId(req.session.userId)
            .then((signers) => {
                res.render("thanks", {
                    signature: signers.rows[0].signature,
                });
            })
            .catch((err) => {
                console.log("EEEEEEEEEH?: ", err);
                res.render("home", {
                    error: true,
                });
            });
    }
});

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
