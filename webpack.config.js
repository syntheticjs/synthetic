var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
module.exports = {
    context: path.join(__dirname, './'), // исходная директория
	entry: './src/synthetic.js', // файл для сборки, если несколько - указываем hash (entry name => filename)
	output: {
		path: path.join(__dirname, 'dist'), // выходная директория
		filename: 'synthetic.js',
		library: 'synthetic',
		libraryTarget: 'umd'
	},
	plugins: [
		//new webpack.optimize.UglifyJsPlugin()
		new webpack.BannerPlugin(fs.readFileSync('LICENSE.md', 'utf-8'), {
			raw: false
		})
	],
	module: {
		loaders: [
	        { test: /\.css$/, loader: "style-loader!css-loader" },
	        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
     		{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
	    ]
	},
	externals: { angular: "angular" }
};