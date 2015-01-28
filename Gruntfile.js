module.exports = function(grunt) {

  grunt.initConfig({
    clean: ['dist'],

    usebanner: {
      taskName: {
        options: {
          position: 'top',
          process: function( filepath ) {
            return grunt.template.process(
              [
                '// banner for file: <%= filepath %>'
              ].join('\n'),
              {
                data: {
                  filepath: filepath
                }
              }
            );
          },
          // banner: '// <%= filepath %>',
          linebreak: true
        },
        files: {
          src: []
        }
      }
    }
  });

  grunt.registerTask("default", function(file) {

    // if file is specified, then add banner to that file only
    file && grunt.config.set('usebanner.taskName.files.src', [file]);

    // do the banner task
    grunt.task.run(["usebanner"])
  });

  // load all npm tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
}
