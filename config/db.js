const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',       
  user: 'root',            
  password: 'Passwordname@16', 
  database: 'course_management_db'
});

connection.connect(err => {
  if (err) {
    return console.error('❌ Error connecting: ' + err.stack);
  }
  console.log('✅ Connected as id ' + connection.threadId);
});

module.exports = connection;
