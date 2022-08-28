import 'dotenv/config'
import 'reflect-metadata'
import { cleanEnv, num, str, bool } from 'envalid'

export const Env = cleanEnv(process.env, {
    NODE_ENV: str(),

    WINDOW_HEIGHT: num(),
    WINDOW_WIDTH: num(),

    AUTOMATE_BUTTONS: bool(),
    AUTOMATE_FORMS: bool(),
    BASE_SLEEP_TIME: num(),

    BUTTON_TAGS: str(),
    TEXT_BOX_TAGS: str(),
    INPUT_TAGS: str(),
    LABEL_TAGS: str(),
    NAV_TAGS: str(),
    RADIO_TAGS: str(),
    DROP_DOWN_ITEM_TAGS: str()
})
