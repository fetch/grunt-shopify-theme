# grunt-shopify-theme

> Compile assets from any organizational structure into a valid Shopify theme.

In order to deploy a Shopify theme, the theme assets must be organized into the conventional five directories with certain files contained within each. This structure may not be the most desirable for the theme developer's workflow. This grunt task allows the developer to specify multiple sources for each type of Shopify theme asset so the proper theme is compiled into a deployment subdirectory when the grunt task runs.

Only files which do not exist in their current form in the deployment directory are copied. This helps keep the job light when the deployment directory is being watched by a Shopify theme uploader.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-shopify-theme --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-shopify-theme');
```

*This plugin was designed to work with Grunt 0.4.x.*

## Configuration
This example shows the simplest possible Gruntfile.js which might be used to set up the `grunt-shopify-theme` task. No options are specified, so defaults will be used. This assumes that your base directory contains the following folders:

```
assets/
config/
layout/
snippets/
templates/
```

Each of these directories will be checked recursively for files which are allowed in the theme. The theme will be compiled in a subdirectory under the base of `deploy/`.

```javascript
module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json') ,
    'shopify-theme': {
      target: {}
    }
  });

  grunt.loadNpmTasks('shopify-theme');
  
  grunt.registerTask('default', ['shopify-theme']);
};
```

This Gruntfile.js example demonstrates all possible options which can be specified for the `grunt-shopify-theme` task.

```javascript
module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json') ,
    'shopify-theme': {
      target: {
        destination: 'deploy/theme', // set the path to the deployment directory, by default this is deploy/
        assets: {
          src: ['assets/css/*', 'assets/images/**', 'assets/js/*', 'assets/fonts/*'], // src assets from as many directories as you like, use blob (**) for recursive searching
          options: {
            extensions: ['.mov', '.aiff'] // by default common images, css, js or liquid files are allowed in the assets folder, you can allow additional extensions here
          }
        },
        config: {
          src: ['config/*'] // config only allows settings.html and settings_data.json, if you render your settings.html with Jade or Haml, no worries about the other files
        },
        layout: {
          src: ['layout/*'] // the remaining three sources only allow liquid files
        },
        snippets: {
          src: ['snippets/*']
        },
        templates: {
          src: ['layout/**'] // use blog to search subdirectories and your directory structure can be as fancy as you wish
        }
      }
    }
  });

  // consider using watch to run this task when source files change

  // pair it with a desktop uploader or another task which can upload your files directly to shopify, just watch the deployment folder for changes

  grunt.loadNpmTasks('shopify-theme');
  
  grunt.registerTask('default', ['shopify-theme']);
};
```

## How This Plugin Works
A Shopify theme is comprised of 5 directories:

```
/assets
/config
/layout
/snippets
/templates
```

There are limitations for each of these directories. The task watches the source directory and looks for these subdirectories, applying rules to each which will copy all applicable files, leaving behind anything which is not part of a proper Shopify theme.

A few rules are applied to the source files for each of these directories and the options are there to source from multiple directories for each type of Shopify theme asset. These rules allow sources to deviate from the structure of the deployed Shopify theme. Source: well-organized. Deployment: messy but who cares?

## Task Rules
Rules for each Shopify theme subdirectory:

#### Assets
+ Any image file
+ Any .css or .css.liquid file
+ And .js or .js.liquid file
+ Additional extensions can be added using Gruntfile.js

#### Config
+ Only settings.html and settings_data.json files

#### Layout
+ Any .liquid file

#### Snippets
+ Any .liquid file

#### Templates
+ Any .liquid file

## Complementary Tasks/apps
There are several options for handling the deployment of your theme. Any other grunt task or app which can watch a directory and upload changes will be a great compliment to this task.

## Future Development
I plan to add the capability of deploying changes directly to Shopify at some point in the future. For now, there are many other options for watching and deploying.
