
# Installing dependencies for developing locally

You do not need to follow these steps if you just want to use the application: you can sign up at datacurator.org/app and start using it straight away.

## Mac

* `git`, which can be installed via:
  * [GitHub Desktop](https://desktop.github.com/)
  * [brew](https://brew.sh/)
  * [install directly](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* an [account on GitHub](https://github.com/join?ref_cta=Sign+up)
* `Node` (runs javascript on your computer like a headless browser)
  * Open a terminal and follow [these instructions](https://github.com/nvm-sh/nvm#install--update-script) namely run: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
  * Then using `nvm` to install the latest version of `node` using `nvm install`
* `pnpm` or `yarn`, which once you have `node` installed, you can use: `npm install -g pnpm`, or `npm install -g yarn` 

At this point you can move to the [README.md](./README.md) and follow the "Setup" instructions.

## Windows

* [Install cygwin](https://www.cygwin.com/install.html)
* Follow the instructions above.
* For the README.md part you will need to find your project directory which is likely at: C:\Users\<your user name>\Documents\GitHub\data-curator2 so you can use: `cd /cygdrive/c/Users/<your user name>/Documents/GitHub/data-curator2`
