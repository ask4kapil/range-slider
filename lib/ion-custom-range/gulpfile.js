/**
 * Created by kapilkumawat on 19/02/16.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var minify = require('gulp-minify');

var paths = {
    sass: ['./*.scss'],
    js: ['./*range.js']
};

gulp.task('default', ['sass', 'compress']);

gulp.task('compress', function() {
    gulp.src(paths.js)
        .pipe(minify())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('sass', function(done) {
    gulp.src('./ion-custom-range.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('.'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./dist/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('install',  function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});
