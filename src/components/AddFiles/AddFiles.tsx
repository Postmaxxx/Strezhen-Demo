import { TLang } from '../../interfaces'
import './add-files.scss'
import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo} from 'react'
import iconFileQuestion from '../../assets/img/icon_file_question.svg'
import Delete from "../../components/Delete/Delete";
import { prevent } from '../../../src/assets/js/processors';
import { imageExtentions } from '../../../src/assets/js/consts';

interface IProps {
    lang: TLang
    multiple: boolean
    id: string
}

export interface IAddFilesFunctions {
    clearAttachedFiles: () => void;
    getFiles: () => File[] //get all files from files[]
    addFiles: (filesToAdd: File[]) => void //add files to files[]
    replaceFiles: (filesToAdd: File[]) => void //add files to files[]
}

interface IFileToShow {
    name: string, //filename
    content: string //content of file OR iconFileQuestion if file not in imageExtentions
}

const AddFiles = forwardRef<IAddFilesFunctions, IProps>(({lang, multiple, id}, ref) => {
    useImperativeHandle(ref, () => ({
        clearAttachedFiles() {
            clearFiles()
        },
        getFiles() {return files},
        addFiles(filesToAdd: File[]) {
            setFiles(prev => ([...prev, ...filesToAdd]))
        },
        replaceFiles(filesToAdd: File[]) {
            setFiles([...filesToAdd])
        }
    }));
    

    const _dropArea = useRef<HTMLDivElement>(null)
    const _files = useRef<HTMLInputElement>(null)
    const _filesGallery = useRef<HTMLDivElement>(null)
    let dragCounter: number = 0
    const [files, setFiles] = useState<File[]>([]) //pure files
    const [filesToShow, setFilesToShow] = useState<IFileToShow[]>([]) //files for preview:

    const preventDefaults = (e: DragEvent | React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)
    }

    const dragEnter = (e: DragEvent) => {
        preventDefaults(e)
        dragCounter++
        _dropArea.current?.classList.add('active')
    }

    const dragOver = (e: DragEvent) => {
        preventDefaults(e)
        _dropArea.current?.classList.add('active')
    }

    const dragLeave = (e: DragEvent) => {
        preventDefaults(e)
        dragCounter--
        dragCounter === 0 && _dropArea.current?.classList.remove('active')
    }

    
    const dragDrop = (e: DragEvent) => {
        preventDefaults(e)
        if (!e.dataTransfer?.files) return 
        _dropArea.current?.classList.remove('active')
        multiple ? setFiles(prev => [...prev, ...(e.dataTransfer?.files as FileList)]) : setFiles([e.dataTransfer?.files[0]])
    }
    
    const onSelectFiles = () => {  
        if (!_files.current?.files) return 
        _dropArea.current?.classList.remove('active')
        multiple ? setFiles(prev => [...prev, ...(_files.current?.files as FileList)]) : setFiles([(_files.current.files)[0]])
    }

    const clearFiles = useCallback(() => {
        setFiles([])
    }, [])


    useEffect(() => {
        if (!_dropArea.current) { return }
        _dropArea.current.addEventListener('dragenter', dragEnter, false);
        _dropArea.current.addEventListener('dragover', dragOver, false);
        _dropArea.current.addEventListener('dragleave', dragLeave, false);
        _dropArea.current.addEventListener('drop', dragDrop, false);
        return () => {
            _dropArea.current?.removeEventListener('dragenter', dragEnter, false);
            _dropArea.current?.removeEventListener('dragover', dragOver, false);
            _dropArea.current?.removeEventListener('dragleave', dragLeave, false);
            _dropArea.current?.removeEventListener('drop', dragDrop, false);
        }

    })


    const fillFilesToShow = useCallback(async (filesList: File[]) => {
        const reader = new FileReader();
        const filesWithContent: typeof filesToShow = await filesList.reduce(async (acc: Promise<IFileToShow[]>, currentFile: File) => {
            const result = await acc
            return new Promise<IFileToShow[]>(async (res) => {
                reader.readAsDataURL(currentFile)
                reader.onloadend = () => {                   
                    res([...result, {
                        name: currentFile.name,//currentFile.name.includes('.') ? currentFile.name.split('.').pop() || '' : currentFile.name, //get filename without extention
                        content: (imageExtentions.includes(currentFile.name.split('.').pop() || '')) ? reader.result as string : iconFileQuestion,
                    }])
                }
            })
        }, Promise.resolve([]))
        setFilesToShow(filesWithContent)
    }, [])



    useEffect(() => {
        fillFilesToShow(files)
    }, [files])


    const onRemoveClick = (e: React.MouseEvent<HTMLButtonElement>,index: number) => {
        prevent(e)
        setFiles(prev => (prev.filter((item, i) => i !== index)))
    }


    const filesList = useMemo(() => {
        return filesToShow.map((file, i) => {
            return (
                <div className="previewer__card" key={file.name + i}>
                    <div className="previewer__card__img-cont">
                        <img src={file.content} alt={file.name} />
                    </div>
                    <span className="previewer__card__title">{file.name.length < 30 ? file.name : `${file.name.slice(0, 30)}...`}</span>
                    <button className="previewer__card__remover" onClick={(e) => onRemoveClick(e, i)}>
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.0"  viewBox='0 0 100 100' strokeWidth='20'>
                            <path d="M 6.3895625,6.4195626 C 93.580437,93.610437 93.580437,93.610437 93.580437,93.610437"/>
                            <path d="M 6.3894001,93.6106 C 93.830213,6.4194003 93.830213,6.4194003 93.830213,6.4194003"/>
                        </svg>
                    </button>
                </div>
            )
        })
    }, [filesToShow])


    return (
        <div className="files-adder" ref={_dropArea}>
            {files.length === 0 && 
                <svg className='files-adder__arrow' width="16" height="25" viewBox="0 0 16 25" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.31719 23.7322C7.71856 24.1116 8.35148 24.0937 8.73084 23.6924L14.9129 17.1516C15.2923 16.7502 15.2745 16.1173 14.8731 15.7379C14.4717 15.3586 13.8388 15.3764 13.4594 15.7778L7.96424 21.5918L2.15022 16.0966C1.74885 15.7172 1.11593 15.7351 0.73657 16.1365C0.357206 16.5378 0.375048 17.1707 0.776422 17.5501L7.31719 23.7322ZM6.36655 0.404461L7.00449 23.0336L9.00369 22.9773L8.36576 0.348102L6.36655 0.404461Z"/>
                </svg>
            }
            <div className="files-adder__label">
                <label htmlFor={id} tabIndex={0} onKeyDown={e => {e.code === 'Enter' && _files.current?.click()}}>{lang === 'en' ? 'Add files' : 'Выберите файлы'}</label> 
                {files.length === 0 && <span>{lang === 'en' ? ' or drag it here' : 'для добавления или перетащите их сюда'}</span>}
            </div>
            <input className='button_add-files' id={id} type="file" multiple={multiple} onChange={onSelectFiles} ref={_files} tabIndex={-1}/>
            <div className="files-adder__previewer" ref={_filesGallery}>
                {filesList}
            </div>

            {files.length > 0 &&
                <div className="files-adder__cleaner">
                    <Delete<string> remove={clearFiles} idInstance="cartCleaner" lang={lang} disabled={false}/>
                </div>
            }
        </div>
    );
})

export default AddFiles