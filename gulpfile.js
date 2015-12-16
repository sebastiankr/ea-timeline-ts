var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var runseq = require('run-sequence');
var tslint = require('gulp-tslint');
var browserSync = require('browser-sync').create();
var del = require('del');
var vinylPaths = require('vinyl-paths');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  tscripts: {
    src: ['app/src/'],
    dest: 'app/build'
  },
  html: {
    src: ['app/src/**/*.{html,css,js}'],
    dest: 'app/build'
  },
  dist: {
    src: ['app/build/**/*.{html,css,js}'],
    srcJS: ['app/build/**/*.{js}'],
    dest: 'dist'
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
  var tsResult = tsProject.src() 
    .pipe(ts(tsProject));

  return tsResult.js.pipe(gulp.dest(paths.tscripts.dest))
  .pipe(browserSync.stream());
});

gulp.task('copy:html', function () {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
});

// ** Distribution ** //
gulp.task('dist', ['dist:copy']);

//remove all files from dist
gulp.task('dist:clean', function() {
 return gulp.src(paths.dist.dest + '/*')
 .pipe(vinylPaths(del));
});

// log file paths in the stream
gulp.task('log', function () {
    return gulp.src(paths.dist.dest + '/*')
        .pipe(vinylPaths(function (paths) {
            console.log('Paths:', paths);
            return Promise.resolve();
        }));
});

//copy files from app/src to dist
gulp.task('dist:copy', ['dist:clean'], function () {
  return gulp.src(paths.dist.src)
    .pipe(gulp.dest(paths.dist.dest));
});

// Process scripts and concatenate files into one output file
gulp.task('dist:scripts', ['dist:clean'], function() {
 gulp.src(paths.dist.srcJS) //TODDO: try using vinylPaths like in log task
 .pipe(jshint())
 .pipe(jshint.reporter('default'))
 .pipe(uglify())
 .pipe(concat('app.min.js'))
 .pipe(gulp.dest(paths.dist.dest));
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

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: paths.html.dest
    }
  });

  gulp.watch(paths.tscripts.src + '**/*.ts', ['compile:typescript']);
  gulp.watch(paths.html.src, ['copy:html']).on('change', browserSync.reload);;
});