<p align="center">
  <img src="logo.svg" width="100" style="margin: 50px 0">
  <br>
  Caravel: Deliver simple things, with simplicity.
</p>

Caravel is a tool (still in development) to help devs publish and update code at production servers.

The idea is simple: Small projects (such as simple Node apps or static websites) doesn't consume lot's of resources in order to build. So instead of hiring CI/CD paid plans or wasting time building robust config stacks, devs can make use of their own VPS to build and publish updates.

## Installation

As of today Caravel only supports being compiled from source. In the future, binaries will be released for Linux.

Make sure you have *git*, *SQLite* and *Crystal*.

Example in Ubuntu:

Installing git and SQLite (Ubuntu):

```
apt-get install git-core sqlite3 
```

Installing Crystal (Ubuntu):

```
curl -sSL https://dist.crystal-lang.org/apt/setup.sh | sudo bash
```

And then:

```
sudo apt install crystal
```

If you face any issues, please [read this guide](https://crystal-lang.org/reference/installation/).


Then you can build the project:

```
cd caravel/
crystal build src/caravel
sudo cp ./caravel /usr/local/bin
```

Now you can check if Caravel is available by running:

```
caravel help
```

## Usage

In order to use Caravel you first need a recipe file.

### Recipes

Caravel always looks for a `caravel.yml` file when run on a directory.

Here is a minimal example of a config file (also called recipe):

```yaml
name: your-repo
repo: git@github.com:you/your-repo
trigger: tag
run:
  - npm install
  - npm run build
  - cp -R dist /www/var/html/
```

Once you have a recipe, you can call Caravel with the command:
```
caravel start
```

More details on recipes soon.

----

This README is still in work.