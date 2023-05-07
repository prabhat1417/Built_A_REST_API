const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Run main function and catch error
main().catch((err) => console.log(err));
async function main() {
  //localhost ain't working because in config it's binding to 127.0.0.1 
  const url = "mongodb://127.0.0.1:27017";
  const dbPath = "/wikiDB";
  await mongoose.connect(url + dbPath, {
    useNewUrlParser: true,
  });

  const ArticlesSchema = new mongoose.Schema({
    title: String,
    content: String
  });

  const Articles = mongoose.model("Articles", ArticlesSchema);

  app.route("/articles")
    .get(function (req, res) {
      Articles.find().then((article) => {
        res.send(article);
      }).catch(err => {
        console.log(err);
      });
    })

    .post(function (req, res) {
      // console.log(req.body.title);
      // console.log(req.body.content);
      const newArticles = new Articles({
        title: req.body.title,
        content: req.body.content
      });
      newArticles.save().then(() => {
        res.send("Article added to wikiDB");
      })
        .catch(err => {
          res.status(400).send("Unable to save the article");
        });

    })

    .delete(function (req, res) {
      Articles.deleteMany().then(() => {
        res.send("All Articles deleted in wikiDB")
      })
        .catch(err => {
          res.status(400).send("Unable to delete articles");
        })

    });

  //  Request for specific articles

  app.route("/articles/:articleTitle")
    .get(function (req, res) {
      Articles.findOne({ title: req.params.articleTitle })
        .then(function (foundArticle) {
          if (foundArticle)
            res.send(foundArticle);
          else
            res.send("This Article doesn't exist.");
        })
        .catch(function (err) {
          res.status(400).send("Unable to find the article");
        })
    })

    .put(function (req, res) {
      Articles.replaceOne({ title: req.params.articleTitle },
        { title: req.body.title, content: req.body.content },
        { overwrite: true }
      )
        .then(() => {
          res.send("Successfully updated article.")
        })
        .catch(err => {
          res.status(400).send("Unable to update article.");
        })
      //replaceone and updateone
      //here if we can update content only & title will be wipped out because put 
      // request update whole data instead of specific element there for we use push 
    })

    .patch(function (req, res) {
      Articles.updateOne({ title: req.params.articleTitle },
        { $set: req.body }
      )
        .then(() => {
          res.send("Article updated successfully!");
        })
        .catch((err) => {
          res.status(400).send("Unable to update article");
        });
    })

    .delete(function (req, res) {
      Articles.deleteOne({ title : req.params.articleTitle}
      )
        .then(() => {
          res.send("Article deleted successfully!");
        })
        .catch((err) => {
          res.status(400).send("Unable to delete article");
        });
    });

  app.listen(3000, function () {
    console.log("Server is running on port 3000");
  });
}