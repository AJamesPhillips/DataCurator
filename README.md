
# Data curator

Sign up at [datacurator.org](https://datacurator.org/app/)

A collaborative real time planning application for complex projects.  Integrates a subset of features from:

* whiteboard applications like Miro
* micro note taking, hierarchical and knowledge hyper graphs like [Obsidian](https://obsidian.md/), [Workflowy](https://workflowy.com/a/), [Roam Research](https://roamresearch.com/), [TheBrain](https://www.thebrain.com/)
* Gantt chart like Microsoft project

The data is store in a Supabase account we operate.  In future we would like to allow you to host your own data in [Solid pods](https://solidproject.org/about) or something equivalent.


# Local app development

## Setup (on Mac)

    $ git clone git@github.com:centerofci/data-curator2.git

### Install frontend dependencies

    cd app/frontend
    yarn install

## Running the app

### Start the frontend server

    cd app/frontend
    npm start

Then visit [http://localhost:8080/app#wcomponents/&view=knowledge](http://localhost:8080/app#wcomponents/&view=knowledge)


## Disabled ~~Optional: Output data to Obsidian / Markdown~~

This does not work at the moment because the support for the local server has been removed in favour of collaborative "source of truth" central DB in the form of supabase.

<b style="background-color: pink; color: black;">This is write only.  If you edit these files outside DataCurator the changes will be overwritten and lost.</b>  (for now)


1. Start the server
2. Find the new file: app/server/config.json
3. edit the entry for `output_markdown_directory` to be an absolute path to the directory to output the data.  For example: `"output_markdown_directory": "/Users/user_name/data_curator_info"` where `user_name` is replaced with your username and `data_curator_info` is a directory.


## [Development notes](./DEVELOPMENT_NOTES.md)
