import 'dotenv/config'
import express from "express";
import db from './db/index.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3006;
//wee need to use cors becose tp allow to defrent domain to talk each other ,
//in this case our front end have domain http://localhost:5173 and back end have
// domain http://localhost:3000 and this is a  diffrent domain
app.use(cors());


app.use(express.json());
//Get All Restaurants
app.get("/api/v1/restaurants", async (req, res) => {
    try {
        // const results = await db.query("SELECT * FROM restaurants");
        const restaurantRatingData = await db.query(
            "SELECT restaurants.*, COALESCE(reviews.count, 0) AS review_count, COALESCE(TRUNC(reviews.average_rating, 1), 0) AS average_rating " +
            "FROM restaurants " +
            "LEFT JOIN ( " +
            "   SELECT restaurant_id, COUNT(*) AS count, AVG(rating) AS average_rating " +
            "   FROM reviews " +
            "   GROUP BY restaurant_id " +
            ") reviews ON restaurants.id = reviews.restaurant_id;"
        )
        // console.log(restaurantRatingData.rows);
        res.status(200).json({
            status: "succes",
            results: restaurantRatingData.rows.length,
            data: {
                restaurants: restaurantRatingData.rows
            }
        })
    } catch (err) {
        console.log(err);
    }

});


//Get a restaurant
app.get("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const restaurant = await db.query(
            "SELECT restaurants.*, COALESCE(reviews.count, 0) AS review_count, COALESCE(TRUNC(reviews.average_rating, 1), 0) AS average_rating " +
            "FROM restaurants " +
            "LEFT JOIN ( " +
            "   SELECT restaurant_id, COUNT(*) AS count, AVG(rating) AS average_rating " +
            "   FROM reviews " +
            "   GROUP BY restaurant_id " +
            ") reviews ON restaurants.id = reviews.restaurant_id WHERE id = $1", [req.params.id]);

        const reviews = await db.query("SELECT * FROM reviews WHERE restaurant_id = $1", [req.params.id]);
        res.status(201).json({
            status: "succes",
            results: restaurant.rows.length,
            data: {
                restaurants: restaurant.rows[0],
                reviews: reviews.rows
            }
        })
    } catch (err) {
        console.log(err);
    }

});

//create restaurant
app.post("/api/v1/restaurants", async (req, res) => {
    const name = req.body.name;
    const location = req.body.location;
    const price_range = req.body.price_range;
    try {
        const results = await db.query("INSERT INTO restaurants(name,location,price_range) VALUES ($1,$2,$3) RETURNING *", [name, location, price_range]);
        res.status(200).json({
            status: "succes",
            results: results.rows.length,
            data: {
                restaurants: results.rows[0]
            }
        })
    } catch (err) {
        console.log(err);
    }

})

//Update restaurants
app.put("/api/v1/restaurants/:id", async (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const location = req.body.location;
    const price_range = req.body.price_range;
    try {
        const results = await db.query("UPDATE restaurants SET name = $1, location = $2 ,price_range= $3 WHERE id = $4 RETURNING *", [name, location, price_range, id]);
        res.status(200).json({
            status: "succes",
            results: results.rows.length,
            data: {
                restaurants: results.rows[0]
            }
        })
    } catch (err) {
        console.log(err);
    }


})

//Delete restaurants

app.delete("/api/v1/restaurants/:id", async (req, res) => {
    try {
        //this line to first remove all the reviews related to a current restaurant and after that remove the restaurant 
        await db.query("DELETE FROM reviews WHERE restaurant_id IN(SELECT id FROM restaurants WHERE restaurant_id = $1) ", [req.params.id]);
        await db.query("DELETE FROM restaurants WHERE id = $1", [req.params.id])

        res.status(204).json(
            {
                status: "succes"
            }
        )
    } catch (err) {
        console.log(err);
    }

})

app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    const restaurant_id = req.params.id;
    const name = req.body.name;
    const reviews = req.body.reviews;
    const rating = req.body.rating;
    try {
        const newReview = await db.query("INSERT INTO reviews (restaurant_id,name,reviews,rating) VALUES ($1,$2,$3,$4) RETURNING *",
            [restaurant_id, name, reviews, rating]);
        res.status(200).json({
            status: "succes",
            data: {
                reviews: newReview.rows[0]
            }
        })
    } catch (err) {
        console.log(err);
    }
})
app.listen(port, () => {
    console.log(`server run in port ${port}`);
})