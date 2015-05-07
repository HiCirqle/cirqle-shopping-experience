var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
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
    gls = require('gulp-live-server'),
    nightwatch = require('gulp-nightwatch'),
    exit = require('gulp-exit');
    through2 = require('through2');

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
  // var browserified = transform(function(filename) {
  //   return browserify({
  //   entries: filename,
  //   debug: true
  //   })
  //   .transform(babelify)
  //   .bundle();
  // });

  var plumberErrorCb = function(error){
    console.log(error);
  }

  var bundle = gulp.src([
    './btn/cirqle-on-wordpress.js',
    './btn/cirqle-on-tumblr.js',
    './btn/cirqle-on-blogger.js'
    ])
    .pipe(plumber(plumberErrorCb))
    .pipe(through2.obj(function (file, enc, next){
        browserify({
          entries: file.path,
          debug: true
        })
        .transform(babelify)
        .bundle(function(err, res){
            // assumes file.contents is a Buffer
            file.contents = res;
            next(null, file);
        });
    }))
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
    .on('error', function (error) {
        console.error('' + error);
        gls.stop();
    });
    // .pipe(notify({ message: 'Scripts task complete' }));

  return bundle;
});

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

gulp.task('watch', ['browserify'], function() {
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
    .on('finish', function () {
        gls.stop();
        process.exit(1);
    });

});

gulp.task('test', ['clean', 'nightwatch:chrome']);

gulp.task('default', ['clean', 'watch']);
