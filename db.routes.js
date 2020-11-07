
var config;

try {
    config = require('./config');
} catch {
    config = {};
}

var mysql = require('mysql');

// create the connection to the mySQL DB
connection = mysql.createPool({
    host: process.env.DB_HOST || config.DB_HOST,
    port: process.env.DB_PORT || config.DB_PORT,
    user: process.env.DB_USER || config.DB_USER,
    password: process.env.DB_PASSWORD || config.DB_PASSWORD,
    database: process.env.DB_NAME || config.DB_NAME,
});

// create all routes
function createRoutes(app) {

    //////////////////////////////////////////////////////////////////////////
    // Get all cities
    // GET /api/city?limit=<limit>&search=<search>
    //////////////////////////////////////////////////////////////////////////
    app.get('/api/city', (req, res) => {

        // set limit
        var limit = parseInt(req.query.limit);
        if (isNaN(limit)) { // check if limit is a valid number
            limit = 100; // set the default limit to 100
        }

        // set searchString
        var searchString = "%";
        if (req.query.search) {
            searchString = '%' + req.query.search + '%';
        }

        var sql = `SELECT * 
                FROM city
                WHERE Name LIKE ?
                LIMIT ?`;

        connection.query(sql, [searchString, limit], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message)
            }
            else {
                res.send(results)
            }
        })
    })

    //////////////////////////////////////////////////////////////////////////
    // Get country by id
    // GET /api/country/<id>
    //////////////////////////////////////////////////////////////////////////
    app.get('/api/country/:id', (req, res) => {

        var id = req.params.id;

        var sql = `SELECT * FROM country WHERE ID=?`;

        connection.query(sql, [id], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message);
            }
            else {
                res.send(results[0]);
            }
        })
    })

    //////////////////////////////////////////////////////////////////////////
    // Get all cities with the specified country code
    // GET /api/country/<countryId>/city
    //////////////////////////////////////////////////////////////////////////
    app.get('/api/country/:countryId/city', (req, res) => {

        var countryId = req.params.countryId;

        // Variant: Simple query only on table "city"
        // var sql = `SELECT * FROM city WHERE CountryID=?`;

        // More complex query on tables "city" and "country"
        var sql = `SELECT city.name as Gemeinde, city.Population as Einwohner
                FROM city
                INNER JOIN country ON city.CountryID=country.ID
                WHERE city.CountryID=?`;

        connection.query(sql, [countryId], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message)
            }
            else {
                //console.log(results);
                res.send(results)
            }
        })
    })

    //////////////////////////////////////////////////////////////////////////
    // Create a new city
    // POST /api/city
    // 
    // Example request body:
    //  {
    //    "name": "Winterthur",
    //    "population": 101000,
    //    "countryID": 1
    //  }
    //////////////////////////////////////////////////////////////////////////
    app.post('/api/city', (req, res) => {

        var name = req.body.name;
        var population = req.body.population;
        var countryID = req.body.countryID;


        var sql = `INSERT INTO city (Name, Population, CountryID)
                VALUES (?,?,?)`

        connection.query(sql, [name, population, countryID], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message)
            }
            else {
                var msg = {
                    "id": results.insertId
                }
                res.status(201).send(msg)
            }
        })
    })

    //////////////////////////////////////////////////////////////////////////
    // Update an existing city
    // PUT /api/city/<cityId>
    // 
    // Example request body:
    //  {
    //    "name": "Winterthur",
    //    "population": 101005,
    //    "countryID": 1
    //  }
    //////////////////////////////////////////////////////////////////////////
    app.put('/api/city/:id', (req, res) => {

        var cityId = req.params.id;

        var name = req.body.name;
        var population = req.body.population;
        var countryId = req.body.countryID;

        var sql = `UPDATE city
                SET name = ?, population = ?, countryID = ?
                WHERE ID = ?;`

        connection.query(sql, [name, population, countryId, cityId], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message)
            }
            else {
                var msg = {
                    "status": "success",
                    "id": results.insertId
                }
                res.send(msg)
            }
        })

    })


    //////////////////////////////////////////////////////////////////////////
    // Generic method to get records in a table
    // GET /api/<tableName>?limit=<limit>
    //////////////////////////////////////////////////////////////////////////
    app.get('/api/:table', (req, res) => {

        var table = req.params.table;

        // set limit
        var limit = parseInt(req.query.limit);
        if (isNaN(limit)) { // check if limit is a valid number
            limit = 100; // set the default limit to 100
        }

        var sql = `SELECT * 
                FROM ?? 
                LIMIT ?`;

        connection.query(sql, [table, limit], (error, results, fields) => {
            if (error) {
                console.log(error.message);
                res.status(500).send(error.message)
            }
            else {
                res.send(results)
            }
        })
    })

}

module.exports.createRoutes = createRoutes;