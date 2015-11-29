// Generated on 2015-10-23 using generator-angular-fullstack 2.1.1
'use strict';
module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['./test/**/*.js']
            }
        },

        clean: {
            lib: './lib/*'
        },

	    jsdoc: {
		    dist: {
			    src: ['bin/index.js'],
			    options: {
				    destination: 'doc'
			    }
		    }
	    },

        babel: {
            options: {
                sourceMap: true,
                experimental: true,
                modules: "amd"        //This is the line to be added.
            },
            lib: {
                files: [{
                    "expand": true,
                    "cwd": "./src/",
                    "src": ["./**/*.js"],
                    "dest": "./lib/",
                    "ext": ".js"
                }]
            }
        }
    });

    grunt.registerTask('test', function () {
        return grunt.task.run([
            'mochaTest'
        ]);
    });

    grunt.registerTask("build", function () {
        return grunt.task.run([
            'clean:lib',
            'babel:lib'
        ]);
    });
};
