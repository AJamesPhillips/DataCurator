Only edit this `shared` directory in frontend (or server) before copying from one to the latter:

    cd app
    rm -rf server/src/shared && cp -r frontend/src/shared/ server/src/shared

Or as usually working in `app/frontend/src`:

    cd app/frontend/src
    rm -rf ../../server/src/shared && cp -r ./shared/ ../../server/src/shared
