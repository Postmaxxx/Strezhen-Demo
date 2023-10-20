import "./message.scss"


interface IProps {
    buttonAdd?: {
        text: string,
        action: () => void
    }
    buttonClose?: {
        text: string,
        action: () => void
    }
    header?: string
    text?: string[]
    status?: string
}


const MessageNew: React.FC<IProps> = ({buttonAdd, buttonClose, header, status, text}): JSX.Element => {
    return (
        <div className={`message_modal ${status || ''}`}>
            <h3>{header || ''}</h3>
            <div className="message_modal__text">
                {text && text.map((currentText, index) => <p key={index}>{currentText}</p>)}
            </div>
            <div className="message_modal__buttons">
                {buttonAdd && 
                    <button 
                        className="button_blue button_light"
                        onClick={buttonAdd?.action}>
                            {buttonAdd?.text}
                    </button>}
                {buttonClose && 
                    <button 
                        className="button_blue button_light"
                        onClick={buttonClose?.action}>
                        {buttonClose?.text}
                    </button>}
            </div>
        </div>
    )
}

export default MessageNew