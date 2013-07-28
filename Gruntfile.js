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
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // By default, will check lint, test and minify:
  grunt.registerTask('default', ['closureLint', 'qunit', 'uglify']);
};
