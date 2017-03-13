#!/bin/bash 

#DEPENDENCIES
install wp cli if missing
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp



git clone $1
cd $1
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master

mkdir public_html
cd public_html
wp core download
cd ..

projectName=$(basename $(git remote show -n origin | grep Push | cut -d: -f2-))
IFS='.' read -r -a array <<< "$projectName"
projectName=${array[0]}


git remote add sample-project git@code.tf:daniel/sample-web-project.git
git fetch sample-project
git merge sample-project/master
git remote remove sample-project
git branch --unset-upstream
git push --set-upstream origin master

echo "NEW PROJECT : $projectName ";  

# Replace YOURTHEME -> PROJECTNAME 
sed -i '' "s/YOURTHEME/$projectName/g" ./public_html/wp-content/themes/YOURTHEME/css/less/style.less
sed -i '' "s/YOURTHEME/$projectName/g" ./public_html/wp-content/themes/YOURTHEME/header.php
sed -i '' "s/YOURTHEME/$projectName/g" .gitignore

# Rename files and directories named YOURTHEME -> PROJECTNAME 
mv public_html/wp-content/themes/YOURTHEME/css/less/YOURTHEME.less public_html/wp-content/themes/YOURTHEME/css/less/$projectName.less
mv public_html/wp-content/themes/YOURTHEME public_html/wp-content/themes/$projectName
lessc public_html/wp-content/themes/$projectName/css/less/style.less public_html/wp-content/themes/$projectName/style.css

git commit -am "my first commit" 
git push

cd public_html/wp-content/themes/$projectName/
sudo npm install --save-dev gulp-install
sudo npm install gulp
sudo npm install
gulp

# Empty README 
> README.md 