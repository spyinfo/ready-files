'use strict';

var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    vendor: {
        js: 'app/js/',
        css: 'app/css/'
    },
    dist: {                          // Сюда складываем готовые после сборки файлы
        html: 'dist/',
        js: 'dist/js/',
        scss: 'dist/css/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    app: {                           // Пути откуда берем исходники
        html: 'app/*.html',          // Все файлы .html
        js: 'app/js/*.js',           // В стилях и скриптах нам понадобятся только main файлы
        scss: 'app/css/*.scss',
        css: 'app/css/*.css',
        img: 'app/img/**/*.*',       // Все файлы всех расширений
        fonts: 'app/fonts/**/*.*'
    },
    watch: {                         // За какими файлами хотим наблюдать
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        scss: 'app/css/**/*.scss',
        css: 'app/css/**/*.css',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './dist'
};


var config = {
    server: {
        baseDir: "./dist"
    },
    // tunnel: true,
    host: 'localhost',
    port: 8000,
    logPrefix: "Spyinfo"
};


gulp.task('vendorJs:build', function () {
    gulp.src( mainBowerFiles('**/*.js') )        // Выберем файлы
        .pipe(gulp.dest(path.vendor.js))         // Перекинем готовые файлы в app
});

gulp.task('vendorCss:build', function () {
    gulp.src( mainBowerFiles('**/*.css') )       // Выберем файлы
        .pipe(gulp.dest(path.vendor.css))        // Перекинем готовые файлы в app
});

gulp.task('html:build', function () {
    gulp.src(path.app.html)                      // Выберем файлы
        .pipe(gulp.dest(path.dist.html))         // Перекинем в build
        .pipe(reload({stream: true}));           // Перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.app.js)                        // Найдем main файл
        .pipe(sourcemaps.init())                 // Инициализируем sourcemap
        .pipe(uglify().on('error', function(e){  // Сожмем js
            console.log(e);
         }))                          
        .pipe(sourcemaps.write())                // Пропишем карты
        .pipe(gulp.dest(path.dist.js))           // Перекинем готовый файл в build
        .pipe(reload({stream: true}));           // Перезагрузим сервер
});

gulp.task('scss:build', function () {
    gulp.src(path.app.scss)                      // Выберем main.scss
        .pipe(sourcemaps.init())                 // Инициализируем sourcemap
        .pipe(sass())                            // Скомпилируем в .css
        .pipe(prefixer())                        // Добавим вендорные префиксы
        .pipe(cleanCSS())                        // Сожмем (удаление комментариев и т.д.)
        .pipe(sourcemaps.write())                // Пропишем карты
        .pipe(gulp.dest(path.dist.scss))         // Перекинем готовый файл в build
        .pipe(reload({stream: true}));           // Перезагрузим сервер
});

gulp.task('css:build', function () {
    gulp.src(path.app.css)                       // Выберем main.css
        .pipe(sourcemaps.init())                 // Инициализируем sourcemap
        .pipe(gulp.dest(path.dist.css))          // Перекинем готовый файл в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.app.img)                       // Выберем картинки
        .pipe(imagemin({                         // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img))          // Перекинем готовые файлы в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('build', [
    'vendorCss:build',
    'vendorJs:build',
    'html:build',
    'js:build',
    'scss:build',
    'css:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.scss], function(event, cb) {
        gulp.start('scss:build');
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);