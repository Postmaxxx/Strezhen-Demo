const path = require('path');


const filenameChanger = (filename: string) => {
    return filename
        .replaceAll('_','-')
}




const extChanger = (filename: string, newExt: string) => {
    const filenameWOExt = path.basename(filename, path.extname(filename));
    const newFilename = `${filenameWOExt}.${newExt}`;

    return {filename: filenameWOExt, filenameFull: newFilename}
}

 export {filenameChanger, extChanger}