import { createRoot } from 'react-dom/client';
import NewsItem from '../components/NewsItem/NewsItem';
import { act, waitFor, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import { INewsItemShort } from '../interfaces';
import '@testing-library/jest-dom/extend-expect'


describe('NewsItem', () => {
    let _container: HTMLDivElement
    let newsItem: INewsItemShort = {
        _id: 'id',
        header: {en: 'news header en', ru: 'news header ru'},
        date: new Date(),
        short: {en: 'short en', ru: 'short ru'},
        images: {
            files: ['1', '2', '3'],
            basePath: 'base',
            sizes: [{subFolder: 'small', w: 100, h: 100}]
        }
    }

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container)
    })



    afterEach(() => {
        document.body.removeChild(_container)
    })



    test('should show news', async () => {
        let _root: ReturnType<typeof createRoot>
        await act(async () => {
            _root = createRoot(_container)
            _root.render(		    
                <HashRouter>
                    <NewsItem lang='en' newsPiece={newsItem}/>
                </HashRouter>
            )
        }) 

        
        await waitFor(() => {
            let _newsItem = document.querySelector('article.news-item')       
            expect(_newsItem).toBeInTheDocument()
            expect(screen.getByText('news header en')).toBeInTheDocument()
            expect(screen.getByText('short en')).toBeInTheDocument()
            let _link: HTMLLinkElement = screen.getByText('Read more...')
            expect(_link).toBeInTheDocument()
            expect(_link.href.includes('/news/id')).toBe(true)
            expect(_newsItem?.querySelector('.img-cont')?.childNodes.length).toBe(2)
        })
    })


})