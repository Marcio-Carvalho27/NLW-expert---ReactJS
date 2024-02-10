import * as Dialog from '@radix-ui/react-dialog'
import { Coins, X } from 'lucide-react'
import { ChangeEvent, ChangeEventHandler, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface newNoteCardProps {
    onNoteCreated: (content:string) => void
}

let SpeechRecognition: SpeechRecognition | null

export function NewNoteCard( { onNoteCreated }: newNoteCardProps){
    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    function handleStartEditor() {
        setShouldShowOnBoarding(false)
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
        setContent(event.target.value)
        if (event.target.value == "") {
            setShouldShowOnBoarding(true)
        }
    }

    function handleCloseNote(){
        handleStopRecording()
        setContent('')
        setShouldShowOnBoarding(true)
    }

    function handleSaveNote(event: FormEvent){
        event.preventDefault()

        if (content == '') {
            return
        }

        onNoteCreated(content)
        
        setContent('')
        setShouldShowOnBoarding(true)

        toast.success('Nota criada com sucesso')

    }

    function handleStartRecording() {
        

        const isSpeechRecognitionAPIAvaible = 'SpeechRecognition' in window
            || 'webkitSpeechRecognition' in window
        
        if (!isSpeechRecognitionAPIAvaible) {
            alert('Infelizmente o seu navegador não suporta a API')
            return
        }

        setIsRecording(true)
        setShouldShowOnBoarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        SpeechRecognition = new SpeechRecognitionAPI()

        SpeechRecognition.lang = "pt-BR"
        SpeechRecognition.continuous = true
        SpeechRecognition.maxAlternatives = 1
        SpeechRecognition.interimResults = true

        SpeechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        SpeechRecognition.onerror = (event) => {
            console.error(event)
        }

        SpeechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (SpeechRecognition != null){
            SpeechRecognition.stop()
        }
    }


    return(
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none"> 
                <span className="text-sm font-medium text-slate-200">
                    Adicionar Nota
                </span>
                <p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />

                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
                    <Dialog.Close 
                        onClick={handleCloseNote}
                        className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                            <X className="size-5"/>
                    </Dialog.Close>
                    
                    <form className="flex-1 flex flex-col">

                        <div className="flex flex-1 flex-col gap-3 p-5 ">
                            <span className="text-sm font-medium text-slate-100">
                            Adicionar nota
                            </span>
                            {shouldShowOnBoarding ? (
                                <p className="text-sm leading-6 text-slate-400">
                                    Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota em áudio</button> ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline"> utilize apenas texto</button>. 
                                </p>
                            ) : (
                            <textarea 
                                    autoFocus 
                                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                    onChange={handleContentChange}
                                    value={content}
                                />
                            )}
                            
                        </div>
                        {isRecording ? (
                            <button 
                                type="button"
                                onClick={handleStopRecording}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100">
                                    <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                                    Gravando (clique p/ interromper)!
                            </button>                            
                        ) : (
                            <button 
                                type="button"
                                onClick={handleSaveNote}
                                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500">
                                    Salvar nota
                            </button>    
                        )}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>

    )
}