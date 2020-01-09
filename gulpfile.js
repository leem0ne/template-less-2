const { src, dest, parallel, series, watch } = require('gulp');
const pug             = require('gulp-pug');
const less            = require('gulp-less');
const browserSync     = require('browser-sync');
const autoprefixer    = require('gulp-autoprefixer');
const imagemin        = require('gulp-imagemin');
const concat          = require('gulp-concat');
const uglify          = require('gulp-uglify');
const csso            = require('gulp-csso');
const spritesmith     = require('gulp.spritesmith');
const gcmq            = require('gulp-group-css-media-queries');
const cleanCSS        = require('gulp-clean-css');
const notify          = require("gulp-notify");
const sourcemaps      = require('gulp-sourcemaps');
const rename          = require('gulp-rename');



const options = {
  folder: '1gulp2',
  sprite: 'numbers',
};

const pathToProject = '../'+ options.folder;


//  PUG -> HTML
function html() {
  return src(pathToProject+'/build/assets/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .on("error", notify.onError({
      message: "Pug-Error: <%= error.message %>",
      title: "Pug"
    }))
    .pipe(dest(pathToProject +'/build'))
    // .pipe(browserSync.reload({ stream: true }));
    .on('end', browserSync.reload);
}


//  LESS -> CSS
function css() {
  return src(pathToProject +'/build/assets/less/*.less')
    .pipe(sourcemaps.init())
      .pipe(less())
      .on("error", notify.onError({
        message: "Less-Error: <%= error.message %>",
        title: "Less"
      }))
      .pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 10'], {cascade: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(pathToProject +'/build/css'))
    .pipe(browserSync.reload({ stream: true }));
}


//  COMPRESS style.css
function cssmin(){
  return src(pathToProject +'/build/css/style.css')
    .pipe(less())
    .on("error", notify.onError({
      message: "Less-Error: <%= error.message %>",
      title: "Less"
    }))
    .pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 10'], {cascade: true}))
    .pipe(gcmq())
    .pipe(cleanCSS({compatibility: 'ie10', format: 'keep-breaks'}))
    // .pipe(csso())
    // .pipe(rename('style.min.css'))
    .pipe(dest(pathToProject +'/build/css'));
}


//  BROWSER-SYNC
function browserS(){
  browserSync({
    server: {
      baseDir: pathToProject +'/build',
    },
    notify: false
  });
}


//  BUILDING libs.min.js
function jslibs() {
  return src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/slick-carousel/slick/slick.min.js',
      'node_modules/lity/dist/lity.min.js',
      // 'node_modules/imagesloaded/imagesloaded.pkgd.min.js',
      'node_modules/vanilla-lazyload/dist/lazyload.min.js',
      pathToProject +'/build/assets/libs/**/*.js',
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(dest(pathToProject +'/build/js'));
}


//  BUILDING libs.min.css
function csslibs(){
  return src([
      'node_modules/lity/dist/lity.min.css',
      pathToProject +'/build/assets/libs/**/*.css',
    ])
    .pipe(concat('libs.min.css'))
    .pipe(csso())
    .pipe(dest(pathToProject +'/build/css'));
}


//  COMPRESS images
function imageMin(){
  src(pathToProject +'/build/img/**/sprite.svg' )
    .pipe(dest(pathToProject +'/build/imgmin/svg'));

  return src(pathToProject +'/build/img/**/*', {ignore: '/**/sprite.svg'} )
    .pipe(imagemin({
      interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        // svgoPlugins: [{removeViewBox: true}]
    }))
    .pipe(dest(pathToProject +'/build/imgmin/'));
}

function imagesprite() {
  return src(pathToProject +'/build/img/' + options.sprite + '/*.png')
    .pipe(spritesmith({
      algorithms: 'binary-tree',
      imgName: options.sprite + '.png',
      cssFormat: 'css',
      cssName: options.sprite + '.css',
      imgPath: '../img/' + options.sprite + '.png',
      padding: 10,
    }))
    .pipe(dest(pathToProject +'/build/img/'));
};


//  WATCHING files
function watches(){
  // csslibs();
  // jslibs();

  watch(pathToProject+'/build/assets/less/**/*.less', { ignoreInitial: false }, css);
  watch(pathToProject+'/build/assets/**/*.pug', { ignoreInitial: false }, html);
  watch(pathToProject+'/build/js/*.js').on('change',  browserSync.reload);

  // browserS();
}


function watchesLess(){
  // csslibs();
  // jslibs();

  watch(pathToProject+'/build/assets/less/**/*.less', { ignoreInitial: false }, css);
  watch(pathToProject+'/build/**/*.html').on('change',  browserSync.reload);
  watch(pathToProject+'/build/js/*.js').on('change',  browserSync.reload);

  // browserS();
}



exports.css = css;
exports.html = html;

exports.watches = series(parallel(html,css), parallel(watches, browserS));
exports.watches2 = series(parallel(html,cssmin), parallel(watches, browserS));
exports.watchesLess = watchesLess;

exports.imagesprite = imagesprite;

exports.imageMin = imageMin;
exports.cssmin = series(css, cssmin);

exports.csslibs = csslibs;
exports.jslibs = jslibs;

exports.default = parallel(html, css, jslibs);