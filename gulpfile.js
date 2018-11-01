// WARNING: gulpfile must be ES5

var gulp        = require("gulp");
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul"),
    browserSync = require("browser-sync").create();

var tsProject = tsc.createProject("tsconfig.json");

gulp.task("lint", function() {
    return gulp.src([
        "src/**/*.ts",
        "tests/**/*.ts"
    ])
    .pipe(tslint({}))
    .pipe(tslint.report("verbose"));
});

gulp.task("build-app", function() {
    return gulp.src([
        "src/**/**.ts",
        "typings/main.d.ts/",
        "src/interfaces/interfaces.d.ts"
    ])
    .pipe(tsc(tsProject))
    .js.pipe(gulp.dest("src/"));
});

gulp.task("bundle", function() {
    var libraryName = "sicness";
    var mainTsFilePath = "src/app.js";
    var outputFolder = "dst/";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: true,
        standalone: libraryName
    });

    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});


//gulp.task("watch", gulp.series("default", function() {
//    browserSync.init({
//        server: "."
//    });
//
//    gulp.watch([ "src/**/**.ts", "tests/**/**.ts" ], ["default"]);
//    gulp.watch("dst/*.js").on('change', browserSync.reload);
//}));

var tsTestProject = tsc.createProject("tsconfig.json");
gulp.task("build-test", function() {
    return gulp.src([
        "tests/**/*.ts",
        "typings/main.d.ts/",
        "src/interfaces/interfaces.d.ts"
    ])
    .pipe(tsc(testTestProject))
    .js.pipe(gulp.dest("tests/"));
});

gulp.task("istanbul:hook", function() {
    return gulp.src(["src/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", gulp.series("istanbul:hook", function() {
    return gulp.src("tests/**/*.test.js")
        .pipe(mocha({ui: "bdd"}))
        .pipe(istanbul.writeReports());
}));