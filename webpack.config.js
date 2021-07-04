module.exports = {
    entry: ["@babel/polyfill", "./src/app/index.js"],
    output: {
        path: __dirname + "/src/public",
        filename: "bundle.js"
    },
    watch: true, 
    resolve: {
        fallback: {
            "crypto": false,
        }
    },
    module: {
        rules: [
            {
                use: "babel-loader",
                test: /\.js$/,
                exclude: /node_modules/,
            },
            {
                use: "file-loader",
                test: /\.(png|jpe?g|gif)$/i,
                exclude: /node_modules/,
            },
            {
                use: ["style-loader", "css-loader"],
                test: /\.css$/i,
                exclude: /node_modules/,
            },
        ],
    },
};