const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("tsc", function() {
  return tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest("dist"));
});

gulp.task("templates", function() {
  return gulp.src("./src/templates/**/*.*")
  .pipe(gulp.dest("./dist/templates/"));
});
exports.default = gulp.parallel("tsc", "templates");
