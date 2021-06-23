
# Data curator

## Setup (on Mac)

    $ git clone git@github.com:centerofci/data-curator2.git

### Install server dependencies

    cd app/frontend
    yarn install

### Install server dependencies

    cd app/server
    yarn install

## Running the app

### Start the backend server

    cd app/server
    npm start

### Start the frontend server

    cd app/frontend
    npm start

Then visit [http://localhost:8080/app#wcomponents/&view=knowledge](http://localhost:8080/app#wcomponents/&view=knowledge)


## Output data to Obsidian / Markdown

1. Start the server
2. Find the new file: app/server/config.json
3. edit the entry for `output_markdown_directory` to be an absolute path to the directory to output the data.  For example: `"output_markdown_directory": "/Users/user_name/data_curator_info"` where `user_name` is replaced with your username and `data_curator_info` is a directory.
