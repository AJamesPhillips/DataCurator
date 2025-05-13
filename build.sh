# To build a new version of the DataCurator app:
#   1. We expect there to be the `data-curator-build` repo in the same directory as the `DataCurator` repo
#   2. `cd` into root directory of this DataCurator repo
#   3. Run `./build.sh`

set -e
echo "cd ../data-curator-build/"
cd ../data-curator-build/

set +e
# Remove the assets, app, sim directories so that we can replace them with the new build
echo "rm -rf assets app sim"
rm -rf assets app sim
mkdir app
mkdir sim
# git rm -rf .
set -e

# echo "git clean -fxd"
# git clean -fxd
cd -

echo "cd app/frontend"
cd app/frontend

echo "npm run build"
npm run build
cd -

echo "Moving files..."
# mv ../data-curator-build/index_landing_page.html ../data-curator-build/index.html

cp -r app/frontend/dist/* ../data-curator-build/
cp ../data-curator-build/index.html ../data-curator-build/app/index.html
cp ../data-curator-build/index.html ../data-curator-build/sim/index.html

echo "Build completed"
