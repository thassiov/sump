# sump - solin/simple user management platform

> [!CAUTION]
> This is still *very* WIP

A definition from [dictonary.com](https://www.dictionary.com/browse/sump):
> _"sump: a pit, well, or the like in which water or other liquid is collected."_

But this collects *user accounts* to recirculate (auth). A identity platform.

### The idea and requirements

TL;DR: a personal project made as a study on the [SAGA pattern](https://microservices.io/patterns/data/saga.html) and making a program that can be used as either an imported npm package, a standalone monolith or some microservices.

### How it works (or at least should work)

##### The "moving parts"

There are 4 main components in this system:

- `tenant` - the main container that groups all the other components (like an `organization` in other platforms);
- `account` - related exclusively to the tenant management, it can (depending on the permissions) act on the other components and the tenant itself;
- `tenant-environment` - a sub container inside the tenant. This is where the actual users of whatever application this is plugged into will resider (eg. `dev`, `staging`, `prod` environments);
- `tenant-environment-account` - this is your application's user. It lives inside an environment from the tenant. This is *different* from the `account` model.

The typical use for a identity/user management platform, and what `sump` is itendend to facilitate, is the following:

- you setup your `tenant` (give it a name and some settings) and your root account (with the `owner` role),
- create a new `tenant-environment` (also give it a name and settings), 
- start creating users (`tenant-environment-account`) in the new environment and authenticating them when needed.

##### 

### Installation and Deployment 

##### As a npm module

Install
```sh
npm install sump
```

Importing it

```javascript
const Sump = require('sump');
// or
import Sump from 'sump';


// setup your configs
const sumpConfigs = {};
// creating a service instance
const sump = new Sump(sumpConfigs);

sump.<whatever>();
```


##### Using it as a standalone monolith service

To start it as a service you have options.

###### Using the `listen` method from the sump instance

This can give more flexibility on what your user management service do, like if you have some bootstraping to do prior starting the service or what not.
You can do the same thing as when you use it as a module, just by passing the correct configs (like port) and start it just like a express server:

```javascript

// setup your configs
const sumpConfigs = {};
// creating a service instance
const sump = new Sump(sumpConfigs);

sump.listen();
// or
sump.listen((port) => console.log(`server running! http://localhost:${port}`));
```

###### Using a docker image 

```sh
 # build the image locally from the repository
 docker buildx build \
    --build-context project=https://github.com/thassiov/sump.git \
    -t my_username_or_organization/sump_or_whatever:1.0 .

 # run a container from the built image, providing a config file (sump-config.json) and exposing the application port (8080) to the host
 docker run \
 --name sump-service \
 -p 8080:8080 \
 --read-only -v /<path_to_your_config_file>/sump-config.json:/app/sump-config.json
 -d my_username_or_organization/sump_or_whatever:1.0
```

### How to use it
### Development
### Roadmap (no guarantees it will be followed, though. but at least this is something)
### License
[MIT](./LICENSE), of course.
