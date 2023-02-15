import {createContext, ReactNode, useEffect, useMemo, useState} from "react";
import {EnumTheme} from "~content";
import {Storage} from "@plasmohq/storage";
import {EnumLineSpacing, Fonts} from "~components/setting";

interface SettingObject {
    fontSize?: number
    theme?: EnumTheme
    pageWidth?: number
    lineSpacing?: EnumLineSpacing
    fontFamily?: string
}

interface TypeSettingContext {
    settingObject: SettingObject,
    setSetting: (value: SettingObject) => Promise<void>
}

export const SettingContext = createContext({} as TypeSettingContext)

const SettingStorageKey = '__READSOMETHING_SETTING_V1'

export default function SettingProvider({children}: { children: ReactNode }) {
    const [settingObject, setSettingObject] = useState({} as SettingObject);
    const storage = useMemo(() => new Storage(), []);

    const _setData = async function (data: SettingObject) {
        setSettingObject({...Object.assign(settingObject, data)})

        await storage.set(SettingStorageKey, JSON.stringify(settingObject))
    }

    const init = async function () {
        let fontSize = 18
        let theme = EnumTheme.Heti
        let pageWidth = 800
        let lineSpacing = EnumLineSpacing.Medium
        let fontFamily = Fonts[0]

        try {
            const setting = JSON.parse(await storage.get(SettingStorageKey))

            if (setting) {
                const {
                    fontSize: _fontSize,
                    theme: _theme,
                    pageWidth: _pageWidth,
                    lineSpacing: _lineSpacing,
                    fontFamily: _fontFamily
                } = setting

                if (_fontSize) fontSize = _fontSize
                if (_theme) theme = _theme
                if (_pageWidth) pageWidth = _pageWidth
                if (_lineSpacing) lineSpacing = _lineSpacing
                if (_fontFamily) fontFamily = _fontFamily
            }
        } catch (e) {
            // ignore
            console.error(e)
        } finally {
            await _setData({fontSize, theme, pageWidth, lineSpacing, fontFamily})
        }
    }
    const setSetting = async function (setting: SettingObject) {
        await _setData(setting)
    }

    useEffect(() => {
        void init()
    }, []);

    return <SettingContext.Provider value={{
        settingObject,
        setSetting
    }}>
        {children}
    </SettingContext.Provider>
}