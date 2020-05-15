var express = require("express");
var pg = require("pg");
var bodyParser = require("body-parser");
var session = require("express-session");
// COPY public."books" FROM 'G:\MI_Project\books.csv' DELIMITER ',' CSV HEADER;                                                // selfdone
var books = require('google-books-search');

var CON_STRING = process.env.DB_CON_STRING;
if (CON_STRING == undefined) {
    console.log("Error: Environment variable DB_CON_STRING not set!");
    process.exit(1);
}

pg.defaults.ssl = true;
var dbClient = new pg.Client(CON_STRING);
dbClient.connect();

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

const PORT = 3000;

var app = express();

app.use(session({
    secret: "This is a secret!",
    cookie: { maxAge: 3600000 },
    resave:true,
    saveUninitialized: false
}));

app.set("views", "views");
app.set("view engine", "pug");

//-----------------------------routes-------------------------------------------------------------

app.get("/", function (req, res) {
    res.render("index");
}); 


app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/logged_in", function (req, res) {
    if (req.session.user != undefined) {
       res.render("logged_in", {user: req.session.user});
   } else {
       res.render("error", {error: "You need to be logged in to access this page."});
   }
});

app.get("/coming_soon", function (req, res) {
    res.render("coming_soon");
});

app.get("/error", function (req, res) {
    res.render("error");
}); 


app.get("books_details", function (req, res) {
     if (req.session.user != undefined) {
       res.render("books_details", {user: req.session.user});
   } else {
       res.render("error", {error: "You need to be logged in to access this page."});
   }
}); 


// ----------------------Search-page only when User-session == true, accessible -----------------------
 app.get("/search", function(req, res) {
   if (req.session.user != undefined) {
        res.render("search", {user: req.session.user});
   } else {
       res.render("error", {error: "You need to be logged in to access this page."});
   }
}); 

//-----------------------Getting details of books and book reviews--------------------------------
app.get("/books_details/:id", function(req, res) {
    var id = req.params.id;
    
    dbClient.query("SELECT * FROM books_list WHERE id=$1", [id], function (dbError, dbResponse) {
       // console.log(dbResponse.rows);
        dbClient.query("SELECT reviews.rating AS rating, reviews.book_review AS book_review, users.username AS username FROM reviews INNER JOIN users ON reviews.user_id = users.id WHERE book_id = $1", [id], function (dbRevError, dbRevResponse) {
            res.render("books_details", {
                found: dbResponse.rows[0],
                reviews: dbRevResponse.rows 
            })
        })
    });    
}); 


// ----------- Destroying session: When User ends his session i.e. logs out-------------------

app.get("/logout", function(req, res) {
    req.session.destroy(function (err) {
        console.log("Session destroyed.");
    })
    res.render("logout");
});

//---------------- INSERT registered users into TABLE users ----------------------------

app.post("/confirmation", urlencodedParser, function(request, response) {
    var username = request.body.username;
    var email = request.body.email;
    var password = request.body.password;
    var repeated_password = request.body.repeated_password;
    
    if(password.length < 4) {
       response.render("index", {register_error: "Sorry, your password must contain at least 4 characters! Please choose another one!"}) 
    } else {
        if(password == repeated_password) {
            dbClient.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, password], function (dbError, dbResponse) {
            response.render("confirmation", {data: request.body});
        });
        } else {
        response.render("index", {register_error: "Sorry, your password input does not match! Please try again!"})
        }
    }
});

//------------------ User logIn ------------------------------------------------------------------

app.post("/logged_in", urlencodedParser, function (req, res) {
    var user = req.body.username;
    var password = req.body.password;

    dbClient.query("SELECT * FROM users WHERE username=$1 AND password=$2", [user, password], function (dbError, dbResponse) {
        if(dbResponse != undefined) {
           if (dbResponse.rows.length == 0) { 
               res.render("login", {login_error: "Sorry, username and password do not match!"});
           } else {
               initSession(req.session);
               req.session.user = user;
               req.session.userId = dbResponse.rows[0].id;
             // req.session.userId.push(user);
		       res.render("logged_in");
            // res.render("logged_in", {userId: req.session.userID});
            } 
        }
    });
});

//---------------- setting up session --------------------------------------------------

 function initSession(session) {
    if (session.userId == undefined) {
        session.userId = [];
    }
} 

// ------------------ clicking on 'Search' and redirecting to Search-page -------------------------
app.post("/search", urlencodedParser, function(request, response) {
    var input = request.body.input;
    console.log(input);
    // search
    dbClient.query("SELECT * FROM books_list WHERE (isbn ILIKE $1) OR (title ILIKE $1) OR (author ILIKE $1)", ['%' + input + '%'], function (dbError, dbResponse) {
       // console.log(dbResponse.rows.length);
        
        
        if(dbResponse != undefined) {
            if (dbResponse.rows.length != 0) {
                books.search(input, function(error, results) {
                if ( ! error ) {
                    // console.log(results);
                } else {
                    console.log(error);
                }
            }); 
                response.render("search",  {found: dbResponse.rows}); 
            
            } else {
                response.render("search", {search_error: "Not found! Please try another search!"});
            }
        }    
    });
});

// ----------------------------------Inserting book reviews into database-------------------------------
app.post("/books_details/:id", urlencodedParser, function(req, res) {
  
    var review = req.body.review;
    var book_id = req.body.book_id;
    var user = req.session.userId;
    var rating = req.body.rating;
    
    if(rating > 0 && rating < 6) {
        dbClient.query("INSERT INTO reviews (book_review, book_id, user_id, rating) VALUES ($1, $2, $3, $4)", [review, book_id, user, rating], function (dbError, dbResponse) {       
            console.log(dbResponse);
                                                                                                                               
            res.redirect("/books_details/"+book_id);
        });
        
        } else {
             res.render("error", {rating_error: "Your rating needs to be between 1 and 5 scores! Try again!"});
    }     
});

         
app.listen(PORT, function () {
    console.log(`App listening on Port ${PORT}`);
    
});



