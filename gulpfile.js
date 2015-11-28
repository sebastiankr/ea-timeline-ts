var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsc = require('gulp-tsc');
var shell = require('gulp-shell');
var runseq = require('run-sequence');
var tslint = require('gulp-tslint');
var browserSync = require('browser-sync').create();

var paths = {
  tscripts: {
    src: ['app/src/'],
    dest: 'app/build'
  },
  html: {
    src: ['app/src/**/*.{html,css,js}'],
    dest: 'app/build'
  }
};

var tsProject = ts.createProject(paths.tscripts.src + 'tsconfig.json');

gulp.task('default', ['lint', 'buildrun']);

// ** Running ** //

gulp.task('run', ['browser-sync']);

gulp.task('buildrun', function (cb) {
  runseq('build', 'run', cb);
});

// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src + '**/*.ts', ['compile:typescript']);
  gulp.watch(paths.html.src, ['copy:html']);
});

// ** Compilation ** //

gulp.task('build', ['copy:html', 'compile:typescript']);
gulp.task('compile:typescript', function () {
<<<<<<< HEAD
  var tsResult = tsProject.src() // instead of gulp.src(...)
    .pipe(ts(tsProject));

  return tsResult.js.pipe(gulp.dest(paths.tscripts.dest));
=======
  return gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: "commonjs",
      emitError: false
    }))
    .pipe(gulp.dest(paths.tscripts.dest))
    .pipe(browserSync.stream());
>>>>>>> d4d13f6d71d8fcf5f1f81abaaf7a90ea52f6d0f0
});

gulp.task('copy:html', function () {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
});


// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function () {
  return gulp.src(paths.tscripts.src + '**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});

// ** Static Web Server ** //

<<<<<<< HEAD
gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: paths.html.dest
    }
  });

  gulp.watch(paths.tscripts.src + '**/*.ts', ['ts-watch']);
  gulp.watch(paths.html.src, ['html-watch']);
=======
gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: paths.html.dest
        }
    });
    
    gulp.watch(paths.tscripts.src, ['ts-watch']);
    gulp.watch(paths.html.src, ['html-watch']).on('change', browserSync.reload);
>>>>>>> d4d13f6d71d8fcf5f1f81abaaf7a90ea52f6d0f0
});
gulp.task('ts-watch', ['compile:typescript'], browserSync.reload);
gulp.task('html-watch', ['copy:html'], browserSync.reload);