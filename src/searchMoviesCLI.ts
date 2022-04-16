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
const selectRemakes = `
select 
	movies_1.id as original_movie_id,
    movies_1.name as original_name,
    movies_1.date as original_date,
    m_ref.movie_id as remake_movie_id,
    movies_2.name as remake_name,
	movies_2.date as remake_date,
    m_abs.abstract 
from movies movies_1
JOIN movie_references m_ref ON movies_1.id = m_ref.referenced_id
JOIN movies movies_2 ON movies_2.id = m_ref.movie_id
JOIN movie_languages m_lang ON movies_1.id = m_lang.movie_id
LEFT JOIN movie_abstracts_en m_abs ON movies_1.id = m_abs.movie_id
-- WHERE m2.type = 'Remake';
WHERE m_ref.type = 'Remake' AND m_lang.language = 'en'
ORDER BY original_movie_id;

`;

async function runOmdb() {
  try {
    await client.connect();
    console.log("You have successfully connected to omdb database");
    console.log("Welcome to search-movies-cli!");

    const searchString = readlineSync.question(
      'Type to search for your movie or "q" to quit '
    );
    const selectSearch = `
      SELECT id,name,date,budget
      FROM movies
      where name LIKE '${searchString}%'
      order by date
      limit 10
    `;

    const res = await client.query(selectSearch);
    console.table(res.rows);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.end();
  }
}

runOmdb();
