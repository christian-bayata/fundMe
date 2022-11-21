# fund-me-api

> An API that models basic features of a fintech app, such as user authentication and authorization, user creates account, transfers to other account including theirs, and also withdraw from their accounts. The API was built with Node JS, MongoDB, mongoose and other features like elasticsearch

| PROJECT FEATURE                                  |       STATUS       |
| :----------------------------------------------- | :----------------: |
| User Sign Up                                     | :white_check_mark: |
| User Sign In                                     | :white_check_mark: |
| User Password Reset                              | :white_check_mark: |
| Create Account                                   | :white_check_mark: |
| Transfer To Self/Other Account(s)                | :white_check_mark: |
| Withdraw From Account                            | :white_check_mark: |
| Check Account Balance                            | :white_check_mark: |
| Test Driven Development                          | :white_check_mark: |
| Continuous Integration and Continuous Deployment | :white_check_mark: |
| Search (Elastic Search)                          | :white_check_mark: |
| Test Coverage Reporting                          | :white_check_mark: |

- :cop: Authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- Documented using [Swagger](https://swagger.io). Find link to docs [here](http://206.189.227.235/api-docs)
- Background operations are run on [fund-me-background-service](https://github.com/christian-bayata/fundMe.git). Btw it is a public repo and is easily accessible.
- Uses [MongoDB](https://www.mongodb.com) as database.
- [Mongoose](https://mongoosejs.com) as object document model
- Environments for `development`, `testing`, and `production`
- Unit and Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [yarn scripts](#npm-scripts)
- Uses [Elastic Search](https://www.elastic.co/products/elasticsearch) for search operations
- example for User model and User controller, with jwt authentication, simply type `yarn start`

## Table of Contents

- [Install & Use](#install-and-use)
- [Folder Structure](#folder-structure)
- [Repositories](#repositories)
  - [Create a Repository](#create-a-repository)
- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
- [Models](#models)
  - [Create a Model](#create-a-model)
- [Middlewares](#middlewares)
  - [user middleware](#authmiddleware)
  - [account middleware](#adminmiddleware)
- [Services](#services)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
  - [Create Routes](#create-routes)
- [Test](#test)
  - [Setup](#setup)
- [yarn Scripts](#yarn-scripts)

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/christian-bayata/fundMe.git
```

then

```sh
# cd into project root
$ yarn
$ yarn start
```

## Folder Structure

This codebase has the following directories:

- api - for controllers and routes.
- config - Settings for mongoDB database and mongoose connection.
- logger - Winston setup for logs.
- logs - Output of API logs(winston) are found here.
- middlewares - All middleware functions for users, accounts and errors.
- helper - Contains functions to support the controllers
- models - Database schema definitions, plugins and model creation
- repositories - Wrappers for database functions (Similar to DAO)
- tests - Automated tests for the project
- utils - Functions used often in codebase and tests
- views - EJS views to be rendered (not used anyways)

## Repositories

### Create a repository

Repositories are wrappers around the models and use dependency injection to take the model as input
I used [Mongoose](https://mongoosejs.com) as ODM, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).
Example Controller for all **CRUD** operations (taking the user respository as an example):

```js
const User = require("../models/user");

/**
 *
 * @param email
 * @returns {Promise<*>}
 */

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */

const createUser = async (data) => {
  return await User.create(data);
};

/**
 *
 * @param data
 * @returns {Promise<*>}
 */
const findUser = async (data) => {
  return await User.findOne(data);
};

/**
 *
 * @returns {Promise<*>}
 */
const findUsers = async () => {
  return await User.find();
};

/**
 *
 * @param data
 * @param id
 * @returns {Promise<void>}
 */
const updateUser = async (data, id) => {
  return await User.findOneAndUpdate({ _id: id }, data, { new: true });
};

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
const deleteUser = async (data) => {
  return await User.deleteOne(data);
};

/**
 *
 * @param query
 * @returns {Promise<void>}
 */
const searchUser = async (query) => {
  return await User.search({
    query_string: {
      query,
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUser,
  findUsers,
  updateUser,
  deleteUser,
  searchUser,
};
```

## Controllers

### Create a Controller

Controllers in the codebase have a naming convention: `modelName.js` (except for **search** which outsources from elastic-search service, and **auth** which shares the same model with **users**).
To use a model functions inside the controller, require the repository in the controller and use it. The controller should not have direct access to the Model except through the repository

Example Controller for all **CRUD** operations (taking the auth controller as an example):

```js
require("express-async-errors");
const userRepository = require("../../../repositories/user");
const Response = require("../../../utils/response");
const status = require("../../../status-code");
const _ = require("lodash");
const helper = require("../../../utils/helper");
const crypto = require("crypto");
const sendEmail = require("../../../utils/send-email");

/**
 * @Author Edomaruse, Frank
 * @Responsibility:  Sign up a new user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const userSignUp = async (req, res) => {
  const { data } = res;

  try {
    /* Check if user already exists */
    const userExists = await userRepository.findUserByEmail(data.email);
    if (userExists) return Response.sendError({ res, statusCode: status.CONFLICT, message: "User already exists" });

    const createdUser = await userRepository.createUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
    const theUser = _.pick(createdUser, ["_id", "firstName", "lastName", "email", "isAdmin"]);

    return Response.sendSuccess({ res, statusCode: status.CREATED, message: "User successfully signed up", body: theUser });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility:  Logs in an already signed up user
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const userLogin = async (req, res) => {
  const { data } = res;

  try {
    const userExists = await userRepository.findUserByEmail(data.email);
    if (!userExists) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    /* validate user password with bcrypt */
    const validPassword = await userExists.comparePassword(data.password);
    if (!validPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Incorrect Password! Unauthorized" });

    /* Generate JWT token for user */
    const token = userExists.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatUserData(data);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "User successfully logged in", body: { token, userData: protectedData } });
  } catch (error) {
    // console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Provide user with password reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Please provide a valid email" });

  try {
    const user = await userRepository.findUserByEmail(email);
    if (!user) return Response.sendError({ res, statusCode: status.NOT_FOUND, message: "Sorry you do not have an account with us. Please sign up" });

    //Create reset password token and save
    const getResetToken = await helper.resetToken(user);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/user/reset-password/${getResetToken}`;

    //Set the password reset email message for client
    const message = `This is your password reset token: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

    //The reset token email
    await sendEmail({ email: user.email, subject: "Password Recovery", message });

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset token successfully sent" });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

/**
 * @Responsibility: Enables user reset password with reset token
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    const user = await userRepository.findUser({ resetPasswordToken: token });
    if (!user) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token is invalid" });

    // Check to see if the token is still valid
    const timeDiff = +(Date.now() - user.resetPasswordDate.getTime());
    const timeDiffInMins = +(timeDiff / (1000 * 60));

    if (timeDiffInMins > 30) {
      user.resetPasswordToken = undefined;
      user.resetPasswordDate = undefined;
      await user.save();

      return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password reset token has expired" });
    }

    // Confirm if the password matches
    if (password !== confirmPassword) return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: "Password does not match" });

    // If password matches
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save();

    // Generate another Auth token for user
    const authToken = user.generateJsonWebToken();

    /* Format and hash user data for security */
    const protectedData = helper.formatUserData(user);

    return Response.sendSuccess({ res, statusCode: status.OK, message: "Password reset is successful", body: { token: authToken, userData: protectedData } });
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};

module.exports = {
  userSignUp,
  userLogin,
  forgotPassword,
  resetPassword,
};
```

## Models

### Create a Model

Models in this boilerplate have a naming convention: `Model.js` and uses [Mongoose](https://mongoosejs.com) to define our Models, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).

Example - User Model:

```js
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoosastic = require("mongoosastic");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    lastName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordDate: Date,
  },
  { timestamps: true }
);

/* Generate JSON web token for user */
UserSchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET_KEY
  );
};

/* Hash the password before storing it in the database */
UserSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    return next(err);
  }
});

/* Compare password using bcrypt.compare */
UserSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

UserSchema.plugin(mongoosastic);

/* Creates the user model */
const User = mongoose.model("User", UserSchema);
module.exports = User;
```

## Middlewares

Middleware are functions that can run before hitting a route.

Example middleware:

Authenticate User - only allow if the user is logged in

> Note: this is not a secure example, only for presentation purposes

```js
/**
 * @Responsibility:  Middleware authentication for users
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const authenticateUser = async (req, res, next) => {
  let { authorization } = req.headers;
  const { userId } = req.body;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  // decode jwt token from req header
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  // if token is invalid or has expired
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated! Please login" });
  }

  try {
    res.user = decode;

    return next();
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};
```

The same also goes for authorizing access to routes based on roles and privileges.
For instance:
Authorize User Access - only if user is an admin

```js
/**
 * @Responsibility:  Middleware authentication for admins
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

const isAdmin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    authorization = req.body.authorization;
  }

  // decode jwt token from req header
  const decode = jwt.verify(authorization, process.env.JWT_SECRET_KEY, (err, decoded) => decoded);

  // if token is invalid or has expired
  if (!authorization || !decode || !decode._id) {
    return Response.sendError({ res, statusCode: status.UNAUTHENTICATED, message: "Unauthenticated! Please login" });
  }

  try {
    const getAdmin = decode.isAdmin ? true : false;

    res.admin = getAdmin;
    return next();
  } catch (error) {
    console.log(error);
    return Response.sendFatalError({ res });
  }
};
```

## Config

Holds all settings for mongoDB database and mongoose connection.

## Connection and Database

> Note: if you use MongoDB make sure mongodb server is running on the machine
> This two files are the ways to establish a connection to a database.
> Now simply configure the keys with your credentials from environment variables

```js
require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
let connectionString;

switch (environment) {
  case "production":
    // Point the database credentials to the production DB here
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    break;
  case "test":
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`;
    break;
  default:
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

module.exports = connectionString;
```

To not configure the production code.

To start the DB, add the credentials for production. add `environment variables` by typing e.g. `export DB_USER=yourusername` before starting the api or just include credentials in the env file

## Routes

Here you define all your routes for your api.

## Create Routes

For further information read the [guide](https://expressjs.com/en/guide/routing.html) of express router.

Example for User Resource:

> Note: Only supported Methods are **POST**, **GET**, **PUT**, and **DELETE**.

user.js

```js
const { Router } = require("express");
const userMiddleware = require("../../../middlewares/user");
const userController = require("../controllers/user");

const userRouter = Router();

userRouter.get("/get-users", userMiddleware.isAdmin, userController.getUsers);

userRouter.patch("/update-user/:id", userMiddleware.authenticateUser, userMiddleware.updateUserValidation, userController.updateUser);

userRouter.delete("/delete-user/:id", userMiddleware.isAdmin, userController.deleteUser);

module.exports = userRouter;
```

Although individually placed, all routes are eventually combined into one mother-route called 'index.js'.
index.js

```js
const { Router } = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");

const router = Router();

router.use("/auth", authRouter);

router.use("/user", userRouter);

module.exports = router;
```

The index route is then exported and required in app.js file

```js
const router = require("./api/v1/routes/index");

/* Initialize express application */
const app = express();

/* Bind app port to index router */
app.use("/api", router);
```
## Test

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So please read their docs on further information.

### Controller

> Note: those request are asynchronous, we use `async await` syntax.

> All controller actions are wrapped in a function to avoid repetitive try...catch syntax

To test a Controller we create `requests` to our api routes.

Example `GET /user` from last example with prefix `prefix`:

```js
const request = require('supertest');
const {
  beforeAction,
  afterAction,
} = require('../setup/_setup');

let api;

beforeAll(async () => {
  api = await beforeAction();
});

afterAll(() => {
  afterAction();
});

test('test', async () => {
  const token = 'this-should-be-a-valid-token';

  const response = await request(server)
  				.put(`${baseURL}/${testQuestion._id}`)
  				.set("x-auth-token", token)
  				.send(payload);
  			expect(response.status).toEqual(401);
});
```
