module.exports = function (grunt) {
  "use strict";

  var path = require('path')
    , fs = require('fs')
    , crypto = require('crypto')
    , walk = require('walk')
    ;

  grunt.registerMultiTask('prune', "prune files that don't exist in source folder", function () {
    var me = this
      , done = me.async()
      , walker
      , haves = me.data.haves
      ;

    walker = walk.walk(me.data.base);

    walker.on('file', function (root, fileStats, next) {
      var destname
        ;
      
      destname = path.join(root, fileStats.name);
      if ( !haves[destname]  ) {
        fs.unlinkSync(destname); 
        grunt.log.writeln('Deleted: ' + destname);
      }

      next();
    });

    walker.on('end', function () {
      done();
    });
  });

  grunt.registerMultiTask('shopify-theme', function () {
    grunt.loadNpmTasks('grunt-contrib-copy');

    var me = this
      , assets 
      , configs 
      , checks = {}
      , destdir = me.data.destination || 'deploy'
      , copyTaskConfig
      , pruneTaskConfig
      , haves = {}
      ;

    assets = [
      '.css'
    , '.js'
    , '.liquid'
    , '.jpg'
    , '.svg'
    , '.gif'
    , '.png'
    ];

    configs = [
      'settings.html'
    , 'settings_data.json'
    ];

    checks.assets = function (filename) {
      if (1 < assets.indexOf(path.extname(filename))) {
        return false;
      }
      return true;
    };

    checks.config = function (filename) {
      if (-1 !== configs.indexOf(filename)) {
        return true;
      }
      return false;
    };

    function checkLiq (filename) {
      if ('.liquid' === path.extname(filename)) {
        return true;
      }
      return false;
    }

    checks.layout = checkLiq;
    checks.snippets = checkLiq;
    checks.templates = checkLiq;

    function createHashSync(pathname) {
      var hash = crypto.createHash('md5')
        , data = fs.readFileSync(pathname)
        ;

      hash.update(data);
      return hash.digest('hex');
    }

    function checkFile(filetype, pathname) {
      var stat
        , filename
        , destname
        , dstat
        , md5src
        , md5dst
        ;

      try {
        stat = fs.lstatSync(pathname);
      } catch(e) {
        return false;
      }

      // If not a file, bail immediately
      if (!stat.isFile()) {
        return false;
      } 

      filename = path.basename(pathname);

      // checks valid file extension for directory type
      if (!checks[filetype](filename)) {
        return false;
      }

      // ex: ./<destdir>/<filetype>/<filename>
      // ex: ./deploy/assets/style.css
      destname = path.join(destdir, filetype, filename);

      // gather haves
      haves[destname] = true;

      // compare destdir + filename against current pathname
      try {
        dstat = fs.lstatSync(destname);
        md5dst = createHashSync(destname);
      } catch(e) {
        dstat = {};
      }

      md5src = createHashSync(pathname);
      if (dstat.size === stat.size && md5src === md5dst) {
        return false;
      }
      
      return true;
    }

    copyTaskConfig = {
      assets: {
        files: [
          { expand: true
          , flatten: true
          , src: me.data.assets.src
          , dest: destdir + '/assets'
          , filter: checkFile.bind(null, 'assets')
          , onlyIf: 'modified'
          }
        ]
      },
      config: {
        files: [
          { expand: true
          , flatten: true
          , src: me.data.config.src 
          , dest: destdir + '/config'
          , filter: checkFile.bind(null, 'config')
          }
        ]
      },
      layout: {
        files: [
          { expand: true
          , flatten: true
          , src: me.data.layout.src
          , dest: destdir + '/layout'
          , filter: checkFile.bind(null, 'layout')
          }
        ]
      },
      snippets: {
        files: [
          { expand: true
          , flatten: true
          , src: me.data.snippets.src
          , dest: destdir + '/snippets'
          , filter: checkFile.bind(null, 'snippets')
          }
        ]
      },
      templates: {
        files: [
          { expand: true
          , flatten: true
          , src: me.data.templates.src 
          , dest: destdir + '/templates'
          , filter: checkFile.bind(null, 'templates')
          }
        ]
      }
    };

    grunt.config('copy', copyTaskConfig);
    grunt.task.run('copy');
  
    pruneTaskConfig = { all: { base: destdir, haves: haves } };
    grunt.config('prune', pruneTaskConfig);
    grunt.task.run('prune');
  });
};