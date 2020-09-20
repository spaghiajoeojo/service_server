import { auth } from "../middleware/auth";
import * as bcrypt from "bcrypt";
import User, { IUser, validate } from "../models/user.model";
import * as express from 'express';
import { Request, Response } from 'express';

export const userRoute = express.Router();

userRoute.get("/current", auth, async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

userRoute.post("/signup", async (req: Request, res: Response) => {
  // validate the request body first
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //find an existing user
  let user: IUser = await User.findOne({
    email: req.body.email
  });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email
  });
  user.password = await bcrypt.hash(user.password, 10);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    email: user.email
  });
});

userRoute.post("/login", async (req: Request, res: Response) => {

  let user = await User.findOne({
    name: req.body.name
  });
  if (!user) return res.status(400).send("User not registered.");

  if (!await bcrypt.compare(req.body.password, user.password)) {
    return res.status(400).send("Wrong password.");
  }

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    email: user.email
  });

});

