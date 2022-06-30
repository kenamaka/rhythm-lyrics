//dependencies
const express = require('express');
const cors = require("cors")
const mysql = require('mysql');
const bodyPaser = require("body-parser")
const bcrypt = require('bcrypt');
const cookiesPaser = require("cookie-parser")
const session = require("express-session")
const saltRounds = 10
const app = express();
require('dotenv').config();





app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true,
 }
))

//middlewares
app.use(cookiesPaser())
app.use(express.json())
app.use(bodyPaser.urlencoded({ extended: true }))

// session management
app.use(session({
    key: "userId",
    secret: "userAccountActivityTracking50957",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 60 * 24 , 
    }
    
}))

// port assignment
const port = process.env.port || 8000
app.listen(port, () => console.log(`listening on ${port}`));


//database connnection
const db  = mysql.createPool({
    host            : process.env.MYSQL_HOST,
    user            : process.env.MYSQL_USER,
    password        : process.env.MYSQL_PASSWORD,
    database        : process.env.MYSQL_DATABASE,
    port            : process.env.MYSQL_PORT
})

// const db  = mysql.createPool({
//     connectionLimit : 100,
//     host            : 'localhost',
//     user            : 'root',
//     password        : '',
//     database        : 'fidelity_db'
// })

//register connection
app.post("/api/register", (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
        console.log(err)
    }
        db.query("INSERT INTO users (first_name,last_name,email,username,password) VALUES (?,?,?,?,?)",
        [firstname, lastname, email, username, hash],

             (err, result) => {
                 if (err) {
                    console.log(err)
                    res.send({ message: "Account already exist, create a new account or login into an existing account" })
                                       
                   
                
                 }
               
                 else {
                    res.send(result)
                 }
                
             
            }
       
    );
})
   
});


app.post("/api/registeruser", (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const role = req.body.role
    
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
        console.log(err)
    }
        db.query("INSERT INTO users (first_name,last_name,email,username,password,role) VALUES (?,?,?,?,?)",
        [firstname, lastname, email, username, hash,role],

             (err, result) => {
                if (err) {
                                       
                    res.send({ message: "User Account already exist, create a another user account or goto home" })
                    console.log(err)
                
                }
                else {
                    res.send(result)
                }
             
            }
       
    );
})
   
});

    
    
           


//login connection
app.post('/api/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
  
    db.query(
        "SELECT * FROM users WHERE email = ?",
        email, 
        (err, result) => {
            if (err) {
                res.send({err:err});
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        console.log(req.session.user)
                        res.send(result)
                    } else {
                        res.send({message:"Invalid password. Enter a valid User password"})
                    }
                })
            }
            else {
                res.send({message:"Invalid User. Enter a valid User credentials"})

            }
            
        })
})



//admin connections

app.post("/api/admin", (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const password = req.body.password
    
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
        console.log(err)
    }
        db.query("INSERT INTO super_user (first_name,last_name,email,password) VALUES (?,?,?,?)",
        [firstname, lastname, email, hash],

        (err, result) => {
            if (err) {
                                          
                res.send({ message: "Account already exist, create a new account or login into an existing account" })
                console.log(result)
                res.send(result)
            
            }
            
         
        }
       
    );
})
   
});


app.post('/api/adlogin', (req, res) => {
    const email = req.body.email
    const password = req.body.password
  
    db.query(
        "SELECT * FROM super_user WHERE email = ?",
        email, 
        (err, result) => {
            if (err) {
                res.send({err:err});
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        console.log(req.session.user)
                        res.send(result)
                    } else {
                        res.send({message:"Invalid password. Enter a valid User password"})
                    }
                })
            }
            else {
                res.send({message:"Invalid User. Enter a valid User credentials"})

            }
            
        })
})




// end of admin connections


// contact us

app.post("/api/contact", (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const subject = req.body.subject
    const message = req.body.message

    db.query(
        "INSERT INTO 247_support (first_name,last_name,email,subject,message) VALUES (?,?,?,?,?)", [
            firstname,lastname,email,subject,message
    ], (err, result) => {
            if (err) {
                console.log(err)
                console.log(result)
                
            }
            
        }
    )
})


app.get('/api/contact', (req, res) => {
    db.query(
        "SELECT * from 247_support",
        (err, result) => {
         res.send(result)
        }
    )
})

// user data edit

app.get('/api/userid/:id', (req, res) => {
    
    const id = req.params.id;
    db.query(
        "SELECT * FROM users WHERE user_id = ?",id,
        (err, result) => {
            if (err) {
                console.log(err)
            }
            res.send(result)
            console.log
            // console.log(result)
        } 

    )
})



// account recovery

app.post('/api/recovery', (req, res) => {
    const email = req.body.email
  
    db.query(
        "SELECT * FROM users WHERE email = ?",
        email, 
        (err, result) => {
            if (err) {
                res.send({ err: err })
                console.log(err)
                
            }
            if (result.length > 0) {
                res.send(result)
            }
            else {
                res.send({message:"Account does not Exit. Enter valid user Email."})
            }
        }
      

            
        )
})


app.get('/api/recovery/:id', (req, res) => {
    
    const id = req.params.id;
    db.query(
        "SELECT * FROM users WHERE email = ?",id,
        (err, result) => {
            if (err) {
                console.log(err)
            }
            res.send(result)
            console.log
            // console.log(result)
        } 

    )
})


//password recovery
app.put('/api/recovery', (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const role = req.body.role
    const username = req.body.username
    const password = req.body.password

    console.log(password)
    
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err)
        }
        db.query("UPDATE users  SET first_name = ?, last_name = ?, password = ?,  username = ?, role = ? WHERE email = ? ",
            [firstname, lastname, hash, username, role, email],
            ((err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.send(result)

                    res.send({ message: "User Account Updated Sucessfully" })
                
                }
        
            })
        )
        

    })
    
});



// update user account
app.put('/api/update', (req, res) => {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const role = req.body.role
    const username = req.body.username
    const password = req.body.password
    db.query("UPDATE users  SET first_name = ?, last_name = ?, password = ?,  username = ?, role = ? WHERE email = ? ",
        [firstname, lastname, password, username, role, email],
        ((err, result) => {
            if (err) {
                console.log(err)
                res.send(result)
            }
            else {
                res.send({message:"User Account Updated Sucessfully"})
                
            }
        
    })
    )
        


    
})



//fetch 
app.get('/api/get', (req, res) => {
    db.query(
        "SELECT * FROM users",
        (err, result) => {
            res.send(result)
            // console.log(result)
        }

    )
})



app.get('/api/admin', (req, res) => {
    db.query(
        "SELECT * FROM super_user",
        (err, result) => {
            res.send(result)
            // console.log(result)
        }

    )
})



app.get('/api/login', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
})


app.get('/api/adlogin', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
})



//session verification
db.getConnection( (err, connection) => {
    if (err) throw err;
    console.log('Connected as ID' + connection.threadId)
    
})
    

    
app.get('api/logout', (req, res) => {
    if (req.session.user) {
        req.session.user == false
        res.send({ loggedIn: false })
        res.send({message:"you are loggedout, click to on login to go back"})
    }
})