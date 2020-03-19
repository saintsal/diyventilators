const { src, dest, watch, series, parallel } = require('gulp')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano');
const imagemin = require('imagemin')
const gulpIf = require('gulp-if')
const clean = require('gulp-clean');
const useref = require('gulp-useref')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const purgecss = require('gulp-purgecss')

const f = {
    src: "src",
    dest: "build"
}

function cleanBuild() {
    return src(f.dest)
        .pipe(clean())
}

function html() {
    return src([`${f.src}/*.html`, `${f.src}/assets/**/*`, `${f.src}/**/*.woff`])
        .pipe(dest(f.dest))
        .pipe(browserSync.stream())
}

function css() {
    return src(`${f.src}/css/**/*.css`)
        .pipe(concat('main.css'))
        .pipe(postcss([
            require('tailwindcss'),
            require('autoprefixer'),
        ]))
        .pipe(purgecss({
            content: [`${f.src}/**/*.html`],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        }))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(dest(`${f.dest}/css/`))
        .pipe(browserSync.stream())
}


function serve() {
    browserSync.init({
        server: {
            baseDir: f.dest
        }
    })

    watch([`${f.src}/*.html`]).on('change', series(html,css))
    watch([`${f.src}/css/*`]).on('change', css)

}

exports.default = series(
    cleanBuild,
    html, 
    css,
    serve
)
