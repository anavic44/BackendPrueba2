const cors = require('cors');

var express = require('express');
var app = express();
app.use(cors());
app.use(express.json());
const path = require('path');

var sql = require("mssql");

var config = {
    user: 'DreamKillers',
    password: 'essentialFavorable71',
    server: '185.157.245.175', 
    port: 1433,
    database: 'DreamKillersDB',
    trustServerCertificate: true,
};

// Read
app.get('/api/Objeto/:id_objeto', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from Objeto where id_objeto = " + req.params.id_objeto;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});

// Update EscenaObjeto
app.put('/api/EscenaObjeto/:id_escenaObjeto', function (req, res) {
    // Connect to your database
    sql.connect(config).then(pool => {
        // Extract data from request body
        const { escala, posicion, id_objeto, id_escena } = req.body;
        const id_escenaObjeto = req.params.id_escenaObjeto;

        // Build the update statement using parameters
        return pool.request()
            .input('escala', sql.VarChar, escala)
            .input('posicion', sql.VarChar, posicion)
            .input('id_objeto', sql.Int, id_objeto)
            .input('id_escena', sql.Int, id_escena)
            .input('id_escenaObjeto', sql.Int, id_escenaObjeto)
            .query(`UPDATE EscenaObjeto SET 
                escala = @escala, 
                posicion = @posicion, 
                id_objeto = @id_objeto,
                id_escena = @id_escena
                WHERE id_escenaObjeto = @id_escenaObjeto`);
    }).then(result => {
        // Check if any rows were affected
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('EscenaObjeto updated successfully.');
        } else {
            res.status(404).send('EscenaObjeto not found.');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Failed to update EscenaObjeto.');
    });
});



app.get('/api/Escena/:id_escena', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from Escena where id_escena = " + req.params.id_escena;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});
/*
app.get('/api/EscenaObjeto/:id_escenaObjeto', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from EscenaObjeto where id_escenaObjeto = " + req.params.id_escenaObjeto;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
});
*/
// Existing index.js setup
// Modify the /api/EscenaObjeto endpoint to join with Objeto table
app.get('/api/EscenaObjeto', function (req, res) {
    const { id_escena } = req.query; // Get id_escena from query parameters

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error connecting to the database.');
            return;
        }

        var request = new sql.Request();
        let query = `SELECT eo.id_escenaObjeto, eo.escala, eo.posicion, o.objUrl, o.mtlUrl
                     FROM EscenaObjeto eo
                     JOIN Objeto o ON eo.id_objeto = o.id_objeto`;
        if (id_escena) {
            query += ` WHERE eo.id_escena = @idEscena`; // Filter by id_escena
            request.input('idEscena', sql.Int, id_escena);
        }

        request.query(query, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to retrieve data.');
                return;
            }
            res.send(result.recordset);
        });
    });
});


app.post('/api/EscenaObjeto', function (req, res) {
    // Connect to your database
    sql.connect(config).then(pool => {
        // Extract data from request body
        const { escala, posicion, id_objeto, id_escena, id_usuario } = req.body;

        // Ensure all required fields are provided
        if (id_objeto == null || id_escena == null || id_usuario == null) {
            return res.status(400).send('Missing required fields: id_objeto, id_escena, or id_usuario');
        }

        // Build the INSERT statement using parameters
        return pool.request()
            .input('escala', sql.VarChar, escala)
            .input('posicion', sql.VarChar, posicion)
            .input('id_objeto', sql.Int, id_objeto)
            .input('id_escena', sql.Int, id_escena)
            .input('id_usuario', sql.Int, id_usuario)
            .query(`INSERT INTO EscenaObjeto (escala, posicion, id_objeto, id_escena, id_usuario) 
                    VALUES (@escala, @posicion, @id_objeto, @id_escena, @id_usuario)`);
    }).then(result => {
        // Check if the insert was successful
        if (result.rowsAffected[0] > 0) {
            res.status(201).send('EscenaObjeto created successfully.');
        } else {
            res.status(400).send('Failed to create EscenaObjeto.');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Failed to insert EscenaObjeto into the database.');
    });
});


// Create
app.post('/api/Usuario', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede connectar a la base de datos.');
        } else {
            const request = new sql.Request();
            console.log(req.body);
            const { username, password } = req.body;
            sentencia = `INSERT INTO Usuario (id, username, password) VALUES (((SELECT max(id) as ultimo FROM Usuario)+1), '${username}', '${password}')`;
            console.log(sentencia);
            request.query(sentencia, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('No se pudo crear el registro.');
            } else {
                res.status(201).send('Registro creado.');
            }
            });
        }
    });
});

app.get('/api/Usuarios/:id', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from usuario where id = '" + req.params.id + "'"; 
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});

// Create
app.post('/api/Perritos', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede connectar a la base de datos.');
        } else {
            const request = new sql.Request();
            const { nombre } = req.body;
            sentencia = `INSERT INTO Perrito (id_perrito, nombre_perrito) VALUES (((SELECT max(id_perrito) as ultimo FROM Perrito)+1), '${nombre}')`;
            console.log(sentencia);
            request.query(sentencia, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('No se pudo crear el registro.');
            } else {
                res.status(201).send('Registro creado.');
            }
            });
        }
    });
});

app.listen(2023, () => console.log("Listening on port 2023"));
