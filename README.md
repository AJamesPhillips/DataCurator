
# DataCurator

A collaborative real time planning application for complex projects.  Integrates a subset of features from:

* whiteboard applications like Miro
* complex system maps like [Kumu](https://kumu.io/), [InsightMaker](https://insightmaker.com) from [Scott Fortmann-Roe](https://github.com/scottfr/) (Oct 2024 - calculations are now supported!)
* micro note taking, hierarchical and knowledge hyper graphs like [Obsidian](https://obsidian.md/), [Workflowy](https://workflowy.com/a/), [Roam Research](https://roamresearch.com/), [TheBrain](https://www.thebrain.com/)
* theory of change maps like [TOCO](https://www.theoryofchange.org/toco-software/)
* Gantt chart like Microsoft project

Find out more at [DataCurator.org](https://datacurator.org/), view [an example map](https://datacurator.org/app/#wcomponents/&storage_location=16&subview_id=b97c6b8e-b920-4a10-b446-b84588eebd56&view=knowledge&x=8&y=-1909&zoom=12) or [sign up](https://datacurator.org/)

### Data storage

The data is store in a Supabase account we operate.  In future we would like you to be able to more easily host your own data in [Solid pods](https://solidproject.org/about) or something equivalent.

## Future improvements

* [Provide single pages for components, like a wikipedia page](https://github.com/centerofci/DataCurator/discussions/178)
  * For each component allow many [different data sets](https://github.com/centerofci/DataCurator/discussions/180), versions of these sets, published by different authors, to be associated with each
* Support simple calculations to derive data from other data sets
* Use these data sets inside existing maps by providing a data field in the statev2 component
* Support multiple attributes similar to Kumu, alternatively allow components within a parent view to be an addressable i.e. be like "public" class attributes in programming languages.
  * Allow causal connections to specify these
* Graph exploration features
  * Show the shortest connections between two different groups of nodes
* Support a [Modelica](https://modelica.org/modelicalanguage.html) compliant model of causal effects within a system
  * allow these models to be exported
  * have a generic simulation/interaction engine for these models with a UI like [Loopy](https://ncase.me/loopy/) or [InsightMaker](https://insightmaker.com) to help people build intuitions about how the complex systems might behave to various changes and interventions
  * allow people to build more complex (in terms of visuals & interactive) simulations like [TheWorldSim](https://theworldsim.org/sims/energy-explorer)
* Improve multi user real time editing
  * add current user cursors'
  * update
  * show which knowledge view/map other users are looking at
  * conflict-free replicated data type (CRDT) for description text and other fields
* Use [Solid pods](https://solidproject.org/about) or a different self-hostable backend like [Mathesar](https://github.com/centerofci/mathesar/)


# Local app development

## Setup (on Mac)

    $ git clone git@github.com:centerofci/DataCurator.git

### Install frontend dependencies

    cd app/frontend
    pnpm install

## Running the app

### Start the frontend server

    cd app/frontend
    npm start

Then visit [http://localhost:8080/app#wcomponents/&view=knowledge](http://localhost:8080/app#wcomponents/&view=knowledge)


# Deployment notes

DataCurator currently hosted on Github

## Setup

    # Clone into adjacent directory
    git clone git@github.com:AJamesPhillips/data-curator-build.git

## Build & deployment

Currently broken as of 2023-09-05

    ./build.sh
    cd ../data-curator-build
    git commit
    git push


# Console API

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


# [Development notes](./DEVELOPMENT_NOTES.md)
