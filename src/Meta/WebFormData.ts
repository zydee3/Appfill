import { WebPage } from '@/WebPage'

export async function getAnswer(this: WebPage, question: string): Promise<string> {
    question = question.toLowerCase()
    for(const entry of this.qaEntries){
        for(const alias of entry.question){
            if(question.includes(alias)) {
                return entry.answer
            }
        }
    }
    return ''
}