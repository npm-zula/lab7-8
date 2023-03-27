const User = require("../models/user");
const usersRouter = require("express").Router();

usersRouter.post("/", async (request, response) => {
    const body = request.body;
    const user = new User({
        username: body.username,
        password: body.password,
        isAdmin: body.isAdmin,
    });
    const savedUser = await user.save();
    response.json(savedUser);
});


module.exports = usersRouter;