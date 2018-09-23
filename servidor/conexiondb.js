const mysql = require('mysql');

const conexion = mysql.createConnection({
  host: 'localhost', 
  port: '3306', 
  user: 'usuariotest', 
  password: "test", 
  database: 'competencias' 
});

module.exports = conexion;

