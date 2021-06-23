
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


## Optional: Output data to Obsidian / Markdown

<b style="background-color: pink; color: black;">This is write only.  If you edit these files outside DataCurator the changes will be overwritten and lost.</b>  (for now)


1. Start the server
2. Find the new file: app/server/config.json
3. edit the entry for `output_markdown_directory` to be an absolute path to the directory to output the data.  For example: `"output_markdown_directory": "/Users/user_name/data_curator_info"` where `user_name` is replaced with your username and `data_curator_info` is a directory.
