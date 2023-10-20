import { allPaths } from "../data/consts";
import { filenameChanger } from "../processors/filenameChanger";
import { IMulterFile } from "./user";

const multer = require('multer');


const storageUser = multer.diskStorage({
	destination: (req, file: IMulterFile, cb) => {
	  	cb(null, `${allPaths.pathToTemp}`); // Set the destination folder for uploaded files
	},
	filename: (req, file, cb) => {
		file.filename = filenameChanger(Buffer.from(file.originalname, 'latin1').toString('utf8'))
	  	cb(null, file.filename); 
	}
}); 

const fileSaver = multer({ 
	storage: storageUser,
}).array('files');



module.exports = fileSaver
export {}