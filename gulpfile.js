var gulp = require('gulp');
var tsc = require('gulp-tsc');
var shell = require('gulp-shell');
var runseq = require('run-sequence');
var tslint = require('gulp-tslint');
var browserSync = require('browser-sync').create();

var paths = {
  tscripts: {
    src: ['app/src/**/*.ts'],
    dest: 'app/build'
  },
  html: {
    src: ['app/src/**/*.{html,css,js}'],
    dest: 'app/build'
  }
};

gulp.task('default', ['lint', 'buildrun']);

// ** Running ** //

gulp.task('run', ['browser-sync']);

gulp.task('buildrun', function (cb) {
  runseq('build', 'run', cb);
});

// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
  gulp.watch(paths.html.src, ['copy:html']);
});

// ** Compilation ** //

gulp.task('build', ['copy:html','compile:typescript']);
gulp.task('compile:typescript', function () {
  return gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: "commonjs",
      emitError: false
    }))
    .pipe(gulp.dest(paths.tscripts.dest));
});
gulp.task('copy:html', function () {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
});


// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function () {
  return gulp.src(paths.tscripts.src)
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});

// ** Static Web Server ** //

gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: paths.html.dest
        }
    });
    
    gulp.watch(paths.tscripts.src, ['ts-watch']);
    gulp.watch(paths.html.src, ['html-watch']);
});
gulp.task('ts-watch', ['compile:typescript'], browserSync.reload);
gulp.task('html-watch', ['copy:html'], browserSync.reload);