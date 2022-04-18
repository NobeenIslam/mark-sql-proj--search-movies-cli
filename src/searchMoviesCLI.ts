import readlineSync from "readline-sync";
import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

const selectAllFromMovies = `
select * from movies
limit 1

`;

async function runOmdb() {
  await client.connect();
  console.log("You have successfully connected to omdb database");
  console.log("Welcome to search-movies-cli!");

  let userSearch = "";
  while (userSearch !== "q") {
    userSearch = readlineSync
      .question('Type to search for your movie / "q" to quit / "s" to see favourites: ')
      .toLowerCase();

    const selectSearch = `
    SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count, kind
    FROM movies
    WHERE 
      lower(name) LIKE '%${userSearch}%' AND
      kind = 'movie' AND
      date IS NOT null
    ORDER BY date DESC
    LIMIT 10
  `;

    if (userSearch === "q") {
      console.log("Sad to see you go!");
      client.end();
      return
    }

    try {
      const res = await client.query(selectSearch);
      console.table(res.rows);
    } catch (err) {
      console.log(err.stack);
    } finally {
      console.log("Search was successful!");
    }


  }


}

runOmdb();
