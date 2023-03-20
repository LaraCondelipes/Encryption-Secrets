//jshint esversion:6

/*requerer e usar o package dotenv que iremos usar para usarmos as variáveis de ambiente para guardarmos as nossas chaves 
encriptadas e as nossas chaves de API's. (na doc sugere que seja o mais cedo possível requerido.Por essa razão encontra-se no 
   topo do código.)*/
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

//ter acesso às variáveis de ambiente
//console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

//usar o encryption mongoose
//criar o schema a partir do mongoose schema class(passou de um objecto semples a um objecto mongoose (adicionámos o new mongoose.Schema)):
const userSchema = new mongoose.Schema({
   email: String,
   password: String
});

//a variável abaixo (const secret) foi copiado para o ficheiro .env e modificado paar poder ser aceite nesse ficheiro(variáveis de ambiente)
//usar secret string(); method para encriptografar o nosso banco de dados
//string que será encriptada
//const secret = "Thisisourlitlesecret.";

//é importante que esta linha de código fique antes da criação do nosso model do mongoose (ver documentação mongoosejs.com/docs/plugins.html).
//substituimos {secret : secret (...)} por {secret : process.env.SECRET (...)} para lermos a variável de ambiente 
userSchema.plugin(encrypt, { secret : process.env.SECRET , encryptedFields : ["password"] });
//criar o model do mongoose
const User = new mongoose.model("User", userSchema);

//direcionar a rota e renderizar a página "home"
app.get("/", function (req, res) {
   res.render("home");
});

//renderizar a rota para a rota login e renderizar a página "login" 
app.get("/login", function (req, res) {
   res.render("login");
});

//renderizar a rota para a rota register e renderizar a página "register"
app.get("/register", function (req, res) {
   res.render("register");
});

//criar o utilizador na rota register
app.post("/register", function (req, res) {
   const newUser = new User({
      email: req.body.username,
      password: req.body.password
   });
   //salvar o novo utilizador criado no nosso banco de dados "userDB"
   newUser.save().then((err) => {
      res.render("secrets");
   }).catch((err) => {
      res.send(err);
   });


});
//para fazer a validação do login do utilizador
app.post("/login", function (req, res) {
   
   const username = req.body.username;
   const password = req.body.password;

   User.findOne({email : username}).then((foundUser) => {
      if(password === foundUser.password) {
         //res.send(foundUser);
         res.render('secrets');
      
      }else{
        
         res.send("Wrong password!");
      }

   }).catch((err)=>{
      res.send(err);
   })


});



app.listen(3000, function () {
   console.log("server started on port 3000");
});

