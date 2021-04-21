#!/bin/bash
# Helper script for common interactions with db
# TODO move to app/src/scripts

# Run setup script

if [[ $1 = "setup" ]]; then

    echo "Running setup..."

    source .env.test
    createuser $PRIVATE_SERVER_CONFIG_DB_USERNAME
    user_name=$PRIVATE_SERVER_CONFIG_DB_USERNAME
    createdb $PRIVATE_SERVER_CONFIG_DB_DATABASE

    source .env.development
    if [[ user_name =~ $PRIVATE_SERVER_CONFIG_DB_USERNAME ]]; then
        createuser $PRIVATE_SERVER_CONFIG_DB_USERNAME
    fi
    createdb $PRIVATE_SERVER_CONFIG_DB_DATABASE

    echo SUCCESS

    exit 0
fi

# Set up correct environment

set -a
if [[ $1 = "t" || $1 = "test" ]]; then
    # Note, only the $NODE_ENV, $PRIVATE_SERVER_CONFIG_DB_USERNAME and $PRIVATE_SERVER_CONFIG_DB_DATABASE values are used.
    source .env.test
elif [[ $1 = "d" || $1 = "dev" ]]; then
    # Note, only the $NODE_ENV, $PRIVATE_SERVER_CONFIG_DB_USERNAME and $PRIVATE_SERVER_CONFIG_DB_DATABASE values are used.
    source .env.development
elif [[ $1 = "s" || $1 = "staging" ]]; then
    # Note, only the $NODE_ENV, $PRIVATE_SERVER_CONFIG_DB_USERNAME and $PRIVATE_SERVER_CONFIG_DB_DATABASE values are used.
    source .env.staging
elif [[ $1 = "p" || $1 = "production" ]]; then
    # Note, only the $NODE_ENV, $PRIVATE_SERVER_CONFIG_DB_USERNAME and $PRIVATE_SERVER_CONFIG_DB_DATABASE values are used.
    source .env.production
else
    echo Unsupported environment: \"$1\"
    exit 1
fi
set +a

# Parse second command for migrations, database seeding, starting an
# interaction shell.

if [[ $2 = "m" || $2 = "migrate" ]]; then

    ./node_modules/.bin/sequelize db:migrate --env $NODE_ENV

elif [[ $2 = "u" || $2 = "undo" ]]; then

    read -r -p "Undo migration and DESTROY data.  Are you sure? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
        ./node_modules/.bin/sequelize db:migrate:undo --env $NODE_ENV
    else
        echo "Skipping"
    fi

elif [[ $2 = "undoall" ]]; then

    if [[ $NODE_ENV != "development" ]]; then
        echo "Can only undo all migrations on development (not $NODE_ENV) database using this command."
        exit 1
    fi

    read -r -p "Undo all migrations and DESTROY all data.  Are you sure? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
        ./node_modules/.bin/sequelize db:migrate:undo:all --env $NODE_ENV
    else
        echo "Skipping"
    fi

elif [[ $2 = "DESTROY" ]]; then

    if [[ $NODE_ENV != "development" ]]; then
        echo "Can only destroy and reseed development (not $NODE_ENV) database using this command.\
            test environment has it's own setup and seed db command.  staging is work in progress"
        exit 1
    fi

    read -r -p "Undo all migrations, DESTROY all data, run all migrations and reseed.  Are you sure? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
        ./node_modules/.bin/sequelize db:migrate:undo:all --env $NODE_ENV
        ./node_modules/.bin/sequelize db:migrate --env $NODE_ENV
        node compiled_all/scripts/seed_db.js
    else
        echo "Skipping"
    fi

elif [ "$#" -eq 2 ]; then

    echo Unsupported command: \"$2\"
    exit 1

elif [ "$#" -ge 2 ]; then

    echo Unsupported commands: \"$@\"
    exit 1

else

    echo "Connection to \"$NODE_ENV\" database..."
    psql -U $PRIVATE_SERVER_CONFIG_DB_USERNAME $PRIVATE_SERVER_CONFIG_DB_DATABASE

fi
