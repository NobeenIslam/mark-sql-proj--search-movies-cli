import { Client } from "pg";

const dropFavourites = `
    DROP TABLE IF EXISTS favourites
`;
const createFavourites = `
    CREATE TABLE favourites (
        favourite_id INTEGER,
        movie_id INTEGER,
        name TEXT,
        date DATE,
        runtime INT4,
        budget NUMERIC,
        revenue NUMERIC,
        vote_average NUMERIC,
        vote_count INT8,
        kind TEXT,
        PRIMARY KEY (favourite_id),
        FOREIGN KEY (movie_id) REFERENCES movies (id)
    );
`;
const selectAllFavourites = `
        SELECT * from favourites
`;
const insertDummyFavourite = `
        INSERT INTO favourites 
        VALUES (1,1)
`;

async function favouritesTable() {
  const client = new Client({ database: "omdb" });
  await client.connect();
  console.log("You connected to the omdb database");
  try {
    await client.query(dropFavourites);
    await client.query(createFavourites);
    //await client.query(insertDummyFavourite);
    const res = await client.query(selectAllFavourites);
    console.table(res.rows);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.end();
    console.log("Thank you for joining!");
  }
}

favouritesTable();
