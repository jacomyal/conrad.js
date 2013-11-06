module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    closureLint: {
      app:{
        closureLinterPath: '/usr/local/bin',
        src: ['src/conrad.js'],
        options: {
          stdout: true,
          strict: true
        }
      }
    },
    jshint: {
      all: ['src/conrad.js'],
      options: {
        '-W055': true,
        '-W040': true
      }
    },
    qunit: {
      all: {
        options: {
          urls: [
            './test/unit.html'
          ]
        }
      }
    },
    uglify: {
      options: {
        banner: '/* conrad.js - <%= pkg.description %> - Version: <%= pkg.version %> - Author:  Alexis Jacomy, Sciences-Po médialab - License: MIT */\n'
      },
      prod: {
        files: {
          'build/conrad.min.js': ['src/conrad.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-closure-linter');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // By default, will check lint, hint, test and minify:
  grunt.registerTask('default', ['closureLint', 'jshint', 'qunit', 'uglify']);
};
