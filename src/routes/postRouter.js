import baseRouter from "./baseRouter.js";
import { uploader } from "../middlewares/multer.js";
import postModel from "../dao/models/postModel.js";

export default class PostRouter extends baseRouter {
  init() {
    // RENDER CREATE POST
    this.get("/createpost", async (req, res) => {
      if (!req.session.isLogged) {
        return res.redirect("/login");
      }

      const username = req.session.username;
      res.render("createpost", { username });
    });

    // CREATE POST
    this.post("/createpost", uploader.single("file"), async (req, res) => {
      try {
        const { title, description } = req.body;
        const post_image = req.file.originalname;
        const user = await postModel.findById(req.session.user);
        const newPost = await postModel.create({
          title,
          description,
          post_image,
          user: req.session.userId,
        });
        res.redirect("/home");
      } catch (error) {
        res.send(error);
      }
    });

    // RENDER EDIT POST
    this.get("/editpost/:id", async (req, res) => {
      if (!req.session.isLogged) {
        return res.redirect("/login");
      }
      const postId = req.params.id;
      const username = req.session.username;

      if (!postId) {
        res.send("no existe");
      }

      res.render("editpost", { postId, username });
    });

    // EDIT POST
    this.put("/editpost/:id", uploader.single("file"), async (req, res) => {
      try {
        const postId = req.params.id;
        const { title, description } = req.body;
        const post_image = req.file.filename;

        const updatedPost = await postModel.findOneAndUpdate(
          { _id: postId },
          {
            title,
            description,
            post_image,
          },
          { new: true }
        );
        console.log(updatedPost);

        res.redirect("/home");
      } catch (error) {
        console.log(error);
      }
    });

    // RENDER DELETE POST
    this.get("/deletepost/:id", async (req, res) => {});

    // DELETE POST
    this.delete("/deletepost/:id", async (req, res) => {
      try {
        const postId = req.params.id;
        const deletePost = await postModel.findByIdAndDelete(postId);

        res.redirect("/home");
      } catch (error) {
        console.log(error);
      }
    });

    // RENDER USER POSTS
    this.get("/myposts", async (req, res) => {
      if (!req.session.isLogged) {
        return res.redirect("/login");
      }

      const userId = req.session.userId;
      const userPosts = await postModel
        .find({ user: userId })
        .populate("user")
        .lean();
      const username = req.session.username;

      for (const post of userPosts) {
        post.edit = post.user.toString() === userId;
      }

      res.render("myposts", {
        posts: userPosts,
        username,
      });
    });
  }
}
