# NTUA ECE SAAS 2024 PROJECT
  
## solveMyProblem - TEAM 15

<p align="center">
  <img src="frontend/public/assets/images/logo.svg" width="25%"/>
</p>

solveMyProblem is a SaaS application designed to provide users with solutions to complex problems requiring significant computational resources and specialized software licenses. The application leverages cloud infrastructure to offer high computational power and uses software licenses we provide. Users pay based on their resource usage.

## Features

- User Management
- Google Account Login
- Purchase Credits for Problem Solving
- Submit Problems for Solution
- Manage Problem Solving Execution
- Display List of Submitted/Solved Problems
- Display Statistics of Submitted/Solved Problems

## Dependencies

- Docker

## Getting Started

### Prerequisites

Ensure you have Docker installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solveMyProblem.git
   cd solveMyProblem
   
2. Build and start the docker containers
   ```bash
   sudo docker compose up --wait
   ```
   ![Peek 2024-09-27 00-18](https://github.com/user-attachments/assets/25e76faf-c32e-4f0f-9977-377261fe53f2) 
4. Access the application

Join the frontend from `http://localhost:3000`

Join the admin panel from `http://localhost:3001`

Usage showcase:
![Peek 2024-09-27 01-07](https://github.com/user-attachments/assets/c12b3d45-3847-4393-93da-aa7c4004f48a)
![Peek 2024-09-27 01-09](https://github.com/user-attachments/assets/5093b704-fe9b-40de-85f0-b5f4e86af112)
![Peek 2024-09-27 01-12](https://github.com/user-attachments/assets/5931c511-2c33-4ee3-80ae-757e618111db)

## Notes
This application uses multiple solver services for parallel executions. You can set the number of solvers in the `.env` file of root directory as well as the execution runtime timeout in seconds. By default, solvers are 3 and execution timeouts are 300 seconds. If this time is exceeded, solver stops.

## Example Inputs
In `test_solver` directory a .py code and some .json input_data can be found. Use them as example of inputs. Note that the code of the submission must: 
- be written in python
- accept only one argument of inputs in json format
- print the output in order to be saved in submission's output
