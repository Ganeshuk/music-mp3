const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json())

// Read the SSL certificate files


const pool = new Pool({
    user: 'ganesh', // Change this to your PostgreSQL username
    host: 'late-grivet-9239.7tc.aws-eu-central-1.cockroachlabs.cloud', // Change this to your PostgreSQL server hostname
    database: 'shoes', // Change this to your PostgreSQL database name
    password: '5wWNnS8ksbzJ59JU_74JFQ', // Change this to your PostgreSQL password
    port: 26257,
    ssl: {
        rejectUnauthorized: false, // For CockroachDB, set this to true if SSL mode is verify-full
      }// Change this to your PostgreSQL port if different (default is 5432)
   // Provide SSL options
});

// Execute a test query to check the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
        
    } else {
        console.log('Connected to PostgreSQL database');
    }
});

app.listen(3007,()=>{
    console.log("connceted")
})
    
app.post("/update", (request, response) => {
    console.log(request.body);

    // Use parameterized query to prevent SQL injection
    const song_check = 'SELECT * FROM audiolibrary WHERE songs_name ILIKE $1';
    pool.query(song_check, [request.body.song_name+"%"], (err, row) => {
        if (err) {
            console.error("Error checking song:", err);
            response.status(500).json({ error: "An error occurred while checking the song." });
        } else {
            if (row.rows.length > 0) {
                console.log("Song already exists:", row.rows[0]);
                response.json({ message: "Song already exists." });
            } else {
                console.log("Song not found, proceeding to insert...");
                const { movie_name, song_name, movie_img, song_link } = request.body;
                console.log("Received data:", { movie_name, song_name, movie_img, song_link });
                const insertQuery = 'INSERT INTO AudioLibrary(movie_name, songs_name, movie_img, song_link) VALUES ($1, $2, $3, $4)';
                pool.query(insertQuery, [movie_name, song_name, movie_img, song_link], (err, result) => {
                    if (err) {
                        console.error("Error inserting song:", err);
                        response.status(500).json({ error: "An error occurred while inserting the song." });
                    } else {
                        console.log("Song inserted successfully.");
                        response.json({ message: "Song created successfully." });
                    }
                });
            }
        }
    });
});

app.get("/songs/:id",(request,response)=>{
    console.log("songs")
    const { id } = request.params; // Extract the value of the 'id' parameter from the URL
    
    // Assuming 'id' is used to fetch data from the database
    // You can use the 'id' to retrieve specific data from your database
    // Example: Fetch data from the database based on the 'id'
    pool.query('SELECT * FROM audiolibrary WHERE id = $1', [id], (err, result) => {
        if (err) {
            response.json("songs not in data ")
        }
        else{
            response.json(result.rows[0])
        }
        
})
      
})  
app.get("/movie",(request,response)=>{
    const {name}=request.query
    console.log(name)
    if(name===undefined){
        const q=`SELECT  
    movie_name, 
    COUNT(songs_name) AS song_count, 
    MAX(movie_img) AS movie_img, 
    MAX(song_link) AS song_link 
FROM 
    audiolibrary 
GROUP BY 
    movie_name;`
    pool.query(q,(err,row)=>{
        if(err){
            response.json(err)
        }
        else{
            response.json(row.rows)
        }
    })
    }
    else{
        const q=`select * from audiolibrary where movie_name ILIKE $1`
        pool.query(q,[name+"%"],(err,row)=>{
            if(err){
                response.json(err)
            }
            else{
                response.json(row.rows)
            }
        })
    }
    
})
