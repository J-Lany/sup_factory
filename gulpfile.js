const { src, dest, watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();

//Плагины 
const fileInclude = require("gulp-file-include");
const imagemin = require('gulp-imagemin');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');


// const del = require("del");

//Обработка файлов 
const html = cb => {
    return src("./src/html/**/*.html")
        .pipe(fileInclude())
        .pipe(dest("./public"))
        .pipe(browserSync.stream()); //Вызываем самым последним, посл выполнения всех файлов
}

const style = () => {
    return src("./src/style/**/*.css")
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
};

const images = () => {
    return src(['src/images/*.*', '!src/images/*.svg'])
        .pipe(newer('public/images'))
        .pipe(avif({ quality: 50 }))

        .pipe(src('src/images/*.*'))
        .pipe(newer('public/images'))
        .pipe(webp())

        .pipe(src('src/images/*.*'))
        .pipe(newer('public/images'))
        .pipe(imagemin())

        .pipe(dest('public/images'))
}

const sprite = () => {
    return src('src/images/dist/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('./public/images'))
}


// Удаление директории (не робит почему-то, в сборку не добавляю) 
// const clear = () => {
//     return del("./public");
// }

//Сервер 
const server = () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    })
}

//Наблюдение 
const watcher = cb => {
    watch("./src/html/**/*.html", html);
    watch("./src/style/**/*.css", style);
    watch("./src/images", images);
    cb();
}
//Задачи
exports.html = html;
exports.style = style;
exports.watcher = watcher;
exports.images = images;
exports.sprite = sprite;
// exports.clear = clear;

//Сборка
exports.dev = series(
    html,
    style,
    images,
    parallel(server, watcher)
)