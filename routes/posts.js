/*
 * All routes for posts are defined here
 * Since this file is loaded in server.js into /posts,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

//now able to use search function with lowercase
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT posts.*, avg(rating) as average_rating, count(likes.*) as total_likes,
    comments.* as comments
    FROM posts
    JOIN ratings ON posts.id = ratings.post_id
    JOIN likes ON posts.id = likes.post_id
    JOIN comments ON posts.id = comments.post_id
    GROUP BY posts.id,comments.id;`)
      .then(data => {
        const posts = data.rows;
        console.log(posts);
        res.json({ posts });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  //search function

  router.post("/search/", (req, res) => {
    let topic = req.body.topic.toLowerCase();
    topic = capitalizeFirstLetter(topic);
    db.query(`SELECT * FROM topics WHERE topic = $1;`, [topic])
      .then(result => {
        const topicObj = result.rows[0]

        db.query(`SELECT posts.*, avg(rating) as average_rating, count(likes.*) as total_likes,
        comments.* as comments
        FROM posts
        JOIN ratings ON posts.id = ratings.post_id
        JOIN likes ON posts.id = likes.post_id
        JOIN comments ON posts.id = comments.post_id
        WHERE posts.topic_id = $1
        GROUP BY posts.id,comments.id;`, [topicObj.id])
          .then(data => {
            const posts = data.rows;
            res.json({ posts });
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });
      })
  });

  //need req.session.userId
  // router.post("/comment", (req, res) => {
  //   const { id, post } = req.body;
  //   const userID = 1;
  //   console.log(id);
  //   db.query(`INSERT INTO comments
  //   (user_id, post_id, comment)
  //   VALUES ($1, $2, $3)
  //   RETURNING *;
  //   `, [userID, id, post])
  //     .then(data => {
  //       const posts = data.rows;
  //       console.log(id,post);
  //       res.json({ posts });
  //     })
  //     .catch(err => {
  //       res
  //         .status(500)
  //         .json({ error: err.message });
  //     });

  // })
return router;
};




