import { allPaths } from "../data/consts";

const fse = require('fs-extra')

const foldersRemover = async (paths: string[] = [allPaths.pathToTemp]) => {
    try {
        for (const pathTo of paths) {
            await fse.remove(pathTo);
        }
    } catch (err) {
        console.log('Error in foldersRemover: ', err);
    }
}


const foldersCleaner = async (paths: string[] = [allPaths.pathToTemp]) => {
    try {
        for (const pathTo of paths) {
            await fse.emptyDir(pathTo);
        }
    } catch (err) {
        console.log('Error in foldersCleaner: ', err);
    }
}

const foldersCreator = async (paths: string[] = []) => {
    try {
        for (const pathTo of paths) {
            await fse.ensureDir(pathTo);
        }
    } catch (err) {
        console.log('Error in foldersCreator: ', err);
    }
}

export { foldersRemover, foldersCreator, foldersCleaner}