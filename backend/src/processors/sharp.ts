import { allPaths, imageSizes} from "../data/consts"
import { TImageSizes } from "../interfaces";
import { IMulterFile } from "../routes/user"
import { filesUploaderS3, folderCleanerS3 } from "./aws"
import { extChanger } from "./filenameChanger";

const sharp = require('sharp')
//sharp.cache(false);

interface ISizeItem {
    type: TImageSizes
    path: string
}

interface IImageResizer {
    files: IMulterFile[]
    format?: string
    sizesConvertTo: ISizeItem[]
}




const imagesResizerUploaderS3 = async ({files = [], format = 'webp', sizesConvertTo = []}: IImageResizer) => {
    sharp.cache(false);
    const filesList = []
    for (const file of files) {
        try {
            const filePathName = file.path;
            const newFileName = extChanger(filePathName, 'webp').filenameFull
            filesList.push(newFileName)
            for (const size of sizesConvertTo) {
                let resized
                if (size.type === 'carouselMaxFull' || size.type === 'carouselMaxMedium' || size.type === 'carouselMaxSmall') {
                    resized = await sharp(filePathName)
                        .resize({
                            width: imageSizes[size.type].w,
                            height: imageSizes[size.type].h,
                            fit: 'outside',
                            withoutEnlargement: true,
                            position: 'centre'
                        })
                        .resize({
                            width: imageSizes[size.type].w,
                            height: imageSizes[size.type].h,
                            withoutEnlargement: true,
                            fit: 'cover',
                            position: 'centre'
                        })  
                        .toFormat(format)
                        .toBuffer()
                } else {
                    resized = await sharp(filePathName) 
                        .resize({
                            width: imageSizes[size.type].w,
                            height: imageSizes[size.type].h,
                            fit: 'outside',
                            withoutEnlargement: true
                        }) 
                        .toFormat(format)
                        .toBuffer()
                }

                
                const fileToUpload = {
                    content: resized,
                    fileName: newFileName
                }

                await filesUploaderS3({
                    bucketName: '3di',
                    folderName: `${size.path}/`,
                    files: [fileToUpload],
                    checkFolder: false,
                })
                
            }
        } catch (error) {
            throw error
        }
    }
    
    return {
        //paths: sizesConvertTo.reduce((acc, size) => ({...acc, [size.type]: `${process.env.pathToStorage}/${size.path}`}), {}) as Record<TImageSizes, string>,

        filesList
    }
    
}



interface IResizeAndSave {
    basePath: string
    sizes: TImageSizes[] // ["thumb", "preview", "small", "medium", "full", "carouselMax"]
    saveFormat?: string
    clearDir?: boolean
    files: IMulterFile[]
}




const resizeAndSaveS3 = async ({files=[], clearDir = false, basePath = allPaths.pathToTemp, saveFormat = 'webp', sizes = []}: IResizeAndSave) => {
    try {
        if (clearDir) {
            for (const size of sizes) {
                await folderCleanerS3(process.env.s3BucketName, `${basePath}/${size}/`)
            }
        }
    
        sharp.cache(false);
        const filesList = []

        for (const file of files) {
            try {
                const filePathName = file.path;
                const newFileName = extChanger(filePathName, 'webp').filenameFull
                filesList.push(newFileName)
                for (const size of sizes) {
                    let resized
                    if (size === 'carouselMaxFull' || size === 'carouselMaxMedium' || size === 'carouselMaxSmall') {
                        resized = await sharp(filePathName)
                            .resize({
                                width: imageSizes[size].w,
                                height: imageSizes[size].h,
                                fit: 'outside',
                                withoutEnlargement: true,
                                position: 'centre'
                            })
                            .resize({
                                width: imageSizes[size].w,
                                height: imageSizes[size].h,
                                withoutEnlargement: true,
                                fit: 'cover',
                                position: 'centre'
                            })  
                            .toFormat(saveFormat)
                            .toBuffer()
                    } else {
                        resized = await sharp(filePathName) 
                            .resize({
                                width: imageSizes[size].w,
                                height: imageSizes[size].h,
                                fit: 'outside',
                                withoutEnlargement: true
                            }) 
                            .toFormat(saveFormat)
                            .toBuffer()
                    }
    
                    
                    const fileToUpload = {
                        content: resized,
                        fileName: newFileName
                    }
    
                    await filesUploaderS3({
                        bucketName: '3di',
                        folderName: `${basePath}/${size}/`,
                        files: [fileToUpload],
                        checkFolder: false,
                    })
                    
                }
            } catch (error) {
                throw error
            }
        }
        
        return {
            filesList
        }
        
        
    } catch (error) {
        throw error        
    } 
    
}

export { resizeAndSaveS3, imagesResizerUploaderS3 } 