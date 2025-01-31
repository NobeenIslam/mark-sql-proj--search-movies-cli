import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

const selectSearch = `
SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count, kind
FROM movies
WHERE 
  lower(name) LIKE $1 AND
  kind = 'movie' AND
  date IS NOT null
ORDER BY date DESC
LIMIT 10
`;

async function quitClient() {
  console.log("Sad to see you go!");
  await client.end();
}

async function runSaveSequence(saveResultRows: any[]) {

  const rowNumberToSave: string = question(
    `Please input the row number of the movie you would like to save (0-9) / "q" to go back to new search: `
  );

  if (rowNumberToSave === "q") {
    return;
  } else {
    const saveResult = saveResultRows[parseInt(rowNumberToSave)];
    const valuesToAddToFavourites = Object.keys(saveResult).map(key => saveResult[key])
    console.table([saveResult]);
    let confirmSave = "";

    while (isInputInvalid(confirmSave)) {
      confirmSave = question(
        `Are you sure you want to save this movie to favourites / y or n? `
      );
      if (confirmSave === "y") {
        try {
          
          console.log("Movie has been saved")

          const insertRes = await client.query(`
          INSERT into favourites (movie_id,name,date,runtime,budget,revenue,vote_average,vote_count,kind)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *
        `, valuesToAddToFavourites)
        
        }catch(err){
          console.log(err.stack)
        }
      } else if (confirmSave === "n") {
        console.log("Save Canceled");
      }
    }
  }
}

function isInputInvalid(confirmSave: string) {
  if (confirmSave === "y" || confirmSave === "n") {
    return false;
  } else {
    console.log("Please put y or n")
    return true;
  }
}


async function runOmdb() {
  await client.connect();
  console.log("You have successfully connected to omdb database");
  console.log("Welcome to search-movies-cli!");

  let userSearch = "";
  while (userSearch !== "q") {
    userSearch = question(
      'Type to search for your movie / "q" to quit / "s" to see favourites: '
    ).toLowerCase();

    if (userSearch === "q") {
      quitClient();
      return;
    }

    if (userSearch === "s") {
      console.log("Here are your favourites");
      const favouritesRes = await client.query(`SELECT * FROM favourites`);
      console.table(favouritesRes.rows);
    } else {
      try {
        const searchRes = await client.query(selectSearch, [`%${userSearch}%`]);
        console.table(searchRes.rows);

        runSaveSequence(searchRes.rows);
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
}

runOmdb();
