const {InjectManifest} = require("workbox-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
	const mode = argv.mode.trim() || 'development';
	const dotenvPath = `./.env.${mode}`.trim();
	console.log(`Env: `, dotenvPath);

	const optimization = {};
	if (mode === 'production') {
		optimization.minimizer = [
			new CssMinimizerPlugin(),//minimize css file, remove duplicates
			new TerserPlugin({//minimize js file
				terserOptions: {
					compress: {
						drop_console: true,// remove console statement
					},
				},
			}),
		];
		optimization.minimize = true;
		optimization.usedExports = true;
	}
	return {
		entry: path.join(__dirname, "src", "index.tsx"), 
		output: {
			path: path.join(__dirname, "/dist"), // the bundle output path
			filename: "bundle.js", // the name of the bundle
			clean: true //clean the folder every build
		},
		devtool: argv.mode === 'development' ? 'source-map' : false, //how build source maps for sources
		plugins: [
			new HtmlWebpackPlugin({
				template: path.join(__dirname, "/public/index.html"), // to import index.html file inside index.js
			}),
			new MiniCssExtractPlugin({
				filename: 'assets/css/[name].css', //to put all css files to specified path
			}),
			new Dotenv({
				path: dotenvPath,
			}),
			new InjectManifest({ //injecting precache to sw
				swSrc: './src/sw.ts', //source file
				swDest: 'sw.js', //destanation file, root: build folder (dist)
				include: [/\.(html|js|ts)$/], //type of resources to be precached
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, //max size of resource to be precached
			}),
			new CopyWebpackPlugin({ //copy resources from "public" folder to "dist"
				patterns: [
					{
						from: 'public', 
						to: '', 
						filter: (resourcePath) => !/index\.html/.test(resourcePath) //except index.html
					}
				]
			}),
			new webpack.SourceMapDevToolPlugin({
				exclude: ['bundle.js'],
			}),
			new webpack.LoaderOptionsPlugin({
				options: {
					postcss: [
						require('autoprefixer')(),
					],
				},
			}),
		], 
		optimization: optimization,
		mode: mode,
		devServer: {
			port: argv.mode === 'development' ? 80 : 80, // change the port if neccessary
		},
		resolve: {
			extensions: [ ".tsx", ".ts", ".jsx", ".js", ""], //to add extensions for import, to use './components/Preloaders/Preloader' <- Preloader.tsx
		},
		module: {
			rules: [
				{
					test: /\.(ts|tsx)$/, //processing ts/tsx files
					exclude: /node_modules/,
					use: {
						loader: 'ts-loader',
					},
				},
				{
					test: /\.(js|jsx)$/, //processing js/jsx files
					exclude: [/node_modules/],
					use: {
						loader: 'babel-loader',
					},
				},
				{
					test: /\.(sa|sc|c)ss$/, // processing styles files, right to left, MiniCssExtractPlugin.loader for move files in specified folder, can be replaced by "style-loader"
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						{
							loader: "css-loader",
							options: {
								sourceMap: this.devtool === 'source-map',
							},
						}, 
						{
							loader: "sass-loader",
							options: {
								sourceMap: this.devtool === 'source-map',
							},
						},
					],
				},

				{
					test: /\.(png|svg|webp|jpeg|jpg)$/, // to process images 
					type: "asset/resource",
					generator: {
						filename: 'assets/images/[name][ext]', //folder and name to put
					},
				},
				{
					test: /\.(woff(2)?|ttf|eot)$/, // to process fonts
					type: 'asset/resource',
					generator: {
						filename: 'assets/fonts/[name][ext]', //folder and name to put
					},
				},
				
			],
		},
	}
};