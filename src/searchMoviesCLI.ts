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

const selectFavourites = `
SELECT * from favourites
`;

function isInputInvalid(confirmSave: string) {
  if (confirmSave === 'y' || confirmSave === 'n') {
    return false
  } else {
    return true
  }
}

async function runOmdb() {
  await client.connect();
  console.log("You have successfully connected to omdb database");
  console.log("Welcome to search-movies-cli!");

  let userSearch = "";
  while (userSearch !== "q") {
    userSearch = question('Type to search for your movie / "q" to quit / "s" to see favourites: ')
      .toLowerCase();

    const selectSearch = `
    SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count, kind
    FROM movies
    WHERE 
      lower(name) LIKE '%${userSearch}%' AND
      kind = 'movie' AND
      date IS NOT null
    ORDER BY date DESC
    LIMIT 5
  `;



    if (userSearch === "q") {
      console.log("Sad to see you go!");
      client.end();
      return;
    }

    if (userSearch === "s") {
      console.log("Here are your favourites");
      const favouritesRes = await client.query(selectFavourites);
      console.table(favouritesRes.rows);
    } else {
      try {
        const searchRes = await client.query(selectSearch);
        console.table(searchRes.rows);
        const rowNumberToSave: string = question(
          `Please input the row number of the movies you would like to save (0-9) / "q" to quit: `
        );

        if (rowNumberToSave === "q") {
          console.log("Sad to see you go!");
          client.end();
          return;
        } else {
          const saveResult = searchRes.rows[parseInt(rowNumberToSave)];
          console.table([saveResult]);
          let confirmSave = ''

          while (isInputInvalid(confirmSave)) {
            confirmSave = question(`Are you sure you want to save this movie to favourites / y or n? `)
            if (confirmSave === 'y') {
              console.log("save")
            } else if (confirmSave === 'n') {
              console.log("Cancel")
            }
          }
        }
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
}

runOmdb();
