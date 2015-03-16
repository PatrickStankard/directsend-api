/* jslint node: true */

'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [
                '*.js',
                'lib/*.js'
            ],
            options: {
                node: true,
                eqeqeq: true,
                eqnull: true,
                indent: 4,
                latedef: true,
                newcap: true,
                quotmark: 'single',
                trailing: true,
                undef: true,
                unused: true,
                maxlen: 80
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', 'jshint');
    grunt.registerTask('default', 'watch');
};
