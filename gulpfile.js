var gulp = require('gulp'),
    // sass = require('gulp-ruby-sass'),
    // autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    // imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    changed = require('gulp-changed'),
    browserify = require('browserify'),
    transform = require('vinyl-transform'), // vinyl-source-stream + vinyl-buffer
    // source = require('vinyl-source-stream'),
    // buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    gls = require('gulp-live-server');

var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};


gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  var bundle = gulp.src(['./btn/cirqle-on-*.js'])
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
    .pipe(gulp.dest('./dist'))
    // .pipe(livereload())
    // .pipe(notify({ message: 'Scripts task complete' }));

  return bundle;
});

gulp.task('live-reload-server', function(){
    var server = gls.static('./test', 8888);
    server.start();
    server.notify();
});

gulp.task('clean', function(cb) {
    del(['dist', 'processed'], cb);
});

gulp.task('watch', function() {
    var server = gls.static('./test', 8888);
    server.start();
    gulp.watch(['./btn/cirqle-on-*.js', './test/*'], ['browserify'], server.notify);
});

gulp.task('default', ['clean', 'browserify', 'watch'], function() {
  	// gulp.start('browserify');
});
