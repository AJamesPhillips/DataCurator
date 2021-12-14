set -e
cd ../data-curator-build/

set +e
git rm -rf .
set -e

git clean -fxd
cd -

cd app/frontend
npm run build
mv ../../../data-curator-build/index_landing_page.html ../../../data-curator-build/index.html
mkdir ../../../data-curator-build/app
mkdir ../../../data-curator-build/sim
cp ../../../data-curator-build/index_application.html ../../../data-curator-build/app/index.html
cp ../../../data-curator-build/index_application.html ../../../data-curator-build/sim/index.html

echo "datacurator.org" > ../../../data-curator-build/CNAME
touch ../../../data-curator-build/.nojekyll

cd -
