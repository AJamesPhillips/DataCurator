Only edit this `shared` directory in frontend (or server) before copying from one to the latter:

    cd app
    cp -r frontend/src/shared/ server/src/shared

    cd app/frontend/src
    cp -r ./shared/ ../../server/src/shared
