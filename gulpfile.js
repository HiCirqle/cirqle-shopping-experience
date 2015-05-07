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
    through2 = require('through2'),
    es = require('event-stream');

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

gulp.task('browserify', function (cb) {
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

  var files = [
    'cirqle-on-wordpress.js',
    'cirqle-on-tumblr.js',
    'cirqle-on-blogger.js'
    ];

  var tasks = files.map(function(entry){
      return browserify({
        entries: ['./btn/'+entry],
        paths: ['./btn/modules','./node_modules'] 
        })
        .transform(babelify)
        .bundle()
        .pipe(source(entry))
        .pipe(gulp.dest('./dist'));
      });

  return es.merge.apply(null, tasks);

  var bundle = gulp.src(files)
    .pipe(plumber(plumberErrorCb))
    .pipe(browserified)
    // .pipe(through2.obj(function write (file, enc, next){
    //   console.log(file.path);
    //     b.add(file.path);
    //     next();
    //   },
    //   function end (next){
    //     b.bundle()
    //     .pipe(sourcemaps.init({loadMaps: true}))
    //     .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
    //     .pipe(jshint('.jshintrc'))
    //     .pipe(jshint.reporter('default'))
    //     // .pipe(uglify())
    //     .pipe(sourcemaps.write('./map'))
    //     .pipe(source)
    //     .pipe(gulp.dest('./dist')).on('finish', cb));
    //   }
    // ));
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
    .on('end', function () {
        gls.stop();
        process.exit(1);
    });
    // .pipe(exit());

});

gulp.task('test', ['clean', 'nightwatch:chrome']);

gulp.task('default', ['clean', 'watch']);
