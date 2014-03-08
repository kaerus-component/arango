// Karma configuration
// Generated on Thu Jul 04 2013 11:39:34 GMT+0200 (CEST)

module.exports = function(karma) {

  karma.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../../',


    // frameworks to use
    //frameworks: ['jasmine', 'junit-reporter'],
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'build/build.js',
        'test/action.js',
        'test/admin.js',
        'test/aqlfunction.js',
        'test/async.js',
        'test/batch.js',
        'test/collection.js',
        'test/connection.js',
        'test/cursor.js',
        'test/database.js',
        'test/document.js',
        'test/edge.js',
        'test/endpoint.js',
        'test/graph.js',
        'test/import.js',
        'test/index.js',
        'test/indexWithDefaultCollection.js',
        'test/simple.js',
        'test/simpleWithDefaultCollection.js',
        'test/transaction.js',
        'test/traversal.js',
        'test/user.js'
    ],


    // list of files to exclude
    exclude: [

    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots'],

    // web server port
    port: 9876,


    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: false,


    // level of logging
    // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
    logLevel: karma.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [ "Firefox" ],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
