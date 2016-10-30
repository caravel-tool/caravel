> #### ⚠️ This project is still in **early development** and MUST NOT BE USED ON PRODUCTION ⚠️️

# Caravel
[![NPM Version](http://img.shields.io/npm/v/caravel.svg?style=flat)](https://www.npmjs.org/package/caravel)
[![NPM Downloads](https://img.shields.io/npm/dm/caravel.svg?style=flat)](https://www.npmjs.org/package/caravel)

Deploy your apps in production, effortlessly.

## Installation

    $ npm install -g caravel

## Configuration

The first step is to install Caravel on your server, then you can create a new folder and add a `caravel.json` to it (it doesn't matter where you're going to create this folder as its only going to keep the configuration and temp files, but its important for your user to have permission on it).

An example of a `caravel.json` config file would be:
```json
{
    "name": "My Project",
    "repo": "https://path-to-my-repo.git",
    "deployDirectory": "/path/to/deploy/place",
    "buildArgs": ["npm test", "npm build", "grunt etc", "gulp blabla"],
    "buildFolder": "./build",
    "watchInterval": 50000
}

```

| Key                  | Definition        |
| -------------------- |-------------|
| `name`               | The project name (you can give the name you want to) |
| `repo`               | Git repository URL      |
| `buildArgs`          | Commands that should run prior to build |
| `buildFolder`        | Name of the folder where your build is generated |
| `deployDirectory`    | Path where the build should be moved to in case of success      |
| `watchInterval`      | The interval to check for changes(in milliseconds, 1000 will be 1 second) |

#### Running build and watching changes

Once you've created a `caravel.json` file you can then run (inside the same folder):

```bash
$ caravel fetch      # get newest stuff from repository
$ caravel build   # make the build. (by default, caravel runs npm install before builds. To prevent this, use `-n` flag)
```

If you want to keep watching for changes in the repository, simply run:

```bash
caravel watch   # will watch for changes in repository
```
Caravel runs on port `7007` but you can change it using the argument `--port`:
```bash
caravel watch --port 5555 # will just watch but using the specified port
```
