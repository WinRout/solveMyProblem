# NTUA ECE SAAS 2024 PROJECT
  
## solveMyProblem - TEAM 15

<p align="center">
  <img src="frontend/public/assets/images/logo.svg" width="25%"/>
</p>

### install depedencies
<a href="https://docs.docker.com/engine/install/ubuntu/#installation-methods">Install docker</a> <br>
<a href="https://nodejs.org/en"> Install NodeJS </a>

### instructions

To build microservices, mongo databases and kafka broker:

```sh
sudo docker compose up --wait
```

To start the development environment of the frontend, run inside the frontend folder:
```sh
npx next dev
```
Join the frontend from `localhost:3000`

## SaaS API

This API serves as the backend for a Software as a Service (SaaS) application. It provides endpoints for user management, submissions, execution requests, and more.

### Endpoints

#### 1. User Management

##### 1.1 User Create

- **Method:** POST
- **URL:** `localhost:4010/user-create`
- **Request Body:**
  ```json
  {
     "email": "user@example.com",
     "name": "User Example"
  }
  ```

##### 1.2 User Get

- **Method:** GET
- **URL:** `localhost:4010/user-get/user@example.com`

##### 1.3 Credits Update

- **Method:** POST
- **URL:** `localhost:4010/user-credits-update`
- **Request Body:**
  ```json
  {
     "email": "user@example.com",
     "credits": 30
  }
  ```

#### 2. Submission Management

##### 2.1 Submission Create

- **Method:** POST
- **URL:** `localhost:4011/submission-create/:type`
- **Request Body:**
  ```json
  {
     "email": "user@example.com",
     "submission_name": "Submission 1",
     "input_data": {
         "Locations": [
             {
                 "Latitude": 37.99983328183838,
                 "Longitude": 23.74317714798427
             },
             ...
         ],
         "num_vehicles": 4,
         "depot": 0,
         "max_distance": 10000
     },
     "max_secs": 10
  }
  ```
- **Example Query Parameter Values:**
  - `:type` - `routing`

##### 2.2 Submission Get

- **Method:** GET
- **URL:** `localhost:4011/submission-get/:type/:email/:submission_name`
- **Example Query Parameter Values:**
  - `:type` - `routing`
  - `:email` - `user@example.com`
  - `:submission_name` - `Submission 1`

##### 2.3 Execution Request

- **Method:** POST
- **URL:** `localhost:4011/submission-execute/:type/`
- **Request Body:**
  ```json
  {
     "submission_name": "Submission 1",
     "email": "user@example.com"
  }
  ```
- **Example Query Parameter Values:**
  - `:type` - `routing`

##### 2.4 Submission Update

- **Method:** POST
- **URL:** `localhost:4011/submission-update/:type`
- **Request Body:**
  ```json
  {
     "email": "user@example.com",
     "submission_name": "Submission 1",
     "max_secs": 60,
     "input_data": {
         "Locations": [
             {
                 "Latitude": 37.99983328183838,
                 "Longitude": 23.74317714798427
             },
             ...
         ],
         "num_vehicles": 4,
         "depot": 0,
         "max_distance": 10000
     }
  }
  ```
- **Example Query Parameter Values:**
  - `:type` - `routing`

#### 3. Statistics

##### 3.1 Statistics Get

- **Method:** GET
- **URL:** `localhost:4012/submissions-statistics-get/:type`
- **Example Query Parameter Values:**
  - `:type` - `routing`

#### 4. Miscellaneous

##### 4.1 Solvers State

- **Method:** GET
- **URL:** `localhost:4011/solvers-state/`

### Usage

You can use tools like Postman to make requests to these endpoints. Ensure that the server is running locally on the specified ports.

