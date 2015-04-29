var gulp = require('gulp'),
    babel = require('gulp-babel'),
    babelify = require("babelify"),
    // sass = require('gulp-ruby-sass'),
    // autoprefixer = require('gulp-autoprefixer'),
    // imagemin = require('gulp-imagemin'),
    // buffer = require('vinyl-buffer'),
    // livereload = require('gulp-livereload'),
    // minifycss = require('gulp-minify-css'),
    // concat = require('gulp-concat'),
    // cache = require('gulp-cache'),
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
    gls = require('gulp-live-server');

var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};

// gulp.task('modules', function() {
//     browserify({
//     entries: './main.js',
//     debug: true
//     })
//     .transform(babelify)
//     .bundle()
//     .pipe(source('output.js'))
//     .pipe(gulp.dest('./dist'));
// });

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    return browserify({
    entries: filename,
    debug: true
    })
    .transform(babelify)
    .bundle();
  });

  var bundle = gulp.src(['./btn/cirqle-on-wordpress.js'])
    .pipe(browserified)
    // .pipe(source(getBundleName() + '.js'))
    // .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks begins
    .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    // .pipe(rename({suffix: '.min'}))
    // Add transformation tasks ends
    // .pipe(uglify())
    .pipe(sourcemaps.write('./map'))
    .pipe(gulp.dest('./dist'));
    // .pipe(notify({ message: 'Scripts task complete' }));

  return bundle;
});

gulp.task('live-reload-server', function(){
    var server = gls.static('./test', 8888);
    server.start();
    server.notify();
});

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

gulp.task('watch', function() {
    var server = gls.static(['./server', './dist'], 8888);
    server.start();
    gulp.watch(['./btn/cirqle-on-*.js', './btn/modules/*.js'], ['browserify'])
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

gulp.task('default', ['clean', 'browserify', 'watch']);
