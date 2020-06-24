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
    editCredentials,
    editProfile,
} = require("./db");
const csurf = require("csurf");
const { hash, compare } = require("./bc.js");
const {
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
    requireLoggedInUser,
    makeCookiesSafe,
} = require("./middleware");

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

app.use(makeCookiesSafe);

app.use(requireLoggedInUser);

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.locals.name = req.session.firstname;
    console.log("NAME: ", req.session);
    next();
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
        logout: true,
        profile: true,
    });
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("registration", {
        layout: "main",
        login: true,
        register: true,
    });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
        register: true,
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
        logout: true,
    });
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

app.post("/register", requireLoggedOutUser, (req, res) => {
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
            req.session.signatureId = signers.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("home", {
                error: true,
                profile: true,
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
                        console.log("CHECK PASSED: ", result.rows[0]);
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

app.get("/thanks", requireSignature, (req, res) => {
    console.log("SIG-ID: ", req.session.signatureId);
    getSignersId(req.session.userId)
        .then((signers) => {
            console.log("USER ID IN THANKS: ", req.session.userId);
            console.log("RESULTS: ", signers.rows[0]);
            console.log("sinature length: ", signers.rows.length);
            res.render("thanks", {
                signature: signers.rows[0].signature,
                logout: true,
                profile: true,
            });
        })
        .catch((err) => {
            console.log("EEEEEEEEEH?: ", err);
            res.render("home", {
                error: true,
            });
        });
});

app.get("/signers", requireSignature, (req, res) => {
    getSigners()
        .then((signers) => {
            res.render("signers", {
                signersList: signers.rows,
                logout: true,
                profile: true,
            });
        })
        .catch((err) => {
            console.log("error: ", err);
        });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    getSignersByCity(req.params.city)
        .then((signers) => {
            res.render("signersbycity", {
                signersListByCity: signers.rows,
                signersCity: signers.rows[0].city,
                signersCount: signers.rows.length,
                onlyOne: signers.rows.length === 1,
                logout: true,
                profile: true,
            });
        })
        .catch((err) => {
            console.log("erroraccio: ", err);
        });
});

app.get("/logout", requireLoggedInUser, (req, res) => {
    req.session.userId = null;
    res.redirect("/register");
});

app.post("/thanks", (req, res) => {
    deleteSignature(req.session.userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("ERROR IN DELETE SIGN: ", err);
        });
});

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    console.log("USER ID IN EDIT: ", req.session.userId);
    getDataToEdit(req.session.userId)
        .then((result) => {
            console.log("DATA TO EDIT: ", result.rows[0]);
            res.render("edit", {
                dataToEdit: result.rows[0],
                logout: true,
            });
        })
        .catch((err) => console.log("Error: ", err));
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    if (req.body.url === "") {
        req.body.url = null;
    } else if (
        !req.body.url.startsWith("http://") ||
        !req.body.url.startsWith("https://")
    ) {
        req.body.url = `http://${req.body.url}`;
    }
    editCredentials(
        req.session.userId,
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.password
    )
        .then(() => {
            editProfile(
                req.body.age,
                req.body.city,
                req.body.url,
                req.session.userId
            )
                .then((result) => {
                    console.log("EDIT CREDENTIALS: ", result);
                    res.redirect("/thanks");
                })
                .catch((err) => {
                    console.log("ERROR IN EDIT CREDENTIALS: ", err);
                    res.render("/edit", {
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("ERROR IN EDIT PROFILE: ", err);
        });
});

app.listen(process.env.PORT || 8080, () => console.log("server listening"));
