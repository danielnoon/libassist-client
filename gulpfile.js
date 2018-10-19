const gulp = require("gulp");
const ts = require("gulp-typescript");
const webpack = require('webpack-stream');
const sass = require('gulp-sass');
const tsProject = ts.createProject("tsconfig.json");

gulp.task("tsc", function() {
  return tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest("dist"));
});

gulp.task("views", function() {
  return gulp.src("./src/views/**/*.*")
  .pipe(gulp.dest("./dist/views/"));
});

gulp.task("templates", function() {
  return gulp.src("./src/templates/**/*.*")
  .pipe(gulp.dest("./dist/templates/"));
});

gulp.task("client", function() {
  return gulp.src('src/app/main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist/views/'));
});

gulp.task("client:watch", function() {
  gulp.watch('src/app/**/*.*', ["client"]);
});

gulp.task('styles', function () {
  return gulp.src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/views/styles'));
});

gulp.task('copy-highlight', function() {
  return gulp.src(['./node_modules/highlightjs/highlight.*', './node_modules/highlightjs/styles/*.*'])
    .pipe(gulp.dest('./dist/views/highlight'));
});

gulp.task("default", ["tsc", "views", "copy-highlight", "client", "styles"]);
