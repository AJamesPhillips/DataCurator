set -e
cd ../data-curator-build/

set +e
git rm -rf .
set -e

git clean -fxd
cd -

cd app/frontend
npm run build
mkdir ../../../data-curator-build/app
mkdir ../../../data-curator-build/sim
cp ../../../data-curator-build/index.html ../../../data-curator-build/app/index.html
cp ../../../data-curator-build/index.html ../../../data-curator-build/sim/index.html

echo "datacurator.org" > ../../../data-curator-build/CNAME
touch ../../../data-curator-build/.nojekyll

cd -
