var gulp 				= require('gulp'),
	less 				= require('gulp-less'),
	browserSync 		= require('browser-sync'),
	autoprefixer 		= require('gulp-autoprefixer'),
	imagemin			= require('gulp-imagemin'),
	concat				= require('gulp-concat'),
	uglify 				= require('gulp-uglify'),
	csso 				= require('gulp-csso'),
	spritesmith			= require('gulp.spritesmith'),
	gcmq 				= require('gulp-group-css-media-queries'),
	pug 				= require('gulp-pug'),
	cleanCSS 			= require('gulp-clean-css'),
	notify 				= require("gulp-notify");

require('events').EventEmitter.defaultMaxListeners = 0;

gulp.task('default', ['less', 'pug'], function(){
	//return true;
});

gulp.task('less', function(){
	return gulp.src([
				'src/less/style.less',
			])
		.pipe(less())
		.on("error", notify.onError({
			message: "Less-Error: <%= error.message %>",
			title: "Less"
		}))
		.pipe(gcmq())
		.pipe(autoprefixer(['last 10 versions', '> 1%', 'ie 8'], {cascade: true}))
		.pipe(cleanCSS({compatibility: 'ie8', format: 'keep-breaks'}))
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('pug', function(){
	return gulp.src('src/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.on("error", notify.onError({
			message: "Pug-Error: <%= error.message %>",
			title: "Pug"
		}))
		.pipe(gulp.dest('build'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: './build/',
		},
		notify: false
	});
});

gulp.task('imagemin', function(){
	return gulp.src('build/img/**/*')
		.pipe(imagemin({
			interlaced: true,
		    progressive: true,
		    optimizationLevel: 5,
		    svgoPlugins: [{removeViewBox: true}]
		}))
		.pipe(gulp.dest('build/img/'));
});

gulp.task('imagesprite', function () {
  return gulp.src('build/img/' + options.sprite + '/*.png')
  	.pipe(spritesmith({
  		algorithms: 'binary-tree',
	    imgName: options.sprite + '.png',
	    cssFormat: 'css',
	    cssName: options.sprite + '.css',
	    imgPath: '/img/' + options.sprite + '.png',
	    padding: 10,
	  }))
	  .pipe(gulp.dest('build/img/'));
});

gulp.task('jsmin', function() {
  return gulp.src([
  		// 'node_modules/jquery/dist/jquery.min.js',
		'node_modules/slick-carousel/slick/slick.min.js',
		'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
		'src/libs/**/*.js',
	])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('cssmin', function() {
  return gulp.src([
  		'node_modules/magnific-popup/dist/magnific-popup.css',
  		// '../'+ options.folder +'/src/libs/**/*.css'
  	])
    .pipe(concat('libs.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/css'));
});

gulp.task('watch', ['pug', 'less', 'browser-sync'], function(){
	gulp.watch('src/less/**/*.less', ['less']);
	gulp.watch('src/**/*.pug', ['pug']);
	//gulp.watch('./build/*.html', browserSync.reload);
	gulp.watch('build/js/*.js', browserSync.reload);
});

gulp.task('less-watch', ['less', 'browser-sync'], function(){
	gulp.watch('src/less/**/*.less', ['less']);
});



var smartgrid = require('smart-grid');
 
/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'less', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: "30px", /* gutter width px || % */
    container: {
        maxWidth: '1170px', /* max-width оn very large screen */
        fields: '15px' /* side fields */
    },
    breakPoints: {
        lg: {
            'width': '1170px', /* -> @media (max-width: 1100px) */
            'fields': '15px' /* side fields */
        },
        md: {
            'width': '960px',
            'fields': '15px'
        },
        sm: {
            'width': '780px',
            'fields': '15px'
        },
        xs: {
            'width': '560px',
            'fields': '15px'
        },
        xxs: {
            'width': '425px',
            'fields': '15px'
        }
        /* 
        We can create any quantity of break points.
 
        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
    }
};

gulp.task('smartgrid', function() {
  return smartgrid('src/less', settings);
});
 
