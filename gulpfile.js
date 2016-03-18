'use strict'

const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

gulp.task('styles', () => {
	return  gulp.src('./styles/*.scss')
	    .pipe(sass().on('error', sass.logError))
	    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
	    .pipe(concat('styles.css'))
	    .pipe(gulp.dest('./public/css/'))
	    .pipe(reload({stream: true}));
})

gulp.task('scripts', () => {
	gulp.src('./scripts/*.js')
	   .pipe(babel({
	     presets: ['es2015']
	   }))
	   .pipe(gulp.dest('./public/js'))
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: './public'  
  })
});

gulp.task('watch', () => {
	gulp.watch('./styles/**/*.scss', ['styles']);
	gulp.watch('./scripts/*.js', ['scripts']);
	gulp.watch('./public/*.html', reload);
});

gulp.task('default', ['browser-sync','styles', 'scripts', 'watch']);