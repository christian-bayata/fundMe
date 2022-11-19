# stack-overflow-lite-api

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
