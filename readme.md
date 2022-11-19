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
Example Controller for all **CRUD** operations:

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
