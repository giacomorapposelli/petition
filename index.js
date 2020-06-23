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
    insertInfo,
    getSignersByCity,
    getDataToEdit,
    deleteSignature,
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

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.get("/profile/edit", (req, res) => {
    getDataToEdit(req.session.userId)
        .then((result) => {
            console.log("DIOBOIAAAAAAAA ", result);
            res.render("edit", {
                dataToEdit: result.rows[0],
            });
        })
        .catch((err) => console.log("SOCAZZZZZOOOOOOO ", err));
});

app.post("/profile", (req, res) => {
    if (req.body.url === "") {
        req.body.url = null;
    } else if (
        !req.body.url.startsWith("http://") ||
        !req.body.url.startsWith("https://")
    ) {
        req.body.url = `http://${req.body.url}`;
    }
    insertInfo(req.body.age, req.body.city, req.body.url, req.session.userId)
        .then((result) => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("horror: ", err);
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
                    res.redirect("/profile");
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
    addSigner(req.body.signature, req.session.userId)
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
                                    res.redirect("/thanks");
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
                console.log("count: ", signers);
                console.log(signers.rows.length);
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
                signersList.push(signers.rows[i]);
                console.log(signersList);
            }
            res.render("signers", {
                signersList,
            });
        })
        .catch((err) => {
            console.log("error: ", err);
        });
});

app.get("/signers/:city", (req, res) => {
    let signersListByCity = [];
    console.log("cittá:", req.params.city);
    getSignersByCity(req.params.city)
        .then((signers) => {
            for (let i = 0; i < signers.rows.length; i++) {
                signersListByCity.push(signers.rows[i]);
                console.log(signers.rows[i]);
            }
            res.render("signersbycity", {
                signersListByCity,
                signersCity: signers.rows[0].city,
                signersCount: signers.rows.length,
                onlyOne: signers.rows.length === 1,
            });
        })
        .catch((err) => {
            console.log("erroraccio: ", err);
        });
});

app.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/register");
});

app.listen(8080, () => console.log("server listening"));
