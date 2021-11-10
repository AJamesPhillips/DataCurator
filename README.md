
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


## Console API

You can navigate to a knowledge view, open the developer console, and use the following script to get a matrix of the connected components:

```javascript
    current_visible_graph = window.console_api.get_current_visible_graph()
    connection_matrix = current_visible_graph.get_connection_matrix()

    console.log(window.console_api.matrix_to_csv(connection_matrix))
```

If you want to get the components by title instead of ID you can use:

```javascript
    connection_matrix_using_titles = window.console_api.matrix_component_ids_to_titles(window.console_api.get_wcomponents_by_id(), connection_matrix)
    console.log(window.console_api.matrix_to_csv(connection_matrix_using_titles))
```

If you want to get the components by a compound of their labels and an ordinal you can use:

```javascript
    component_id_to_label_names_map = current_visible_graph.get_component_id_to_label_names_map()
    connection_matrix_using_label_names = window.console_api.matrix_component_ids_to_labels(component_id_to_label_names_map, connection_matrix)
    console.log(window.console_api.matrix_to_csv(connection_matrix_using_label_names))
```


## Disabled ~~Optional: Output data to Obsidian / Markdown~~

This does not work at the moment because the support for the local server has been removed in favour of collaborative "source of truth" central DB in the form of supabase.

<b style="background-color: pink; color: black;">This is write only.  If you edit these files outside DataCurator the changes will be overwritten and lost.</b>  (for now)


1. Start the server
2. Find the new file: app/server/config.json
3. edit the entry for `output_markdown_directory` to be an absolute path to the directory to output the data.  For example: `"output_markdown_directory": "/Users/user_name/data_curator_info"` where `user_name` is replaced with your username and `data_curator_info` is a directory.


## [Development notes](./DEVELOPMENT_NOTES.md)
