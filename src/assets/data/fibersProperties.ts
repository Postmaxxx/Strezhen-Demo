import { TId, TLangText } from "../../interfaces"
import { selector } from "../js/consts"

export interface IFiberProperties {
    _id: TId
    name: TLangText
    tip: TLangText
    unit: TLangText
    type: 'string' | keyof typeof selector
}


export const fibersProperties = [
    {
        _id: 'strength',
        name: {
            en: 'Strength',
            ru: 'Прочность'
        },
        tip: {
            en: 'The maximum stress that a material can withstand without breaking.',
            ru: 'Максимальная нагрузка, которую материал может выдержать без разрушения.'
        },
        unit: {
            en: 'MPa',
            ru: 'Мпа'
        },
        type: 'string'
    },
    {
        _id: 'stiffnes',
        name: {
            en: 'Stiffnes',
            ru: 'Жесткость'
        },
        tip: {
            en: "Stiffness is the measure of a material or structure's resistance to deformation when subjected to external forces.",
            ru: 'Жёсткость - это мера сопротивления материала или структуры деформации при воздействии внешних сил.'
        },
        unit: {
            en: ' / 10',
            ru: ' / 10'
        },
        type: '10'
    },
    {
        _id: 'durability',
        name: {
            en: 'Durability',
            ru: 'Долговечность'
        },
        tip: {
            en: "Durability is the ability of a material or object to withstand wear, pressure, or damage over an extended period of time.",
            ru: 'Прочность - это способность материала или объекта выдерживать износ, давление или повреждения в течение продолжительного периода времени.'
        },
        unit: {
            en: ' / 10',
            ru: ' / 10'
        },
        type: '10'
    },
    {
        _id: 'resistantImpact',
        name: {
            en: 'Impact resistant',
            ru: 'Ударостойкость'
        },
        tip: {
            en: 'Impact resistant refers to the quality of a material or object to withstand sudden shocks or collisions without breaking or sustaining significant damage.',
            ru: 'Устойчивость к удару означает способность материала или объекта выдерживать внезапные удары или столкновения без разрушения или значительных повреждений.'
        },
        unit: {
            en: ' / 10',
            ru: ' / 10'
        },
        type: '10'
    },
    {
        _id: 'minTemp',
        name: {
            en: 'Min usage temp',
            ru: 'Мин. t использования'
        },
        tip: {
            en: 'Minimum temperature at which the material can be used.',
            ru: 'Минимальная температура, при которой материал может быть использован.'
        },
        unit: {
            en: '°C',
            ru: '°C'
        },
        type: 'string'
    },
    {
        _id: 'maxTemp',
        name: {
            en: 'Max usage temp',
            ru: 'Макс. t использования'
        },
        tip: {
            en: 'Maximum temperature at which the material can be used.',
            ru: 'Максимальная температура, при которой материал может быть использован.'
        },
        unit: {
            en: '°C',
            ru: '°C'
        },
        type: 'string'
    },
    {
        _id: 'thermalExpansion',
        name: {
            en: 'Thermal expansion',
            ru: 'Темп. расширение'
        },
        tip: {
            en: 'Thermal expansion refers to the tendency of a material to increase in size as its temperature rises, and to contract as its temperature decreases.',
            ru: 'Тепловое расширение - это свойство материала увеличиваться в размерах при повышении температуры и сжиматься при её снижении.'
        },
        unit: {
            en: 'µm/m-°C',
            ru: 'µm/m-°C'
        },
        type: 'string'

    },
    {
        _id: 'density',
        name: {
            en: 'Density',
            ru: 'Плотность'
        },
        tip: {
            en: 'Density is a measure of mass per unit volume of a substance.',
            ru: 'Плотность - это мера массы в единицу объема вещества.'
        },
        unit: {
            en: 'g/cm3',
            ru: 'г/см3'
        },
        type: 'string'

    },
    {
        _id: 'flexible',
        name: {
            en: 'Flexible',
            ru: 'Гибкость'
        },
        tip: {
            en: 'Flexible refers to the quality of being able to bend, stretch, or adapt easily without breaking.',
            ru: 'Гибкость означает способность легко сгибаться, растягиваться или приспосабливаться под необходимую форму без поломки.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'
    },
    {
        _id: 'elastic',
        name: {
            en: 'Elastic',
            ru: 'Эластичность'
        },
        tip: {
            en: 'Elastic describes the ability of a material to return to its original shape and size after being stretched or compressed.',
            ru: 'Эластичность описывает способность материала возвращаться к своей исходной форме и размерам после растяжения или сжатия.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'soft',
        name: {
            en: 'Soft',
            ru: 'Мягкость'
        },
        tip: {
            en: 'Soft refers to a texture or quality that is smooth, yielding, and not hard or rigid to the touch.',
            ru: 'Мягкость описывает текстуру или качество, которое гладкое, уступчивое и не жесткое на ощупь.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'composite',
        name: {
            en: 'Composite',
            ru: 'Комбинирование'
        },
        tip: {
            en: 'The ability to combine the material with various additives to obtain additional properties.',
            ru: 'Возможность комбинировать материал с различными добавками для получения дополнительных свойств.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'resistantUV',
        name: {
            en: 'UV resistant',
            ru: 'Стойкость к УФ'
        },
        tip: {
            en: 'UV resistant indicates the ability of a material to withstand the damaging effects of ultraviolet (UV) radiation from the sun or other sources.',
            ru: 'Устойчивость к УФ-излучению указывает на способность материала выдерживать разрушительное воздействие ультрафиолетового (УФ) излучения от солнца или других источников.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'resistantWater',
        name: {
            en: 'Water resistant',
            ru: 'Водостойкость'
        },
        tip: {
            en: 'Water resistant refers to the capability of a material or object to resist the penetration or absorption of water.',
            ru: 'Водостойкость означает способность материала или объекта сопротивляться проникновению или поглощению воды.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'dissolvable',
        name: {
            en: 'Dissolvable',
            ru: 'Растворимость'
        },
        tip: {
            en: 'The ability to use household solvents to work with the material',
            ru: 'Возможность использовать для работы с материалом бытовые растворители'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'resistantHeat',
        name: {
            en: 'Heat resistant',
            ru: 'Прочность'
        },
        tip: {
            en: 'Heat resistant describes the ability of a material to withstand high temperatures without melting, deforming, or degrading.',
            ru: 'Теплостойкость - способность материала выдерживать высокие температуры без плавления, деформации или разрушения.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'resistantChemically',
        name: {
            en: 'Chemically resistant',
            ru: 'Хим. устойчивость'
        },
        tip: {
            en: 'Chemically resistant indicates the ability of a material to withstand the damaging effects of various chemicals or corrosive substances without undergoing significant degradation or reaction.',
            ru: 'Устойчивость к химическим воздействиям указывает на способность материала выдерживать разрушительное воздействие различных химических веществ или коррозионных веществ без существенного разрушения или реакции.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'resistantFatigue',
        name: {
            en: 'Fatigue resistant',
            ru: 'Усталостостойкость'
        },
        tip: {
            en: 'Fatigue resistant refers to the ability of a material to withstand repeated loading and unloading cycles without experiencing failure or damage.',
            ru: 'Устойчивость к усталости обозначает способность материала выдерживать повторяющиеся циклы нагрузки и разгрузки без отказа или повреждения.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'cutting',
        name: {
            en: 'Cutting',
            ru: 'Возможность резки'
        },
        tip: {
            en: 'The ability to process the material by cutting.',
            ru: 'Возможность обрабатывать материал с помощью резки.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'grinding',
        name: {
            en: 'Grinding',
            ru: 'Шлифуемость'
        },
        tip: {
            en: 'The ability to process the material by Grinding.',
            ru: 'Возможность обрабатывать материал с помощью шлифовки.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '3'

    },
    {
        _id: 'price',
        name: {
            en: 'Relative price',
            ru: 'Отн. цена'
        },
        tip: {
            en: 'Relative cost of the material.',
            ru: 'Относительная стоимость материала.'
        },
        unit: {
            en: '',
            ru: ''
        },
        type: '5'
    },
    {
        _id: 'priceGr',
        name: {
            en: 'Price for gr.',
            ru: 'Цена за грамм'
        },
        tip: {
            en: 'Cost of the one gr. of the material.',
            ru: 'Стоимость одного грамма материала.'
        },
        unit: {
            en: 'rub',
            ru: 'руб'
        },
        type: 'string'
    },
] satisfies IFiberProperties[]
