var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    babelify = require("babelify"),
    // sass = require('gulp-ruby-sass'),
    // autoprefixer = require('gulp-autoprefixer'),
    // imagemin = require('gulp-imagemin'),
    // livereload = require('gulp-livereload'),
    // minifycss = require('gulp-minify-css'),
    // concat = require('gulp-concat'),
    // cache = require('gulp-cache'),
    buffer = require('vinyl-buffer'), // when streaming not supported
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    del = require('del'),
    changed = require('gulp-changed'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    transform = require('vinyl-transform'), // vinyl-source-stream + vinyl-buffer
    sourcemaps = require('gulp-sourcemaps'),
    gls = require('gulp-live-server'),
    nightwatch = require('gulp-nightwatch'),
    exit = require('gulp-exit');
    through2 = require('through2'),
    es = require('event-stream');

var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};

gulp.task('browserify', function (cb) {

  var plumberErrorCb = function(error){
    console.log(error);
  }

  var files = [
    'cirqle-on-wordpress.js',
    'cirqle-on-tumblr.js',
    'cirqle-on-blogger.js',
    'cirqle-preview.js'
    ];

  var tasks = files.map(function(entry){
      return browserify({
        entries: ['./btn/'+entry],
        paths: ['./btn/modules']
        })
        .transform(babelify)
        .bundle()
        .pipe(plumber(plumberErrorCb))
        .pipe(source(entry))
        .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest('./dist'));
      });

  return es.merge.apply(null, tasks);
});

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

gulp.task('watch', ['browserify'], function() {
    var server = gls.static(['./server', './dist'], 8888);
    server.start();

    gulp.watch(['./btn/cirqle-on-*.js', './btn/cirqle-preview.js', './btn/modules/*.js'], ['browserify'])
    .on('error', function(event){
      console.log('error', event);
      server.stop();
    });

    gulp.watch('./dist/*.js', function(event){
      console.log('dist change', event);
      server.notify(event);
    });
    gulp.watch('./server/*.html', function(event){
      server.notify(event);
    });
});


gulp.task('nightwatch:chrome', ['watch'], function(){
  gulp.src('')
    .pipe(nightwatch({
      configFile: 'test/nightwatch.json',
      // cliArgs: [ '--env chrome', '--tag sandbox' ]
    }))
    .on('error', function (error) {
        console.error('' + error);
        gls.stop();
        process.exit(1);
    })
    .on('end', function () {
        gls.stop();
        process.exit(0);
    });
    // .pipe(exit());

});

gulp.task('test', ['clean', 'nightwatch:chrome']);

gulp.task('default', ['clean', 'watch']);
