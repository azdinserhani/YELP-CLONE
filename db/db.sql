INSERT INTO restaurants VALUES ('azdine','ksar',3) RETURNING *;

UPDATE restaurants SET name = 'zakariya', location = 'fes' ,price_range= 3 WHERE id = 2;
DELETE FROM restaurants WHERE id = 3;


CREATE TABLE reviews(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
    name VARCHAR(50) NOT NULL,
    reviews TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5)
);

INSERT INTO reviews (restaurant_id,name,reviews,rating) VALUES (30,"king","bad restaurant",1.5);

SELECT restaurants.*, COALESCE(reviews.count, 0) AS review_count, COALESCE(TRUNC(reviews.average_rating, 1), 0) AS average_rating FROM restaurants LEFT JOIN (SELECT restaurant_id,COUNT(*) AS count,AVG(rating) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id;