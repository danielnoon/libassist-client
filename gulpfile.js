const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("tsc", function() {
  return tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest("dist"));
});

gulp.task("view", function() {
  return gulp.src("./src/views/*")
  .pipe(gulp.dest("./dist/views/"));
});

gulp.task("default", ["tsc", "view"]);
