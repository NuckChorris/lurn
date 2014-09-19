var gulp = require('gulp');
var esnext = require('gulp-esnext');
var es6moduleTranspiler = require('gulp-es6-module-transpiler');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var bowerFiles = require('main-bower-files');
var mergeStream = require('merge-stream');
var del = require('del');

var paths = {
	scripts: ['src/js/**/*'],
	styles: ['src/css/app.less'],
	images: ['src/img/**/*']
};

gulp.task('clean', function(cb) {
	del(['build'], cb);
});

gulp.task('scripts', ['clean'], function () {
	var scripts = gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		.pipe(esnext())
		.pipe(es6moduleTranspiler({
			type: 'amd'
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js'));
	var bower = gulp.src(bowerFiles())
		.pipe(sourcemaps.init())
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js'));

	return mergeStream(bower, scripts);
});
