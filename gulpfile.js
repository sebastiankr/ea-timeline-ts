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
var sass = require('gulp-sass');

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
    src: ['app/build/*.{html,css,js}'],
    srcJS: ['app/build/*.js'],
    dest: 'dist'
  },
  sass: {
    src: ['app/src/**/*{.sass,.scss}'],
    dest: 'app/build'
  }
};

var tsProject = ts.createProject(paths.tscripts.src + 'tsconfig.json');

gulp.task('default', ['build']);

// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src + '**/*.ts', ['compile:typescript']);
  gulp.watch(paths.html.src, ['copy:html']);
  gulp.watch(paths.sass.src, ['compile:sass']);
});

// ** Compilation ** //

gulp.task('build', ['copy:html', 'compile:sass', 'compile:typescript']);
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

gulp.task('compile:sass', function () {
  return gulp
    .src(paths.sass.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.sass.dest));
});

// ** Distribution ** //
gulp.task('dist', ['dist:scripts']);

// Process scripts and concatenate files into one output file
gulp.task('dist:scripts', ['dist:clean'], function() {
 return gulp.src(paths.dist.srcJS)
 .pipe(jshint())
 .pipe(jshint.reporter('default'))
 .pipe(uglify())
 //.pipe(concat('ea-timeline.js'))
 .pipe(gulp.dest(paths.dist.dest));
});

//remove all files from dist
gulp.task('dist:clean', function() {
 return gulp.src(paths.dist.dest + '/*')
 .pipe(vinylPaths(del));
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

// ** browser-sync Web Server ** //

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: paths.html.dest
    }
  });

  gulp.watch(paths.tscripts.src + '**/*.ts', ['compile:typescript']);
  gulp.watch(paths.html.src, ['copy:html']).on('change', browserSync.reload);
  gulp.watch(paths.sass.src, ['sass']);
});
