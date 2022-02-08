import copy from 'rollup-plugin-copy';

export default [
    {
        input: 'src/js/index.js',

        watch: {
            include: "./**"
        },

        output: {
            file: './dist/rollup-wasm.js',
            format: 'es',
            sourcemap: 'inline'
        },

        plugins: [
            copy({
                targets: [
                    { src: "src/html/index.html", dest: "dist" }
                ]
            })
        ]
    }
]
