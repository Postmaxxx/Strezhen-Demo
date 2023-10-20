import { IAllCache } from '../data/cache'
import { allPaths, colorSizes } from '../data/consts'
const cache: IAllCache = require('../data/cache')
import { IColor } from "../models/Color"
import { folderCleanerS3 } from '../processors/aws'
import { resizeAndSaveS3 } from '../processors/sharp'
import { IMulterFile } from './user'
const { Router } = require("express")
const Colors = require("../models/Color")
const router = Router()
const authMW = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const isAdmin = require('../middleware/isAdmin')
const fileSaver = require('../routes/files')
const whoIs = require('../middleware/whoIs')


router.post('/create', 
    [authMW, 
    isAdmin],
    fileSaver,
    async (req, res) => {
        try {
            const { name, active } = JSON.parse(req.body.data )
            const fileThumb = req.files[0] as IMulterFile
            const fileFull = req.files[1] as IMulterFile
            const color: IColor = new Colors({ name, active })
            const colorId = color._id
            
            
            const { filesList: fileThumbName } = await resizeAndSaveS3({
                files: [fileThumb],
                clearDir: true,
                saveFormat: 'webp',
                basePath: `${allPaths.pathToImages}/${allPaths.pathToColors}/${colorId}`,
                sizes: [colorSizes[0]]
            })

            const { filesList: fileFullName } = await resizeAndSaveS3({
                files: [fileFull],
                clearDir: true,
                saveFormat: 'webp',
                basePath: `${allPaths.pathToImages}/${allPaths.pathToColors}/${colorId}`,
                sizes: [colorSizes[1]]
            })

            color.urls = {
                thumb: `${process.env.pathToStorage}/${allPaths.pathToImages}/${allPaths.pathToColors}/${colorId}/${colorSizes[0]}/${fileThumbName[0]}`,
                full:  `${process.env.pathToStorage}/${allPaths.pathToImages}/${allPaths.pathToColors}/${colorId}/${colorSizes[1]}/${fileFullName[0]}`,
            }
            
            
            await color.save()
            cache.colors.obsolete = true
            cache.fibers.obsolete = true
            return res.status(201).json({message: {en: 'Color created', ru: 'Цвет создан'}})
        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server ${e}, try again later`, ru: `Ошибка на сервере ${e}, попробуйте позже`}})
        }
    }
)


router.put('/edit', 
    [authMW, 
    isAdmin],
    fileSaver,
    async (req, res) => {
        try {       
            const { name, _id, active } = JSON.parse(req.body.data )
            const fileThumb = req.files[0] as IMulterFile
            const fileFull = req.files[1] as IMulterFile

            const { filesList: fileThumbName } = await resizeAndSaveS3({
                files: [fileThumb],
                clearDir: true,
                saveFormat: 'webp',
                basePath: `${allPaths.pathToImages}/${allPaths.pathToColors}/${_id}`,
                sizes: [colorSizes[0]]
            })

            const { filesList: fileFullName } = await resizeAndSaveS3({
                files: [fileFull],
                clearDir: true,
                saveFormat: 'webp',
                basePath: `${allPaths.pathToImages}/${allPaths.pathToColors}/${_id}`,
                sizes: [colorSizes[1]]
            })

            const urls = {
                thumb: `${process.env.pathToStorage}/${allPaths.pathToImages}/${allPaths.pathToColors}/${_id}/${colorSizes[0]}/${fileThumbName[0]}`,
                full:  `${process.env.pathToStorage}/${allPaths.pathToImages}/${allPaths.pathToColors}/${_id}/${colorSizes[1]}/${fileFullName[0]}`,
            }

            await Colors.findOneAndUpdate({_id}, {name, urls, active}) 

            cache.colors.obsolete = true
            cache.fibers.obsolete = true
            return res.status(200).json({message: {en: 'Color changed', ru: 'Цвет изменен'}})
        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server ${e}, try again later`, ru: `Ошибка на сервере ${e}, попробуйте позже`}})
        }
    }
)





router.get('/load-all', 
    [whoIs],
    async (req, res) => {
    try {
        const { isAdmin } = req.user

        const err = await cache.colors.control.load()
        if (err) {
            return res.status(500).json(err)
        }  
        const filteredColors = cache.colors.data.filter(color => color.active) || []
        return res.status(200).json({colors: isAdmin ? cache.colors.data : filteredColors})
    } catch (e) {
        return res.status(500).json({ message:{en: `Something wrong with server ${e}, try again later`, ru: `Ошибка на сервере ${e}, попробуйте позже`}})
    }
})



router.delete('/delete', 
    [authMW, 
    isAdmin,
    check('_id')
          .exists()
          .withMessage({en: 'id missed', ru: 'не указан id'})
    ],
    async (req, res) => {
        
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            //console.log(errors.array().map(error => error.msg));
            return res.status(400).json({
                errors: errors.array().map(error => error.msg),
                message: {en: 'Errors in color data', ru: 'Ошибки в данных цвета'}
            })
        }
        
        try {
            const { _id } = req.body 
            await Colors.findOneAndDelete({_id})
            cache.colors.obsolete = true
            cache.fibers.obsolete = true
            await folderCleanerS3(process.env.s3BucketName, `${allPaths.pathToImages}/${allPaths.pathToColors}/${_id}/`)
            return res.status(200).json({message: {en: 'Color deleted', ru: 'Цвет удален'}})
        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server ${e}, try again later`, ru: `Ошибка на сервере ${e}, попробуйте позже`}})
        }
    }
)


module.exports = router

export {}