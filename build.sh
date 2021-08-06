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
cp ../../../data-curator-build/index.html ../../../data-curator-build/app/index.html

echo "datacurator.org" > ../../../data-curator-build/CNAME
touch ../../../data-curator-build/.nojekyll

cd -
