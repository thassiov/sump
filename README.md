# sump - simple user management platform

> [!CAUTION]
> This is still *very* WIP

A definition from [dictonary.com](https://www.dictionary.com/browse/sump):
> _"sump: a pit, well, or the like in which water or other liquid is collected."_

But this collects *user accounts* to recirculate (auth).

## Dependencies

- nodejs (>= v20)
- postgres (>=v13)
- docker (>= 28.5) [optional]

## Installation

```sh
npm install -g sump

# or clone the repo and install the dependencies
git clone https://github.com/thassiov/sump.git
cd sump
npm install

# or pulling it as a docker container from docker hub
docker pull thassiov/sump:1.0
```


## Start a standalone server (RESTful)

```sh 
# after installing globally
sump -c config.json

# or after cloning the repo
npm start -- -c config.json

# or after pulling the container image
docker run \
 --name sump-service \
 -p 8080:8080 \
 --read-only -v /<path_to_your_config_file>/config.json:/app/config.json
 -d thassiov/sump:1.0
```


## How to use it

First you have to create a tenant. It will hold all the users you create. To create your tenant you'll need to send 3 things

- the tenant's details: name (required) and custom properties (optional);
- the tenant's owner account (you);
- the tenant's first environment (optional - if you don't send this info, a 'default' environment will be created).

```sh 
curl --location 'http://localhost:8080/api/v1/tenants' \
--header 'Content-Type: application/json' \
--data-raw '{
    "tenant": {
        "name": "my first tenant",
        "customProperties": {
            "app": "my-app"
        }
    },
    "account": {
        "name": "My Name",
        "email": "my-email@example.com",
        "phone": "+0000000000000",
        "username": "myusername",
        "roles": [
            "owner"
        ],
        "avatarUrl": "https://placehold.co/600x400"
    },
    "environment": {
        "name": "dev",
        "customProperties": {
            "app": "my-app"
        }
    }
}'
```

It responds with the following payload when the request is successfull (HTTP 201)

```json
{
   "tenantId": "UUID",
   "accountId": "UUID",
   "environmentId": "UUID",
}
```


Now you can add/signup your app users in the new environment (using the environment's UUID as endpoint parameter)

```sh 
curl --location 'http://localhost:8080/api/v1/environments/<UUID>/accounts' \
--header 'Content-Type: application/json' \
--data-raw '{
        "name": "Tqassio Victor",
        "email": "tvmcarvasho@gmail.com",
        "phone": "+5555991287726",
        "username": "thasasidv",
        "roles": ["owner"],
        "avatarUrl": "https://placehold.co/600x400"
}'
```

## Reference 

[Reference](/docs/img/readme.md)

### License
[MIT](./LICENSE), of course.
