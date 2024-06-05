# AI ChatApp

## Description
This is an AI chat application that allows users to interact with a chatbot. The chatbot is capable of responding to user messages and maintaining a conversation history.

## Prerequisites
Before running this project, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Clone the Repository
First, clone the repository to your local machine:
```bash
git clone <repository-url>
cd <repository-name>
```

### Environment Variables
Create a `.env` file in the root directory of the project and add the following environment variables:
```bash
MONGODB_URI= <mongodb-uri>
OPENAI_API_KEY = <openai-api-key>
EMAIL_USER = <email-user>
EMAIL_PASS = <email-pass-key>
JWT_SECRET = <jwt-secret>
```
### Ports
Make sure the following ports are available:
- 3000
- 3002

## Build and Run the Project
### Using Docker Compose
Note: do the following steps in the root directory of the project.
#### Run Docker Compose
We have a docker-compose.yml file, so we can use Docker Compose to build and run the project with a single command:
```bash
sudo docker-compose up --build
```

### Using Docker

#### Build the Docker Image
Navigate to the directory containing the Dockerfile and run the following command to build the Docker image:
```bash
docker build -t <image-name> .
```
#### Run the Docker Container
Note: Please use port 3002 for backend and 3000 for frontend. Use the image name you used in the previous step.

Replace `<host-port>` and `<container-port>` with the desired port numbers. 
After building the image, you can run a container using:
```bash
docker run -p <host-port>:<container-port> <image-name>
```
Exmaple:
```bash
docker run -p 3002:3002 <image-name>
```
## Stopping the Application

To stop the application, you can use the following command:
### Using Docker Compose
```bash 
docker-compose down
```
### Using Docker
```bash
docker stop <container-id>
```

