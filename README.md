> #### **Displaimer:** This project is still in early development and **MUST NOT BE USED ON PRODUCTION**

# Caravel
Deploy your apps in production, effortlessly.

## How it works:

The first step is to install Caravel on your server using `npm install -g caravel`, then you can create a new folder and add a `caravel.json` to it (it doesn't matter where you're going to create this folder as its only going to keep the configuration and temp files, but its important for your user to have permission on it).

An example of a `caravel.json` config file would be:
```json
{
    "name": "My Project",
    "repo": "https://path-to-my-repo.git",
    "deployDirectory": "/path/to/deploy/place",
    "buildArgs": ["npm test", "npm build", "grunt etc", "gulp blabla"],
    "buildFolder": "./build"
}

```

| Key                  | Definition        |
| -------------------- |-------------|
| `name`               | The project name (you can give the name you want to) |
| `repo`               | Git repository URL      |
| `deployDirectory`    | Path where the build should be moved to in case of success      |
| `buildArgs`          | Commands that should run prior to build |
| `buildFolder`        | Name of the folder where your build is generated |

#### Running build and watching changes

Once you've created a `caravel.json` file you can then run (inside the same folder):

```bash
$ caravel fetch      # get newest stuff from repository
$ caravel build -i   # make the build. (-i arg means npm install will run first)
```

If you want to keep watching for changes in the repository, simply run:

```bash
caravel watch   # will watch for changes in repository
```
