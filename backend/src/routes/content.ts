const { Router } = require("express")
const Content = require("../models/Content")
const router = Router()
const authMW = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
import { IAllCache } from '../data/cache'
import { allPaths, carouselSizes, imageSizes } from "../data/consts";
import { foldersCleaner} from "../processors/fsTools";
import { resizeAndSaveS3 } from "../processors/sharp";
import { IMulterFile } from "./user";
const cache: IAllCache = require('../data/cache')
const fileSaver = require('../routes/files')
const sharp = require('sharp')
sharp.cache(false);



router.put('/carousel', 
    [authMW, isAdmin],
    fileSaver,
    async (req, res) => {

        try {           
            const files: IMulterFile[] = req.files

            const basePath = `${allPaths.pathToImages}/${allPaths.pathToCarousel}`
            const { filesList } = await resizeAndSaveS3({
                files,
                clearDir: true,
                saveFormat: 'webp',
                basePath,
                sizes: carouselSizes
            })
            
            await foldersCleaner([allPaths.pathToTemp])
            
            const carousel = {
                images: {
                    files: filesList,
                    basePath: `${process.env.pathToStorage}/${basePath}`,
                    sizes: carouselSizes.map(size => ({
                        subFolder: size,
                        w: imageSizes[size]?.w,
                        h: imageSizes[size]?.h,
                    }))
                }
            }
            
            const exist = await Content.findOne()
            if (!exist) {
                
                const content = new Content({carousel})
                await content.save()
                return res.status(200).json({message: {en: 'Content changed', ru: 'Контент отредактирован'}})
            } 
            await Content.findOneAndUpdate({}, {carousel})
            
            cache.content.obsolete = true

            return res.status(200).json({message: {en: 'Content changed', ru: 'Контент отредактирован'}})
        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)




router.get('/carousel', 
    async (req, res) => {
        try {
            const err = await cache.content.control.load()
            
            if (err) {
                return res.status(500).json(err)
            }
            const carousel = cache.content.data.carousel
            
            return res.status(200).json({carousel})
        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)




export {};

module.exports = router
