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
