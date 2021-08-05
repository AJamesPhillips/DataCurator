cd ../data-curator-build/
git rm -rf .
git clean -fxd
cd -

cd app/frontend
npm run build
mkdir ../../../data-curator-build/app
cp ../../../data-curator-build/index.html ../../../data-curator-build/app/index.html
cd -
